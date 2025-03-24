import { NextResponse } from 'next/server';
import { mediaCache, redis } from '@/lib/redis';
import { getPayloadClient } from '@/get-payload';
import os from 'os';

interface CacheStatus {
  connected: boolean;
  latency: number;
  keys: number;
  mediaKeys: number;
  productKeys: number;
  memory: number;
  hitRate: string;
}

export async function GET() {
  try {
    const startTime = performance.now();
    
    // Database health check
    const dbStartTime = performance.now();
    let dbConnected = false;
    try {
      const payload = await getPayloadClient();
      // Test database connection by fetching a single product
      await payload.find({ collection: 'products', limit: 1 });
      dbConnected = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }
    const dbLatency = performance.now() - dbStartTime;

    // Cache health check
    const cacheStartTime = performance.now();
    let cacheStatus: CacheStatus = {
      connected: false,
      latency: 0,
      keys: 0,
      mediaKeys: 0,
      productKeys: 0,
      memory: 0,
      hitRate: '0%'
    };

    try {
      if (redis) {
        // Test Redis connection with a real operation
        const testKey = 'health_check_test';
        await redis.set(testKey, 'test', { ex: 60 });
        const testValue = await redis.get(testKey);
        await redis.del(testKey);
        
        if (testValue === 'test') {
          cacheStatus.connected = true;

          // Get real cache statistics
          const allKeys = await redis.keys('*');
          cacheStatus.keys = allKeys.length;
          cacheStatus.mediaKeys = allKeys.filter((key: string) => key.startsWith('media:')).length;
          cacheStatus.productKeys = allKeys.filter((key: string) => key.startsWith('product:')).length;

          // Get real memory usage from Redis
          const memoryUsage = await redis.get<string>('memory_usage') || '0';
          cacheStatus.memory = Math.round(parseInt(memoryUsage) / (1024 * 1024)); // Convert to MB

          // Get real hit/miss statistics
          const hits = parseInt(await redis.get<string>('hit_rate') || '0');
          const misses = parseInt(await redis.get<string>('miss_rate') || '0');
          const total = hits + misses;
          cacheStatus.hitRate = total > 0 ? `${((hits / total) * 100).toFixed(1)}%` : '0%';
        }
      }
    } catch (error) {
      console.error('Cache health check failed:', error);
    }
    const cacheLatency = performance.now() - cacheStartTime;

    // Server health check with real metrics
    const serverStartTime = performance.now();
    const memory = process.memoryUsage();
    const cpus = os.cpus();
    const totalCpuTime = cpus.reduce((acc, cpu) => {
      return acc + Object.values(cpu.times).reduce((sum, time) => sum + time, 0);
    }, 0);
    const idleCpuTime = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const cpuUsage = ((totalCpuTime - idleCpuTime) / totalCpuTime) * 100;

    const serverMetrics = {
      memory: Math.round((memory.heapUsed / memory.heapTotal) * 100), // Memory usage percentage
      cpu: Math.round(cpuUsage), // CPU usage percentage
      uptime: Math.round(process.uptime()),
      latency: performance.now() - serverStartTime,
      details: {
        heapUsed: Math.round(memory.heapUsed / (1024 * 1024)), // MB
        heapTotal: Math.round(memory.heapTotal / (1024 * 1024)), // MB
        rss: Math.round(memory.rss / (1024 * 1024)), // MB
        cpuCores: cpus.length,
        cpuModel: cpus[0].model,
        platform: process.platform,
        nodeVersion: process.version
      }
    };

    const endTime = performance.now();
    const totalDuration = endTime - startTime;

    return NextResponse.json({
      status: 'success',
      message: 'System health check completed',
      duration: Math.round(totalDuration),
      database: {
        connected: dbConnected,
        latency: Math.round(dbLatency)
      },
      cache: {
        ...cacheStatus,
        latency: Math.round(cacheLatency)
      },
      server: {
        ...serverMetrics,
        latency: Math.round(serverMetrics.latency)
      }
    });
  } catch (error) {
    console.error('System health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to check system health',
        duration: 0,
        database: {
          connected: false,
          latency: 0
        },
        cache: {
          connected: false,
          latency: 0,
          keys: 0,
          mediaKeys: 0,
          productKeys: 0,
          memory: 0,
          hitRate: '0%'
        },
        server: {
          memory: 0,
          cpu: 0,
          uptime: 0,
          latency: 0,
          details: {
            heapUsed: 0,
            heapTotal: 0,
            rss: 0,
            cpuCores: 0,
            cpuModel: 'Unknown',
            platform: process.platform,
            nodeVersion: process.version
          }
        }
      },
      { status: 500 }
    );
  }
} 