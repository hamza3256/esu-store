import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  try {
    // Get CPU usage
    const cpuUsage = os.loadavg()[0]; // 1 minute load average
    const cpuPercent = (cpuUsage / os.cpus().length) * 100;

    // Get memory usage
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryPercent = (usedMemory / totalMemory) * 100;

    // Get uptime
    const uptime = os.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const uptimeString = `${hours}h ${minutes}m`;

    // Simulate requests/min (in a real app, you'd track this)
    const requestsPerMin = Math.floor(Math.random() * 100) + 50;

    return NextResponse.json({
      memory: memoryPercent.toFixed(1),
      cpu: cpuPercent.toFixed(1),
      uptime: uptimeString,
      requests: requestsPerMin,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { message: 'Failed to get server metrics' },
      { status: 500 }
    );
  }
} 