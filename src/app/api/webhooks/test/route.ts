import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Stripe configuration missing');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Get webhook endpoints
    const webhooks = await stripe.webhookEndpoints.list();
    
    // Find our webhook endpoint
    const ourWebhook = webhooks.data.find(webhook => 
      webhook.url.includes(process.env.NEXT_PUBLIC_SERVER_URL || '')
    );

    if (!ourWebhook) {
      throw new Error('Webhook endpoint not configured');
    }

    // Get recent events
    const events = await stripe.events.list({ limit: 1 });
    const lastEvent = events.data[0];

    return NextResponse.json({
      status: 'active',
      lastReceived: lastEvent ? new Date(lastEvent.created * 1000).toISOString() : null,
      url: ourWebhook.url,
      enabledEvents: ourWebhook.enabled_events,
      apiVersion: ourWebhook.api_version,
    });
  } catch (error) {
    console.error('Webhook test failed:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Failed to check webhook status',
        status: 'inactive' 
      },
      { status: 500 }
    );
  }
} 