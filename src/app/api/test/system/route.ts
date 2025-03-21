import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/get-payload';
import { mediaCache } from '@/lib/redis';

interface CacheStatus {
  connected: boolean;
  latency: number;
  keys: number;
  mediaKeys: number;
  productKeys: number;
  memory: number;
  hitRate: number;
}

export async function GET() {
  try {
    const payload = await getPayloadClient();
    
    // Database health check
    const dbStartTime = performance.now();
    await payload.find({ collection: 'products', limit: 1 });
    const dbLatency = performance.now() - dbStartTime;
    
    // Cache health check with detailed metrics
    let cacheStatus: CacheStatus = {
      connected: false,
      latency: 0,
      keys: 0,
      mediaKeys: 0,
      productKeys: 0,
      memory: 0,
      hitRate: 0
    };

    try {
      const cacheStartTime = performance.now();
      
      // Test basic Redis connection
      await mediaCache.getMediaUrl('test', 'test');
      
      // Get cache statistics
      const keys = await mediaCache.redis.keys('*');
      const mediaKeys = keys.filter((key: string) => key.startsWith('media:'));
      const productKeys = keys.filter((key: string) => key.startsWith('product:'));
      
      // Get memory usage from Redis
      const memoryUsage = (await mediaCache.redis.get<string>('memory_usage')) || '0';
      
      // Calculate hit rate (approximate based on recent operations)
      const hitRate = (await mediaCache.redis.get<string>('hit_rate')) || '0';
      const misses = (await mediaCache.redis.get<string>('miss_rate')) || '0';
      const total = parseInt(hitRate) + parseInt(misses);
      const hitRatePercent = total > 0 ? (parseInt(hitRate) / total) * 100 : 0;

      const cacheLatency = performance.now() - cacheStartTime;
      
      cacheStatus = {
        connected: true,
        latency: Math.round(cacheLatency),
        keys: keys.length,
        mediaKeys: mediaKeys.length,
        productKeys: productKeys.length,
        memory: Math.round(parseInt(memoryUsage) / 1024 / 1024), // Convert to MB
        hitRate: Math.round(hitRatePercent)
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
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        latency: Math.round(dbLatency),
        collections: Object.keys(payload.collections).length
      },
      cache: {
        ...cacheStatus,
        metrics: {
          'Total Keys': cacheStatus.keys,
          'Media Keys': cacheStatus.mediaKeys,
          'Product Keys': cacheStatus.productKeys,
          'Memory Used': `${cacheStatus.memory}MB`,
          'Hit Rate': `${cacheStatus.hitRate}%`,
          'Latency': `${cacheStatus.latency}ms`
        }
      },
      server: {
        memory: Math.round((memory.heapUsed / memory.heapTotal) * 100),
        cpu: Math.round((cpu.user + cpu.system) / 1000000),
        uptime: Math.round(uptime),
        latency: Math.round(serverLatency),
        metrics: {
          'Heap Used': `${Math.round(memory.heapUsed / 1024 / 1024)}MB`,
          'Heap Total': `${Math.round(memory.heapTotal / 1024 / 1024)}MB`,
          'RSS': `${Math.round(memory.rss / 1024 / 1024)}MB`,
          'CPU Usage': `${Math.round((cpu.user + cpu.system) / 1000000)}%`,
          'Uptime': `${Math.round(uptime)}s`
        }
      }
    });
  } catch (error) {
    console.error('System health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to check system health',
        timestamp: new Date().toISOString(),
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