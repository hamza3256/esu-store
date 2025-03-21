import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/get-payload';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const payload = await getPayloadClient();
    const startTime = performance.now();

    // Check if media collection exists
    if (!payload.collections['media']) {
      throw new Error('Media collection not configured');
    }

    // Check Cloudinary configuration
    const hasCloudinaryConfig = Boolean(
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    let cloudinaryStatus = {
      connected: false,
      reason: 'Cloudinary configuration missing',
      details: {
        cloudName: Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME),
        apiKey: Boolean(process.env.CLOUDINARY_API_KEY),
        apiSecret: Boolean(process.env.CLOUDINARY_API_SECRET)
      }
    };

    if (hasCloudinaryConfig) {
      try {
        // Test Cloudinary connection
        await cloudinary.api.ping();
        cloudinaryStatus = {
          connected: true,
          reason: 'Successfully connected to Cloudinary',
          details: {
            cloudName: true,
            apiKey: true,
            apiSecret: true
          }
        };
      } catch (error) {
        cloudinaryStatus = {
          connected: false,
          reason: error instanceof Error ? error.message : 'Failed to connect to Cloudinary',
          details: {
            cloudName: true,
            apiKey: true,
            apiSecret: true
          }
        };
      }
    }

    // Get total files count
    const totalFiles = await payload.find({
      collection: 'media',
      limit: 1,
    }).then(result => result.totalDocs);

    // Get recent uploads
    const recentUploads = await payload.find({
      collection: 'media',
      limit: 5,
      sort: '-createdAt',
    }).then(result => result.docs);

    // Calculate average file size from recent uploads
    const totalSize = recentUploads.reduce((acc, doc) => acc + (doc.filesize as number || 0), 0);
    const averageFileSize = recentUploads.length > 0 ? totalSize / recentUploads.length : 0;

    // Get Cloudinary usage if connected
    let cloudinaryUsage = null;
    if (cloudinaryStatus.connected) {
      try {
        const usage = await cloudinary.api.usage();
        cloudinaryUsage = {
          storage: Math.round(usage.storage.used_bytes / 1024 / 1024), // Convert to MB
          bandwidth: Math.round(usage.bandwidth.used_bytes / 1024 / 1024), // Convert to MB
          transformations: usage.transformations.usage,
          credits: usage.credits.usage
        };
      } catch (error) {
        console.warn('Failed to fetch Cloudinary usage:', error);
      }
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    return NextResponse.json({
      status: cloudinaryStatus.connected ? 'operational' : 'degraded',
      timestamp: new Date().toISOString(),
      duration: Math.round(duration),
      media: {
        totalFiles,
        recentUploads: recentUploads.length,
        averageFileSize: Math.round(averageFileSize / 1024), // Convert to KB
        storageUsage: cloudinaryUsage?.storage || 0,
        bandwidthUsage: cloudinaryUsage?.bandwidth || 0,
        transformations: cloudinaryUsage?.transformations || 0,
        credits: cloudinaryUsage?.credits || 0
      },
      cloudinary: {
        ...cloudinaryStatus,
        metrics: {
          'Connection Status': cloudinaryStatus.connected ? 'Connected' : 'Disconnected',
          'Configuration Status': Object.entries(cloudinaryStatus.details)
            .map(([key, value]) => `${key}: ${value ? 'Configured' : 'Missing'}`)
            .join(', '),
          'Error Details': cloudinaryStatus.reason
        }
      }
    });
  } catch (error) {
    console.error('Media test failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to check media status',
        timestamp: new Date().toISOString(),
        duration: 0,
        media: {
          totalFiles: 0,
          recentUploads: 0,
          averageFileSize: 0,
          storageUsage: 0,
          bandwidthUsage: 0,
          transformations: 0,
          credits: 0
        },
        cloudinary: {
          connected: false,
          reason: error instanceof Error ? error.message : 'Unknown error',
          details: {
            cloudName: Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME),
            apiKey: Boolean(process.env.CLOUDINARY_API_KEY),
            apiSecret: Boolean(process.env.CLOUDINARY_API_SECRET)
          },
          metrics: {
            'Connection Status': 'Failed',
            'Configuration Status': 'Check environment variables',
            'Error Details': error instanceof Error ? error.message : 'Unknown error'
          }
        }
      },
      { status: 500 }
    );
  }
} 