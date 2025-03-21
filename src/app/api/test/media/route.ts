import { NextResponse } from 'next/server';
import { getPayloadClient } from '@/get-payload';
import { v2 as cloudinary } from 'cloudinary';

export async function GET() {
  try {
    const payload = await getPayloadClient();
    
    // Image loading test
    const testImages = [
      `${process.env.NEXT_PUBLIC_APP_URL}/esu-official.jpg`,
      `${process.env.NEXT_PUBLIC_APP_URL}/favicon.ico`,
      'https://res.cloudinary.com/dn20h4mis/image/upload/q_auto,f_auto/v1728227919/order-confirmation.jpg'
    ];
    
    const imageResults = await Promise.all(
      testImages.map(async (src) => {
        const startTime = performance.now();
        const response = await fetch(src);
        const endTime = performance.now();
        return {
          src,
          time: endTime - startTime,
          success: response.ok,
          size: response.headers.get('content-length')
        };
      })
    );

    // CDN performance test
    const cdnStartTime = performance.now();
    const cdnResponse = await fetch('https://res.cloudinary.com/dn20h4mis/image/upload/q_auto,f_auto/v1728227919/order-confirmation.jpg');
    const cdnLatency = performance.now() - cdnStartTime;

    // Media upload test
    let mediaStatus = {
      totalFiles: 0,
      latency: 0,
      cloudinary: {
        configured: false,
        connected: false,
        reason: 'Cloudinary configuration missing'
      }
    };

    try {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        const mediaStartTime = performance.now();
        const { totalDocs: totalFiles } = await payload.find({
          collection: 'media',
          limit: 0,
        });
        const mediaLatency = performance.now() - mediaStartTime;

        mediaStatus = {
          totalFiles,
          latency: Math.round(mediaLatency),
          cloudinary: {
            configured: true,
            connected: true,
            reason: 'Connected successfully'
          }
        };
      }
    } catch (mediaError) {
      console.warn('Media check failed:', mediaError);
      mediaStatus.cloudinary.reason = mediaError instanceof Error ? mediaError.message : 'Connection failed';
    }

    // Calculate image loading metrics
    const failedImages = imageResults.filter(r => !r.success);
    const avgLoadTime = imageResults.reduce((acc, curr) => acc + curr.time, 0) / imageResults.length;
    const totalSize = imageResults.reduce((acc, curr) => acc + (parseInt(curr.size || '0') || 0), 0);

    return NextResponse.json({
      status: 'operational',
      images: {
        tested: imageResults.length,
        failed: failedImages.length,
        avgLoadTime: Math.round(avgLoadTime),
        totalSize: Math.round(totalSize / 1024), // Convert to KB
        failedUrls: failedImages.map(f => f.src)
      },
      cdn: {
        connected: cdnResponse.ok,
        latency: Math.round(cdnLatency),
        region: cdnResponse.headers.get('x-cdn-region') || 'Global',
        status: cdnResponse.ok ? 'Active' : 'Failed',
        responseTime: `${Math.round(cdnLatency)}ms`
      },
      media: {
        ...mediaStatus,
        status: mediaStatus.cloudinary.connected ? 'Active' : 'Not Configured',
        details: mediaStatus.cloudinary.reason
      }
    });
  } catch (error) {
    console.error('Media and assets test failed:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to check media and assets',
        details: {
          images: false,
          cdn: false,
          media: false
        }
      },
      { status: 500 }
    );
  }
} 