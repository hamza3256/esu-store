import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/get-payload';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const startTime = performance.now();
    const payload = await getPayloadClient();
    const endTime = performance.now();
    const latency = endTime - startTime;

    // Get MongoDB connection stats
    const db = mongoose.connection.db;
    const stats = await db.stats();
    
    // Get current connections
    const serverStatus = await db.command({ serverStatus: 1 });
    const connections = serverStatus.connections.current;
    
    // Get operations per second (from MongoDB metrics)
    const opCounters = serverStatus.opcounters;
    const totalOps = Object.values(opCounters as Record<string, number>)
      .reduce((a, b) => a + b, 0);
    const queriesPerSecond = Math.round(totalOps / serverStatus.uptime);

    return NextResponse.json({
      latency: latency.toFixed(2),
      connections,
      queries: queriesPerSecond,
      dbSize: Math.round(stats.dataSize / (1024 * 1024)), // Convert to MB
      collections: stats.collections,
      indexes: stats.indexes,
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    return NextResponse.json(
      { message: 'Failed to get database metrics' },
      { status: 500 }
    );
  }
} 