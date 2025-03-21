import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/get-payload';
import { v2 as cloudinary } from 'cloudinary';
import { CollectionConfig } from 'payload/types';

export async function GET() {
  try {
    const payload = await getPayloadClient();
    
    // Check if media collection exists
    const mediaCollection = payload.collections['media'];
    
    if (!mediaCollection) {
      throw new Error('Media collection not configured in Payload CMS');
    }

    // Get total files count
    const { totalDocs: totalFiles } = await payload.find({
      collection: 'media',
      limit: 0,
    }).catch(() => ({ totalDocs: 0 }));

    // Get recent uploads with error handling
    const { docs: recentUploads } = await payload.find({
      collection: 'media',
      sort: '-createdAt',
      limit: 5,
    }).catch(() => ({ docs: [] }));

    // Configure and check Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary configuration missing');
    }

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Test Cloudinary connection
    try {
      await cloudinary.api.ping();
    } catch (error) {
      throw new Error('Failed to connect to Cloudinary');
    }

    // Get Cloudinary resources
    const resourceStats = await cloudinary.api.resources({
      type: 'upload',
      max_results: 50,
      prefix: 'media/'
    }).catch(() => ({ resources: [] }));

    // Calculate average file size from recent uploads
    const totalSize = recentUploads.reduce((sum, file) => {
      return sum + (typeof file.filesize === 'number' ? file.filesize : 0);
    }, 0);
    
    const avgFileSize = recentUploads.length ? totalSize / recentUploads.length : 0;
    const storageUsage = Math.round(totalSize / (1024 * 1024)); // Convert to MB

    return NextResponse.json({
      status: 'operational',
      totalFiles,
      recentUploads: recentUploads.length,
      avgFileSize: Math.round(avgFileSize / 1024), // Convert to KB
      storage: storageUsage,
      cloudinaryStatus: {
        connected: true,
        resourceCount: resourceStats.resources.length,
        maxUploadSize: '10MB',
        supportedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      },
      lastUpload: recentUploads[0]?.createdAt || null
    });
  } catch (error) {
    console.error('Media upload test failed:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get media upload metrics',
        details: {
          mediaCollection: false,
          cloudinaryConnection: false
        }
      },
      { status: 500 }
    );
  }
} 