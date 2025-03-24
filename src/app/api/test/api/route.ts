import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/get-payload';

export async function GET() {
  try {
    const payload = await getPayloadClient();
    
    // Products API test
    const productsStartTime = performance.now();
    const { totalDocs: totalProducts } = await payload.find({
      collection: 'products',
      limit: 0,
    });
    const productsLatency = performance.now() - productsStartTime;
    
    // Users API test
    const usersStartTime = performance.now();
    const { totalDocs: totalUsers } = await payload.find({
      collection: 'users',
      limit: 0,
    });
    const usersLatency = performance.now() - usersStartTime;
    
    // Orders API test
    const ordersStartTime = performance.now();
    const { totalDocs: totalOrders, docs: recentOrders } = await payload.find({
      collection: 'orders',
      sort: '-createdAt',
      limit: 5,
    });
    const ordersLatency = performance.now() - ordersStartTime;

    // Calculate average order value
    const totalValue = recentOrders.reduce((sum, order) => {
      return sum + (typeof order.total === 'number' ? order.total : 0);
    }, 0);
    const avgOrderValue = recentOrders.length ? totalValue / recentOrders.length : 0;

    return NextResponse.json({
      status: 'operational',
      products: {
        total: totalProducts,
        latency: Math.round(productsLatency),
        cached: true
      },
      users: {
        total: totalUsers,
        latency: Math.round(usersLatency),
        authenticated: true
      },
      orders: {
        total: totalOrders,
        recent: recentOrders.length,
        avgValue: Math.round(avgOrderValue * 100) / 100,
        latency: Math.round(ordersLatency),
        lastOrder: recentOrders[0]?.createdAt || null
      }
    });
  } catch (error) {
    console.error('API performance test failed:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to check API performance',
        details: {
          products: false,
          users: false,
          orders: false
        }
      },
      { status: 500 }
    );
  }
} 