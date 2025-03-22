import { NextResponse } from 'next/server';

interface RegionMetrics {
  region: string;
  metrics: {
    successRate: string;
    avgLatency: number;
    dataCenter: string;
    tlsVersion: string;
    httpVersion: string;
    rayId: string;
  };
}

interface GlobalMetrics {
  totalTests: number;
  successfulTests: number;
  failedTests: number;
  averageLatency: number;
  successRate: string;
  totalLocations: number;
}

export async function GET() {
  try {
    const startTime = performance.now();
    const regions = [
      { name: 'North America', url: 'https://cdn-cgi/trace' },
      { name: 'Europe', url: 'https://cdn-cgi/trace' },
      { name: 'Asia', url: 'https://cdn-cgi/trace' },
      { name: 'Australia', url: 'https://cdn-cgi/trace' },
      { name: 'South America', url: 'https://cdn-cgi/trace' },
      { name: 'Africa', url: 'https://cdn-cgi/trace' }
    ];

    const regionResults: RegionMetrics[] = [];
    let totalLatency = 0;
    let successfulTests = 0;
    let failedTests = 0;

    // Test each region
    for (const region of regions) {
      try {
        const regionStartTime = performance.now();
        const response = await fetch(region.url, {
          headers: {
            'User-Agent': 'ESU-Store-CDN-Test/1.0',
            'Accept': 'text/plain',
            'Cache-Control': 'no-store'
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.text();
        const latency = performance.now() - regionStartTime;
        totalLatency += latency;
        successfulTests++;

        // Parse Cloudflare trace data
        const cfData = data.split('\n').reduce((acc: Record<string, string>, line: string) => {
          const [key, value] = line.split('=');
          if (key && value) acc[key.trim()] = value.trim();
          return acc;
        }, {});

        regionResults.push({
          region: region.name,
          metrics: {
            successRate: '100%',
            avgLatency: Math.round(latency),
            dataCenter: cfData['colo'] || 'Unknown',
            tlsVersion: cfData['tls'] || 'Unknown',
            httpVersion: cfData['http'] || 'Unknown',
            rayId: cfData['ray'] || 'Unknown'
          }
        });
      } catch (error) {
        failedTests++;
        regionResults.push({
          region: region.name,
          metrics: {
            successRate: '0%',
            avgLatency: 0,
            dataCenter: 'Failed',
            tlsVersion: 'Failed',
            httpVersion: 'Failed',
            rayId: 'Failed'
          }
        });
      }
    }

    // Calculate global metrics
    const totalTests = regions.length;
    const averageLatency = successfulTests > 0 ? Math.round(totalLatency / successfulTests) : 0;
    const successRate = ((successfulTests / totalTests) * 100).toFixed(1);

    const globalMetrics: GlobalMetrics = {
      totalTests,
      successfulTests,
      failedTests,
      averageLatency,
      successRate: `${successRate}%`,
      totalLocations: regions.length
    };

    const endTime = performance.now();
    const totalDuration = endTime - startTime;

    return NextResponse.json({
      status: 'success',
      message: 'CDN performance test completed',
      duration: Math.round(totalDuration),
      global: globalMetrics,
      regions: regionResults
    });
  } catch (error) {
    console.error('CDN test error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to test CDN performance',
        duration: 0,
        global: {
          totalTests: 0,
          successfulTests: 0,
          failedTests: 0,
          averageLatency: 0,
          successRate: '0%',
          totalLocations: 0
        },
        regions: []
      },
      { status: 500 }
    );
  }
} 