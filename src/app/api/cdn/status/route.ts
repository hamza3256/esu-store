import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real app, these would be actual CDN metrics
    // For now, we'll simulate them
    const uptime = 99.9 + (Math.random() * 0.1); // 99.9-100%
    const latency = Math.floor(Math.random() * 30) + 20; // 20-50ms
    const region = 'eu-west-1';
    
    // Simulate CDN cache stats
    const cacheHitRate = 95 + (Math.random() * 5); // 95-100%
    const bandwidth = Math.floor(Math.random() * 500) + 500; // 500-1000 Mbps
    const edgeLocations = ['London', 'Frankfurt', 'Paris', 'Amsterdam', 'Karachi'];
    
    return NextResponse.json({
      uptime: uptime.toFixed(2),
      latency,
      region,
      cacheHitRate: cacheHitRate.toFixed(1),
      bandwidth,
      edgeLocations,
      status: 'healthy',
      lastChecked: new Date().toISOString(),
    });
  } catch (error) {
    console.error('CDN status check failed:', error);
    return NextResponse.json(
      { message: 'Failed to get CDN metrics' },
      { status: 500 }
    );
  }
} 