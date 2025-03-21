import { NextResponse } from 'next/server';

const TEST_ENDPOINTS = [
  {
    region: 'North America',
    locations: [
      { name: 'New York', url: 'https://nyc1.cloudflare.com/cdn-cgi/trace' },
      { name: 'Los Angeles', url: 'https://lax1.cloudflare.com/cdn-cgi/trace' },
      { name: 'Chicago', url: 'https://ord1.cloudflare.com/cdn-cgi/trace' }
    ]
  },
  {
    region: 'Europe',
    locations: [
      { name: 'London', url: 'https://lon1.cloudflare.com/cdn-cgi/trace' },
      { name: 'Frankfurt', url: 'https://fra1.cloudflare.com/cdn-cgi/trace' },
      { name: 'Paris', url: 'https://cdg1.cloudflare.com/cdn-cgi/trace' }
    ]
  },
  {
    region: 'Asia',
    locations: [
      { name: 'Tokyo', url: 'https://tyo1.cloudflare.com/cdn-cgi/trace' },
      { name: 'Singapore', url: 'https://sin1.cloudflare.com/cdn-cgi/trace' },
      { name: 'Hong Kong', url: 'https://hkg1.cloudflare.com/cdn-cgi/trace' }
    ]
  }
];

async function testLocation(location: { name: string; url: string }) {
  const startTime = performance.now();
  try {
    const response = await fetch(location.url);
    const endTime = performance.now();
    const data = await response.text();
    
    // Parse Cloudflare trace data
    const traceData = Object.fromEntries(
      data.split('\n')
        .filter(line => line.includes('='))
        .map(line => line.split('='))
    );

    return {
      name: location.name,
      status: 'success',
      latency: Math.round(endTime - startTime),
      colo: traceData.colo || 'unknown',
      tls: traceData.tls || 'unknown',
      http: traceData.http || 'unknown',
      ray: traceData.ray || 'unknown'
    };
  } catch (error) {
    return {
      name: location.name,
      status: 'error',
      latency: 0,
      error: error instanceof Error ? error.message : 'Failed to connect'
    };
  }
}

export async function GET() {
  try {
    const results = await Promise.all(
      TEST_ENDPOINTS.map(async ({ region, locations }) => {
        const locationResults = await Promise.all(
          locations.map(location => testLocation(location))
        );

        const successfulTests = locationResults.filter(r => r.status === 'success');
        const avgLatency = successfulTests.length
          ? successfulTests.reduce((sum, r) => sum + r.latency, 0) / successfulTests.length
          : 0;

        return {
          region,
          locations: locationResults,
          metrics: {
            total: locations.length,
            successful: successfulTests.length,
            failed: locations.length - successfulTests.length,
            avgLatency: Math.round(avgLatency),
            successRate: `${((successfulTests.length / locations.length) * 100).toFixed(1)}%`
          }
        };
      })
    );

    // Calculate global metrics
    const allLocations = results.flatMap(r => r.locations);
    const globalSuccessRate = allLocations.filter(r => r.status === 'success').length / allLocations.length;
    const globalAvgLatency = allLocations
      .filter(r => r.status === 'success')
      .reduce((sum, r) => sum + r.latency, 0) / allLocations.filter(r => r.status === 'success').length;

    return NextResponse.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      global: {
        totalLocations: allLocations.length,
        successRate: `${(globalSuccessRate * 100).toFixed(1)}%`,
        avgLatency: Math.round(globalAvgLatency)
      },
      regions: results
    });
  } catch (error) {
    console.error('CDN test failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to check CDN performance',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 