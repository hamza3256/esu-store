import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/get-payload';
import { Order } from '@/payload-types';

export async function GET() {
  try {
    const payload = await getPayloadClient();
    
    // Get total orders count
    const { totalDocs: total } = await payload.find({
      collection: 'orders',
      limit: 0,
    });

    // Get processing orders count
    const { totalDocs: processing } = await payload.find({
      collection: 'orders',
      where: {
        status: {
          equals: 'processing'
        }
      },
      limit: 0,
    });

    // Get recent orders
    const { docs: recentOrders } = await payload.find({
      collection: 'orders',
      sort: '-createdAt',
      limit: 5,
      depth: 1,
    });

    // Calculate average order value from recent orders
    let avgOrderValue = 0;
    if (recentOrders.length > 0) {
      const totalValue = recentOrders.reduce((sum, order) => {
        const orderTotal = typeof order.total === 'number' ? order.total : 0;
        return sum + orderTotal;
      }, 0);
      avgOrderValue = Math.round(totalValue / recentOrders.length);
    }

    // Get payment type breakdown
    const { docs: codOrders } = await payload.find({
      collection: 'orders',
      where: {
        paymentMethod: {
          equals: 'cod'
        }
      },
      limit: 0,
    });

    const { docs: cardOrders } = await payload.find({
      collection: 'orders',
      where: {
        paymentMethod: {
          equals: 'card'
        }
      },
      limit: 0,
    });

    return NextResponse.json({
      total,
      processing,
      recentOrders: recentOrders.length,
      avgOrderValue,
      lastOrder: recentOrders[0]?.createdAt || null,
      paymentTypes: {
        cod: codOrders.length,
        card: cardOrders.length,
      }
    });
  } catch (error) {
    console.error('Orders stats check failed:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to get order metrics' },
      { status: 500 }
    );
  }
} 