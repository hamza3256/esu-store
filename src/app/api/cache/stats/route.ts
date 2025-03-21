import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/get-payload';

// Simulated cache metrics since we don't have Redis
const getCacheMetrics = () => {
  const totalRequests = Math.floor(Math.random() * 1000) + 500;
  const hits = Math.floor(Math.random() * totalRequests);
  const misses = totalRequests - hits;
  
  return {
    hitRate: ((hits / totalRequests) * 100).toFixed(1),
    missRate: ((misses / totalRequests) * 100).toFixed(1),
    hits,
    misses,
    totalRequests,
  };
};

export async function GET() {
  try {
    const payload = await getPayloadClient();
    
    // Get cache metrics
    const metrics = getCacheMetrics();
    
    // Simulate cache size and keys
    const size = Math.floor(Math.random() * 100) + 50; // 50-150MB
    const keys = Math.floor(Math.random() * 1000) + 500; // 500-1500 keys

    return NextResponse.json({
      hitRate: metrics.hitRate,
      missRate: metrics.missRate,
      size,
      keys,
      hits: metrics.hits,
      misses: metrics.misses,
      totalRequests: metrics.totalRequests,
    });
  } catch (error) {
    console.error('Cache stats check failed:', error);
    return NextResponse.json(
      { message: 'Failed to get cache metrics' },
      { status: 500 }
    );
  }
} 