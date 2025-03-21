import { Redis } from '@upstash/redis';

if (!process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL) {
  throw new Error('UPSTASH_REDIS_REST_URL is not defined');
}

if (!process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('UPSTASH_REDIS_REST_TOKEN is not defined');
}

export const redis = new Redis({
  url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL,
  token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN,
});

// Cache duration in seconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60;

export const mediaCache = {
  redis, // Expose the Redis instance

  // Cache a media URL
  async setMediaUrl(key: string, url: string, size: string) {
    const cacheKey = `media:${key}:${size}`;
    await redis.set(cacheKey, url, { ex: CACHE_DURATION });
  },

  // Get a cached media URL
  async getMediaUrl(key: string, size: string): Promise<string | null> {
    const cacheKey = `media:${key}:${size}`;
    return await redis.get<string>(cacheKey);
  },

  // Cache multiple media URLs for a product
  async setProductMedia(productId: string, media: { type: 'image' | 'video'; url: string; size: string }[]) {
    const cacheKey = `product:${productId}:media`;
    await redis.set(cacheKey, JSON.stringify(media), { ex: CACHE_DURATION });
  },

  // Get cached media URLs for a product
  async getProductMedia(productId: string): Promise<{ type: 'image' | 'video'; url: string; size: string }[] | null> {
    const cacheKey = `product:${productId}:media`;
    return await redis.get<{ type: 'image' | 'video'; url: string; size: string }[]>(cacheKey);
  },

  // Invalidate cache for a specific media item
  async invalidateMedia(key: string) {
    const pattern = `media:${key}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },

  // Invalidate cache for a product's media
  async invalidateProductMedia(productId: string) {
    const cacheKey = `product:${productId}:media`;
    await redis.del(cacheKey);
  }
}; 