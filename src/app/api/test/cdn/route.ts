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
    const response = await fetch(location.url, {
      method: 'GET',
      headers: {
        'User-Agent': 'ESU-Store-CDN-Test/1.0',
        'Accept': 'text/plain'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
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
      ray: traceData.ray || 'unknown',
      metrics: {
        'Response Time': `${Math.round(endTime - startTime)}ms`,
        'Data Center': traceData.colo || 'unknown',
        'TLS Version': traceData.tls || 'unknown',
        'HTTP Version': traceData.http || 'unknown',
        'Ray ID': traceData.ray || 'unknown'
      }
    };
  } catch (error) {
    return {
      name: location.name,
      status: 'error',
      latency: 0,
      error: error instanceof Error ? error.message : 'Failed to connect',
      metrics: {
        'Error': error instanceof Error ? error.message : 'Failed to connect',
        'Status': 'Failed'
      }
    };
  }
}

export async function GET() {
  try {
    const startTime = performance.now();
    
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
    const successfulLocations = allLocations.filter(r => r.status === 'success');
    const globalSuccessRate = successfulLocations.length / allLocations.length;
    const globalAvgLatency = successfulLocations.length
      ? successfulLocations.reduce((sum, r) => sum + r.latency, 0) / successfulLocations.length
      : 0;

    const endTime = performance.now();
    const duration = endTime - startTime;

    return NextResponse.json({
      status: globalSuccessRate > 0.5 ? 'operational' : 'degraded',
      timestamp: new Date().toISOString(),
      duration: Math.round(duration),
      global: {
        totalLocations: allLocations.length,
        successRate: `${(globalSuccessRate * 100).toFixed(1)}%`,
        avgLatency: Math.round(globalAvgLatency),
        metrics: {
          'Total Tests': allLocations.length,
          'Successful Tests': successfulLocations.length,
          'Failed Tests': allLocations.length - successfulLocations.length,
          'Average Latency': `${Math.round(globalAvgLatency)}ms`,
          'Success Rate': `${(globalSuccessRate * 100).toFixed(1)}%`
        }
      },
      regions: results.map(region => ({
        ...region,
        metrics: {
          ...region.metrics,
          'Status': region.metrics.successRate === '100.0%' ? 'Operational' : 'Degraded'
        }
      }))
    });
  } catch (error) {
    console.error('CDN test failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to check CDN performance',
        timestamp: new Date().toISOString(),
        duration: 0,
        global: {
          totalLocations: 0,
          successRate: '0.0%',
          avgLatency: 0,
          metrics: {
            'Total Tests': 0,
            'Successful Tests': 0,
            'Failed Tests': 0,
            'Average Latency': '0ms',
            'Success Rate': '0.0%'
          }
        }
      },
      { status: 500 }
    );
  }
} 