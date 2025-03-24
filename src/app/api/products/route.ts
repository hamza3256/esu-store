import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/get-payload';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 10;
    
    const payload = await getPayloadClient();
    
    // Get total products count
    const { totalDocs } = await payload.find({
      collection: 'products',
      limit: 0,
    });

    // Get collection stats from MongoDB
    const stats = await mongoose.connection.db.collection('products').stats();
    
    // Calculate index size in MB
    const indexSize = Math.round(stats.totalIndexSize / (1024 * 1024));
    
    // Get last updated product for timestamp
    const { docs: latestProducts } = await payload.find({
      collection: 'products',
      sort: '-updatedAt',
      limit: 1,
    });
    
    const lastUpdated = latestProducts[0]?.updatedAt || new Date().toISOString();

    // Simulate cache hit/miss (in a real app, this would be tracked)
    const cached = Math.random() > 0.5;

    return NextResponse.json({
      total: totalDocs,
      cached,
      indexSize,
      lastUpdated,
      avgDocumentSize: Math.round(stats.avgObjSize / 1024), // KB
      storageSize: Math.round(stats.storageSize / (1024 * 1024)), // MB
    });
  } catch (error) {
    console.error('Products API check failed:', error);
    return NextResponse.json(
      { message: 'Failed to get products metrics' },
      { status: 500 }
    );
  }
} 