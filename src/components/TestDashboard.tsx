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
  test: () => Promise<{ details: string; metrics?: { [key: string]: string | number } } | void>;
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
      const response = await fetch('/api/test/system');
      const endTime = performance.now();
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`System health check failed: ${data.message}`);
      }
      
      const { database, cache, server } = await response.json();
      return {
        details: `Database: ${database.latency}ms, Cache: ${cache.latency}ms, Server: ${server.latency}ms`,
        metrics: {
          'DB Latency': database.latency + 'ms',
          'Cache Latency': cache.latency + 'ms',
          'Server Latency': server.latency + 'ms',
          'Memory Usage': server.memory + '%',
          'CPU Load': server.cpu + '%',
          'Uptime': server.uptime + 's',
          'Response Time': (endTime - startTime).toFixed(2) + 'ms'
        }
      };
    } catch (error) {
      throw new Error(`System health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testCachePerformance = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/test/system');
      const endTime = performance.now();
      
      if (!response.ok) {
        throw new Error('System health check failed');
      }
      
      const { cache } = await response.json();
      return {
        details: `Cache latency: ${cache.latency}ms, Keys: ${cache.keys}`,
        metrics: {
          'Latency': cache.latency + 'ms',
          'Total Keys': cache.keys,
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
      const response = await fetch('/api/test/system');
      const endTime = performance.now();
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`Health check failed: ${data.message}`);
      }

      const { server } = await response.json();
      return {
        details: `Memory: ${server.memory}%, CPU: ${server.cpu}%, Uptime: ${server.uptime}s`,
        metrics: {
          'Memory Usage': server.memory + '%',
          'CPU Load': server.cpu + '%',
          'Uptime': server.uptime + 's',
          'Latency': server.latency + 'ms',
          'Response Time': (endTime - startTime).toFixed(2) + 'ms'
        }
      };
    } catch (error) {
      throw new Error(`Server health check failed: ${error instanceof Error ? error.message : 'Service unreachable'}`);
    }
  };

  const testProductsAPI = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/test/api');
      const endTime = performance.now();
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`API test failed: ${data.message}`);
      }
      
      const { products } = await response.json();
      return {
        details: `Total products: ${products.total}, Latency: ${products.latency}ms`,
        metrics: {
          'Total Products': products.total,
          'Latency': products.latency + 'ms',
          'Cache Status': products.cached ? 'Hit' : 'Miss',
          'Response Time': (endTime - startTime).toFixed(2) + 'ms'
        }
      };
    } catch (error) {
      throw new Error(`Products API test failed: ${error instanceof Error ? error.message : 'Endpoint unreachable'}`);
    }
  };

  const testUsersAPI = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/test/api');
      const endTime = performance.now();
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`API test failed: ${data.message}`);
      }
      
      const { users } = await response.json();
      return {
        details: `Total users: ${users.total}, Latency: ${users.latency}ms`,
        metrics: {
          'Total Users': users.total,
          'Latency': users.latency + 'ms',
          'Auth Status': users.authenticated ? 'Active' : 'Inactive',
          'Response Time': (endTime - startTime).toFixed(2) + 'ms'
        }
      };
    } catch (error) {
      throw new Error(`Users API test failed: ${error instanceof Error ? error.message : 'Authentication failed'}`);
    }
  };

  const testOrdersAPI = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/test/api');
      const endTime = performance.now();
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`API test failed: ${data.message}`);
      }
      
      const { orders } = await response.json();
      return {
        details: `Total orders: ${orders.total}, Recent: ${orders.recent}`,
        metrics: {
          'Total Orders': orders.total,
          'Recent Orders': orders.recent,
          'Avg. Value': `£${orders.avgValue}`,
          'Last Order': orders.lastOrder ? new Date(orders.lastOrder).toLocaleString() : 'None',
          'Latency': orders.latency + 'ms',
          'Response Time': (endTime - startTime).toFixed(2) + 'ms'
        }
      };
    } catch (error) {
      throw new Error(`Orders API test failed: ${error instanceof Error ? error.message : 'Service error'}`);
    }
  };

  const testStripeIntegration = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/test/payments');
      const endTime = performance.now();
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`Payment test failed: ${data.message}`);
      }
      
      const { stripe } = await response.json();
      return {
        details: `Connected: ${stripe.connected ? 'Yes' : 'No'}, Type: ${stripe.accountType}, Mode: ${stripe.mode}`,
        metrics: {
          'Account Type': stripe.accountType,
          'Mode': stripe.mode,
          'Currency': stripe.currency.toUpperCase(),
          'Payouts': stripe.payoutsEnabled ? 'Enabled' : 'Disabled',
          'Setup Complete': stripe.detailsSubmitted ? 'Yes' : 'No',
          'Latency': stripe.latency + 'ms',
          'Response Time': (endTime - startTime).toFixed(2) + 'ms'
        }
      };
    } catch (error) {
      throw new Error(`Stripe integration test failed: ${error instanceof Error ? error.message : 'Connection failed'}`);
    }
  };

  const testPaymentWebhook = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/test/payments');
      const endTime = performance.now();
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`Payment test failed: ${data.message}`);
      }
      
      const { webhook } = await response.json();
      return {
        details: `Configured: ${webhook.configured ? 'Yes' : 'No'}, Events: ${webhook.events.length}`,
        metrics: {
          'Configured': webhook.configured ? 'Yes' : 'No',
          'Endpoint': webhook.endpoint || 'Not set',
          'Events': webhook.events.length,
          'Latency': webhook.latency + 'ms',
          'Response Time': (endTime - startTime).toFixed(2) + 'ms'
        }
      };
    } catch (error) {
      throw new Error(`Payment webhook test failed: ${error instanceof Error ? error.message : 'Webhook unreachable'}`);
    }
  };

  const testRefundProcess = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/test/payments');
      const endTime = performance.now();
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`Payment test failed: ${data.message}`);
      }
      
      const { refunds } = await response.json();
      return {
        details: `Recent: ${refunds.recent}, Successful: ${refunds.successful}`,
        metrics: {
          'Recent Refunds': refunds.recent,
          'Successful': refunds.successful,
          'Avg. Processing': `${refunds.avgProcessingTime}ms`,
          'Latency': refunds.latency + 'ms',
          'Response Time': (endTime - startTime).toFixed(2) + 'ms'
        }
      };
    } catch (error) {
      throw new Error(`Refund process test failed: ${error instanceof Error ? error.message : 'Process unavailable'}`);
    }
  };

  const testImageLoading = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/test/media');
      const endTime = performance.now();
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`Media test failed: ${data.message}`);
      }
      
      const data = await response.json();
      return {
        details: `Total files: ${data.media.totalFiles}, Recent uploads: ${data.media.recentUploads}`,
        metrics: {
          'Total Files': data.media.totalFiles,
          'Recent Uploads': data.media.recentUploads,
          'Average File Size': `${data.media.averageFileSize}KB`,
          'Storage Usage': `${data.media.storageUsage}MB`,
          'Bandwidth Usage': `${data.media.bandwidthUsage}MB`,
          'Response Time': (endTime - startTime).toFixed(2) + 'ms'
        }
      };
    } catch (error) {
      throw new Error(`Image loading test failed: ${error instanceof Error ? error.message : 'Loading error'}`);
    }
  };

  const testCDNPerformance = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/test/cdn');
      const endTime = performance.now();
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`CDN test failed: ${data.message}`);
      }
      
      const { global, regions } = await response.json();
      
      // Format region details for display
      const regionDetails = regions.map((region: { region: string; metrics: { successRate: string; avgLatency: number } }) => 
        `${region.region}: ${region.metrics.successRate} success, ${region.metrics.avgLatency}ms avg`
      ).join(', ');

      return {
        details: `Global: ${global.successRate} success rate, ${global.avgLatency}ms avg latency`,
        metrics: {
          'Global Success Rate': global.successRate,
          'Global Avg Latency': global.avgLatency + 'ms',
          'Total Locations': global.totalLocations,
          'North America': regions.find((r: { region: string; metrics: { avgLatency: number } }) => r.region === 'North America')?.metrics.avgLatency + 'ms',
          'Europe': regions.find((r: { region: string; metrics: { avgLatency: number } }) => r.region === 'Europe')?.metrics.avgLatency + 'ms',
          'Asia': regions.find((r: { region: string; metrics: { avgLatency: number } }) => r.region === 'Asia')?.metrics.avgLatency + 'ms',
          'Response Time': (endTime - startTime).toFixed(2) + 'ms'
        }
      };
    } catch (error) {
      throw new Error(`CDN performance test failed: ${error instanceof Error ? error.message : 'Service unavailable'}`);
    }
  };

  const testMediaUpload = async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/api/test/media');
      const endTime = performance.now();
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(`Media test failed: ${data.message}`);
      }
      
      const data = await response.json();
      return {
        details: `Total files: ${data.media.totalFiles}, Cloudinary: ${data.cloudinary.connected ? 'Connected' : 'Disconnected'}`,
        metrics: {
          'Total Files': data.media.totalFiles,
          'Recent Uploads': data.media.recentUploads,
          'Cloudinary Status': data.cloudinary.connected ? 'Connected' : 'Disconnected',
          'Configuration': Object.entries(data.cloudinary.details)
            .map(([key, value]) => `${key}: ${value ? 'Configured' : 'Missing'}`)
            .join(', '),
          'Response Time': (endTime - startTime).toFixed(2) + 'ms'
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

  const runTests = async (categoryName?: string) => {
    setIsRunning(true);
    setProgress(0);
    
    // Filter tests based on category if specified
    const testsToRun = categoryName 
      ? testCategories.find(cat => cat.name === categoryName)?.tests || []
      : testCategories.flatMap(category => category.tests);
    
    const initialResults = testsToRun.map(test => ({
      name: test.name,
      duration: 0,
      success: false,
      status: 'idle' as const,
    }));
    setResults(prev => {
      // If running specific category, only update those results
      if (categoryName) {
        return prev.map(result => 
          testsToRun.some(test => test.name === result.name)
            ? { ...result, status: 'idle', success: false, duration: 0 }
            : result
        );
      }
      return initialResults;
    });

    const totalTests = testsToRun.length;
    let completedTests = 0;

    for (const test of testsToRun) {
      setResults(prev => prev.map(result => 
        result.name === test.name 
          ? { ...result, status: 'running' }
          : result
      ));

      try {
        const startTime = performance.now();
        const testResult = await test.test();
        const duration = performance.now() - startTime;

        setResults(prev => prev.map(result => 
          result.name === test.name 
            ? { 
                ...result, 
                duration, 
                success: true, 
                status: 'complete',
                details: testResult?.details,
                metrics: testResult?.metrics
              }
            : result
        ));
      } catch (error) {
        setResults(prev => prev.map(result => 
          result.name === test.name 
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
            onClick={() => runTests()} 
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                </div>
                <Button
                  onClick={() => runTests(category.name)}
                  disabled={isRunning}
                  variant="outline"
                  size="sm"
                  className="ml-4"
                >
                  Run {category.name}
                </Button>
              </div>
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