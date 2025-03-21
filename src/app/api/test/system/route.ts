import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/get-payload';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    const payload = await getPayloadClient();
    
    // Database health check
    const dbStartTime = performance.now();
    await payload.find({ collection: 'products', limit: 1 });
    const dbLatency = performance.now() - dbStartTime;
    
    // Cache health check
    let cacheStatus = { connected: false, latency: 0, keys: 0 };
    try {
      const cacheStartTime = performance.now();
      await redis.ping();
      const cacheLatency = performance.now() - cacheStartTime;
      cacheStatus = {
        connected: true,
        latency: Math.round(cacheLatency),
        keys: await redis.dbsize()
      };
    } catch (cacheError) {
      console.warn('Cache health check failed:', cacheError);
    }
    
    // Server health check
    const serverStartTime = performance.now();
    const memory = process.memoryUsage();
    const cpu = process.cpuUsage();
    const uptime = process.uptime();
    const serverLatency = performance.now() - serverStartTime;

    return NextResponse.json({
      status: 'operational',
      database: {
        connected: true,
        latency: Math.round(dbLatency),
        collections: Object.keys(payload.collections).length
      },
      cache: cacheStatus,
      server: {
        memory: Math.round((memory.heapUsed / memory.heapTotal) * 100),
        cpu: Math.round((cpu.user + cpu.system) / 1000000),
        uptime: Math.round(uptime),
        latency: Math.round(serverLatency)
      }
    });
  } catch (error) {
    console.error('System health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to check system health',
        details: {
          database: false,
          cache: false,
          server: false
        }
      },
      { status: 500 }
    );
  }
} 