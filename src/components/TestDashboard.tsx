'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';
import { Loader2, Check, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type TestCategory = {
  name: string;
  description: string;
  tests: TestConfig[];
};

type TestConfig = {
  name: string;
  test: () => Promise<{ details: string } | void>;
};

type TestResult = {
  name: string;
  duration: number;
  success: boolean;
  error?: string;
  details?: string;
  status: 'idle' | 'running' | 'complete';
  metrics?: {
    [key: string]: string | number;
  };
};

export const TestDashboard = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Test implementations
  const testDatabaseConnection = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/db/health');
      const endTime = performance.now();
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`Database connection failed: ${data.message || 'Connection timeout'}`);
      }
      
      const { latency, connections, queries } = await response.json();
      return {
        details: `Active connections: ${connections}, Query latency: ${latency}ms`,
        metrics: {
          connections,
          latency,
          'Queries/sec': queries,
          'Response time': (endTime - startTime).toFixed(2) + 'ms'
        }
      };
    } catch (error) {
      throw new Error(`Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testCachePerformance = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/cache/stats');
      const endTime = performance.now();
      
      if (!response.ok) {
        throw new Error('Cache service unavailable');
      }
      
      const { hitRate, missRate, size, keys } = await response.json();
      return {
        details: `Hit rate: ${hitRate}%, Miss rate: ${missRate}%, Cache size: ${size}MB`,
        metrics: {
          'Hit Rate': hitRate + '%',
          'Miss Rate': missRate + '%',
          'Cache Size': size + 'MB',
          'Total Keys': keys,
          'Response Time': (endTime - startTime).toFixed(2) + 'ms'
        }
      };
    } catch (error) {
      throw new Error(`Cache performance test failed: ${error instanceof Error ? error.message : 'Service unavailable'}`);
    }
  };

  const testServerResponse = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/health');
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`Health check failed: ${data.message}`);
      }

      const { memory, cpu, uptime, requests } = await response.json();
      return {
        details: `Memory: ${memory}%, CPU: ${cpu}%, Uptime: ${uptime}`,
        metrics: {
          'Memory Usage': memory + '%',
          'CPU Load': cpu + '%',
          'Uptime': uptime,
          'Requests/min': requests,
          'Latency': latency.toFixed(2) + 'ms'
        }
      };
    } catch (error) {
      throw new Error(`Server health check failed: ${error instanceof Error ? error.message : 'Service unreachable'}`);
    }
  };

  const testProductsAPI = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/products?limit=1');
      const endTime = performance.now();
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`Products API failed: ${data.message}`);
      }
      
      const { total, cached, indexSize, lastUpdated } = await response.json();
      return {
        details: `Total products: ${total}, Index size: ${indexSize}MB`,
        metrics: {
          'Total Products': total,
          'Cache Status': cached ? 'Hit' : 'Miss',
          'Index Size': indexSize + 'MB',
          'Last Updated': lastUpdated,
          'Response Time': (endTime - startTime).toFixed(2) + 'ms'
        }
      };
    } catch (error) {
      throw new Error(`Products API test failed: ${error instanceof Error ? error.message : 'Endpoint unreachable'}`);
    }
  };

  const testUsersAPI = async () => {
    try {
      const response = await fetch('/api/users/me');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`Users API failed: ${data.message}`);
      }
      const { authMethod, session } = await response.json();
      return {
        details: `Auth method: ${authMethod}, Session valid: ${session ? 'Yes' : 'No'}`
      };
    } catch (error) {
      throw new Error(`Users API test failed: ${error instanceof Error ? error.message : 'Authentication failed'}`);
    }
  };

  const testOrdersAPI = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/orders/stats');
      const endTime = performance.now();
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`Orders API failed: ${data.message}`);
      }
      const { total, processing, recentOrders, avgOrderValue, lastOrder, paymentTypes } = await response.json();
      return {
        details: `Total orders: ${total}, Processing: ${processing}`,
        metrics: {
          'Total Orders': total,
          'Processing': processing,
          'Recent Orders': recentOrders,
          'Avg. Value': `£${avgOrderValue}`,
          'Last Order': lastOrder ? new Date(lastOrder).toLocaleString() : 'None',
          'Response Time': `${(endTime - startTime).toFixed(0)}ms`,
          'COD Orders': paymentTypes.cod,
          'Card Orders': paymentTypes.card,
        }
      };
    } catch (error) {
      throw new Error(`Orders API test failed: ${error instanceof Error ? error.message : 'Service error'}`);
    }
  };

  const testStripeIntegration = async () => {
    try {
      const response = await fetch('/api/payments/stripe/test');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`Stripe test failed: ${data.message}`);
      }
      const { connected, mode, currency, accountType, capabilities, payoutsEnabled, detailsSubmitted } = await response.json();
      return {
        details: `Connection: ${connected ? 'Active' : 'Inactive'}, Mode: ${mode}`,
        metrics: {
          'Account Type': accountType,
          'Currency': currency.toUpperCase(),
          'Payouts': payoutsEnabled ? 'Enabled' : 'Disabled',
          'Setup Complete': detailsSubmitted ? 'Yes' : 'No',
          'Environment': mode,
        }
      };
    } catch (error) {
      throw new Error(`Stripe integration test failed: ${error instanceof Error ? error.message : 'Connection failed'}`);
    }
  };

  const testPaymentWebhook = async () => {
    try {
      const response = await fetch('/api/webhooks/test');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`Webhook test failed: ${data.message}`);
      }
      const { status, lastReceived, url, enabledEvents, apiVersion } = await response.json();
      return {
        details: `Status: ${status}, API Version: ${apiVersion}`,
        metrics: {
          'Endpoint URL': url,
          'Last Event': lastReceived ? new Date(lastReceived).toLocaleString() : 'None',
          'Status': status,
          'Events': enabledEvents.length,
          'API Version': apiVersion,
        }
      };
    } catch (error) {
      throw new Error(`Payment webhook test failed: ${error instanceof Error ? error.message : 'Webhook unreachable'}`);
    }
  };

  const testRefundProcess = async () => {
    try {
      const response = await fetch('/api/payments/refund/test');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`Refund test failed: ${data.message}`);
      }
      const { success, avgProcessingTime, recentRefunds, successfulRefunds, chargesEnabled, defaultCurrency } = await response.json();
      return {
        details: `Status: ${success ? 'Available' : 'Unavailable'}, Processing: ${avgProcessingTime}ms`,
        metrics: {
          'Recent Refunds': recentRefunds,
          'Successful': successfulRefunds,
          'Avg. Processing': `${avgProcessingTime}ms`,
          'Charges Enabled': chargesEnabled ? 'Yes' : 'No',
          'Currency': defaultCurrency.toUpperCase(),
        }
      };
    } catch (error) {
      throw new Error(`Refund process test failed: ${error instanceof Error ? error.message : 'Process unavailable'}`);
    }
  };

  const testImageLoading = async () => {
    try {
      const testImages = [
        '/esu-official.jpg',
        '/favicon.ico',
        'https://res.cloudinary.com/dn20h4mis/image/upload/q_auto,f_auto/v1728227919/order-confirmation.jpg'
      ];
      
      const startTime = performance.now();
      const results = await Promise.all(testImages.map(async (src) => {
        const imgStartTime = performance.now();
        const response = await fetch(src);
        const imgEndTime = performance.now();
        return { 
          src, 
          time: imgEndTime - imgStartTime, 
          success: response.ok,
          size: response.headers.get('content-length')
        };
      }));
      const endTime = performance.now();

      const failedImages = results.filter(r => !r.success);
      if (failedImages.length > 0) {
        throw new Error(`${failedImages.length} images failed to load: ${failedImages.map(f => f.src).join(', ')}`);
      }

      const avgTime = results.reduce((acc, curr) => acc + curr.time, 0) / results.length;
      const totalSize = results.reduce((acc, curr) => acc + (parseInt(curr.size || '0') || 0), 0);

      return {
        details: `Avg. load time: ${avgTime.toFixed(2)}ms, Total size: ${(totalSize / 1024).toFixed(1)}KB`,
        metrics: {
          'Average Time': `${avgTime.toFixed(1)}ms`,
          'Total Size': `${(totalSize / 1024).toFixed(1)}KB`,
          'Images Tested': results.length,
          'Success Rate': '100%',
          'Response Time': `${(endTime - startTime).toFixed(1)}ms`
        }
      };
    } catch (error) {
      throw new Error(`Image loading test failed: ${error instanceof Error ? error.message : 'Loading error'}`);
    }
  };

  const testCDNPerformance = async () => {
    try {
      const response = await fetch('/api/cdn/status');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`CDN test failed: ${data.message}`);
      }
      const { uptime, latency, region } = await response.json();
      return {
        details: `Uptime: ${uptime}%, Latency: ${latency}ms, Region: ${region}`
      };
    } catch (error) {
      throw new Error(`CDN performance test failed: ${error instanceof Error ? error.message : 'Service unavailable'}`);
    }
  };

  const testMediaUpload = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/media/test-upload');
      const endTime = performance.now();
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`Upload test failed: ${data.message}`);
      }
      const { 
        speed, maxSize, totalFiles, recentUploads, avgFileSize,
        cloudinaryStatus, bandwidth, storage, creditsUsed, creditsLimit,
        supportedTypes 
      } = await response.json();
      
      return {
        details: `Upload speed: ${speed}MB/s, Max size: ${maxSize}MB`,
        metrics: {
          'Total Files': totalFiles,
          'Recent Uploads': recentUploads,
          'Avg. File Size': `${avgFileSize}KB`,
          'Storage Used': `${storage}MB`,
          'Bandwidth': `${bandwidth}MB`,
          'Credits': `${creditsUsed}/${creditsLimit}`,
          'Status': cloudinaryStatus ? 'Connected' : 'Disconnected',
          'Response Time': `${(endTime - startTime).toFixed(0)}ms`
        }
      };
    } catch (error) {
      throw new Error(`Media upload test failed: ${error instanceof Error ? error.message : 'Upload error'}`);
    }
  };

  const testCategories: TestCategory[] = [
    {
      name: 'System Health',
      description: 'Core system functionality tests',
      tests: [
        { name: 'Database Connection', test: testDatabaseConnection },
        { name: 'Redis Cache', test: testCachePerformance },
        { name: 'Server Response', test: testServerResponse },
      ]
    },
    {
      name: 'API Performance',
      description: 'API endpoint response times and availability',
      tests: [
        { name: 'Products API', test: testProductsAPI },
        { name: 'Users API', test: testUsersAPI },
        { name: 'Orders API', test: testOrdersAPI },
      ]
    },
    {
      name: 'Payment Systems',
      description: 'Payment processing and integration tests',
      tests: [
        { name: 'Stripe Integration', test: testStripeIntegration },
        { name: 'Payment Webhook', test: testPaymentWebhook },
        { name: 'Refund Process', test: testRefundProcess },
      ]
    },
    {
      name: 'Media & Assets',
      description: 'Media handling and CDN performance',
      tests: [
        { name: 'Image Loading', test: testImageLoading },
        { name: 'CDN Performance', test: testCDNPerformance },
        { name: 'Media Upload', test: testMediaUpload },
      ]
    }
  ];

  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const initialResults = testCategories.flatMap(category => 
      category.tests.map(test => ({
        name: test.name,
        duration: 0,
        success: false,
        status: 'idle' as const,
      }))
    );
    setResults(initialResults);

    const totalTests = initialResults.length;
    let completedTests = 0;

    for (const category of testCategories) {
      for (const { name, test } of category.tests) {
        setResults(prev => prev.map(result => 
          result.name === name 
            ? { ...result, status: 'running' }
            : result
        ));

        try {
          const startTime = performance.now();
          const testResult = await test();
          const duration = performance.now() - startTime;

          setResults(prev => prev.map(result => 
            result.name === name 
              ? { 
                  ...result, 
                  duration, 
                  success: true, 
                  status: 'complete',
                  details: testResult?.details 
                }
              : result
          ));
        } catch (error) {
          setResults(prev => prev.map(result => 
            result.name === name 
              ? { 
                  ...result, 
                  success: false, 
                  status: 'complete',
                  error: error instanceof Error ? error.message : 'Unknown error'
                }
              : result
          ));
        }

        completedTests++;
        setProgress((completedTests / totalTests) * 100);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status'], success: boolean) => {
    if (status === 'running') return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    if (status === 'complete') {
      return success 
        ? <Check className="h-5 w-5 text-green-500" strokeWidth={3} />
        : <X className="h-5 w-5 text-red-500" strokeWidth={3} />;
    }
    return null;
  };

  return (
    <div className="w-full max-w-7xl space-y-8">
      <div className="flex flex-col gap-4 bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">System Performance Tests</h2>
            <p className="text-sm text-gray-500">Monitor and diagnose system components</p>
          </div>
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]"
            size="lg"
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>
        
        {isRunning && (
          <div className="flex items-center gap-4">
            <Progress value={progress} className="flex-1" />
            <span className="text-sm font-medium text-gray-600 w-14">{Math.round(progress)}%</span>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto py-2">
          <Button
            variant={selectedCategory === null ? "secondary" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="whitespace-nowrap"
          >
            All Tests
          </Button>
          {testCategories.map((category) => (
            <Button
              key={category.name}
              variant={selectedCategory === category.name ? "secondary" : "outline"}
              onClick={() => setSelectedCategory(category.name)}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {testCategories
          .filter(category => selectedCategory === null || category.name === selectedCategory)
          .map((category, categoryIndex) => (
          <Card key={categoryIndex} className="overflow-hidden">
            <div className="border-b p-4">
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{category.description}</p>
            </div>
            <div className="divide-y">
              {category.tests.map((testConfig, testIndex) => {
                const result = results.find(r => r.name === testConfig.name) ?? {
                  name: testConfig.name,
                  duration: 0,
                  success: false,
                  status: 'idle' as const
                };

                return (
                  <div
                    key={testIndex}
                    className={cn(
                      "p-4 transition-all duration-200",
                      result.status === 'running' && "bg-blue-50",
                      result.status === 'complete' && (result.success ? "bg-green-50" : "bg-red-50")
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-5">
                          {getStatusIcon(result.status, result.success)}
                        </div>
                        <span className="font-medium">{testConfig.name}</span>
                      </div>
                      {result.status === 'complete' && (
                        <span className="text-sm font-medium text-gray-600">
                          {result.duration.toFixed(0)}ms
                        </span>
                      )}
                    </div>
                    
                    {result.status === 'complete' && (
                      <div className="space-y-3 mt-3">
                        {result.success ? (
                          <>
                            <div className="text-sm text-gray-600">{result.details}</div>
                            {result.metrics && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                {Object.entries(result.metrics).map(([key, value]) => (
                                  <div key={key} className="bg-white rounded p-2 border">
                                    <div className="text-xs text-gray-500">{key}</div>
                                    <div className="text-sm font-medium">{value}</div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-start gap-2 text-red-600 bg-red-50 p-2 rounded">
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{result.error}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}; 