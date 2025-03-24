import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Helper function to get Redis config
const getRedisConfig = (isClient: boolean) => {
  const url = isClient 
    ? process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL 
    : process.env.UPSTASH_REDIS_REST_URL;
  
  const token = isClient 
    ? process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN 
    : process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(`Redis configuration missing for ${isClient ? 'client' : 'server'} side`);
    return null;
  }

  return { url, token };
};

// Server-side Redis configuration
const serverConfig = getRedisConfig(false);
const serverRedis = serverConfig 
  ? new Redis(serverConfig)
  : null;

// Client-side Redis configuration (only if we're in the browser)
const clientConfig = typeof window !== 'undefined' ? getRedisConfig(true) : null;
const clientRedis = clientConfig 
  ? new Redis(clientConfig)
  : null;

// Export the appropriate Redis instance based on environment
export const redis = typeof window !== 'undefined' ? clientRedis : serverRedis;

// Cache duration in seconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60;

// Type-safe wrapper for Redis operations
export const mediaCache = {
  // Cache a media URL
  async setMediaUrl(key: string, url: string, size: string) {
    if (!redis) return;
    const cacheKey = `media:${key}:${size}`;
    await redis.set(cacheKey, url, { ex: CACHE_DURATION });
  },

  // Get a cached media URL
  async getMediaUrl(key: string, size: string): Promise<string | null> {
    if (!redis) return null;
    const cacheKey = `media:${key}:${size}`;
    return await redis.get<string>(cacheKey);
  },

  // Cache multiple media URLs for a product
  async setProductMedia(productId: string, media: { type: 'image' | 'video'; url: string; size: string }[]) {
    if (!redis) return;
    const cacheKey = `product:${productId}:media`;
    await redis.set(cacheKey, JSON.stringify(media), { ex: CACHE_DURATION });
  },

  // Get cached media URLs for a product
  async getProductMedia(productId: string): Promise<{ type: 'image' | 'video'; url: string; size: string }[] | null> {
    if (!redis) return null;
    const cacheKey = `product:${productId}:media`;
    return await redis.get<{ type: 'image' | 'video'; url: string; size: string }[]>(cacheKey);
  },

  // Invalidate cache for a specific media item
  async invalidateMedia(key: string) {
    if (!redis) return;
    const pattern = `media:${key}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },

  // Invalidate cache for a product's media
  async invalidateProductMedia(productId: string) {
    if (!redis) return;
    const cacheKey = `product:${productId}:media`;
    await redis.del(cacheKey);
  }
}; 