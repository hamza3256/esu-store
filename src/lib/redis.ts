import { Redis } from 'ioredis';

// Redis client configuration
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 1,
  lazyConnect: true,
  retryStrategy: (times) => {
    if (times > 3) return null;
    return Math.min(times * 200, 1000);
  }
});

// Cache duration constants (in seconds)
const CACHE_DURATION = {
  IMAGES: 24 * 60 * 60, // 24 hours
  VIDEOS: 24 * 60 * 60, // 24 hours
  PAGES: 5 * 60, // 5 minutes
  PRODUCTS: 15 * 60, // 15 minutes
};

// Cache keys
const CACHE_KEYS = {
  IMAGE: (id: string) => `image:${id}`,
  VIDEO: (id: string) => `video:${id}`,
  PAGE: (path: string) => `page:${path}`,
  PRODUCT: (id: string) => `product:${id}`,
};

// Image caching
export async function cacheImage(id: string, imageData: string): Promise<void> {
  try {
    await redis.set(CACHE_KEYS.IMAGE(id), imageData, 'EX', CACHE_DURATION.IMAGES);
  } catch (error) {
    console.error('Failed to cache image:', error);
  }
}

export async function getCachedImage(id: string): Promise<string | null> {
  try {
    return await redis.get(CACHE_KEYS.IMAGE(id));
  } catch (error) {
    console.error('Failed to get cached image:', error);
    return null;
  }
}

// Video caching
export async function cacheVideo(id: string, videoData: string): Promise<void> {
  try {
    await redis.set(CACHE_KEYS.VIDEO(id), videoData, 'EX', CACHE_DURATION.VIDEOS);
  } catch (error) {
    console.error('Failed to cache video:', error);
  }
}

export async function getCachedVideo(id: string): Promise<string | null> {
  try {
    return await redis.get(CACHE_KEYS.VIDEO(id));
  } catch (error) {
    console.error('Failed to get cached video:', error);
    return null;
  }
}

// Page caching
export async function cachePage(path: string, pageData: string): Promise<void> {
  try {
    await redis.set(CACHE_KEYS.PAGE(path), pageData, 'EX', CACHE_DURATION.PAGES);
  } catch (error) {
    console.error('Failed to cache page:', error);
  }
}

export async function getCachedPage(path: string): Promise<string | null> {
  try {
    return await redis.get(CACHE_KEYS.PAGE(path));
  } catch (error) {
    console.error('Failed to get cached page:', error);
    return null;
  }
}

// Product caching
export async function cacheProduct(id: string, productData: string): Promise<void> {
  try {
    await redis.set(CACHE_KEYS.PRODUCT(id), productData, 'EX', CACHE_DURATION.PRODUCTS);
  } catch (error) {
    console.error('Failed to cache product:', error);
  }
}

export async function getCachedProduct(id: string): Promise<string | null> {
  try {
    return await redis.get(CACHE_KEYS.PRODUCT(id));
  } catch (error) {
    console.error('Failed to get cached product:', error);
    return null;
  }
}

// Cache invalidation
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Failed to invalidate cache:', error);
  }
}

// Cache statistics
export async function getCacheStats(): Promise<{
  totalKeys: number;
  memoryUsage: string;
  hitRate: number;
}> {
  try {
    const info = await redis.info();
    const lines = info.split('\n');
    const stats: { [key: string]: string } = {};
    
    lines.forEach(line => {
      const [key, value] = line.split(':');
      if (key && value) {
        stats[key.trim()] = value.trim();
      }
    });

    return {
      totalKeys: parseInt(stats['db0']?.split(',')[0]?.split('=')[1] || '0'),
      memoryUsage: stats['used_memory_human'] || '0B',
      hitRate: parseFloat(stats['keyspace_hits'] || '0') / 
        (parseFloat(stats['keyspace_hits'] || '0') + parseFloat(stats['keyspace_misses'] || '0')) * 100
    };
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return {
      totalKeys: 0,
      memoryUsage: '0B',
      hitRate: 0
    };
  }
}

export default redis; 