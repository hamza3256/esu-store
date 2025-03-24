import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export async function GET() {
  try {
    // Stripe integration test
    const stripeStartTime = performance.now();
    const account = await stripe.accounts.retrieve();
    const stripeLatency = performance.now() - stripeStartTime;

    // Webhook test
    const webhookStartTime = performance.now();
    const webhooks = await stripe.webhookEndpoints.list();
    const webhookLatency = performance.now() - webhookStartTime;

    // Refund test
    const refundStartTime = performance.now();
    const refunds = await stripe.refunds.list({ limit: 5 });
    const refundLatency = performance.now() - refundStartTime;

    // Calculate average refund processing time
    const successfulRefunds = refunds.data.filter(refund => refund.status === 'succeeded');
    const avgProcessingTime = successfulRefunds.length
      ? successfulRefunds.reduce((sum, refund) => {
          const created = new Date(refund.created * 1000).getTime();
          const now = Date.now();
          return sum + (now - created);
        }, 0) / successfulRefunds.length
      : 0;

    return NextResponse.json({
      status: 'operational',
      stripe: {
        connected: true,
        accountType: account.type,
        currency: account.default_currency,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test' : 'live',
        latency: Math.round(stripeLatency)
      },
      webhook: {
        configured: webhooks.data.length > 0,
        endpoint: webhooks.data[0]?.url || null,
        events: webhooks.data[0]?.enabled_events || [],
        latency: Math.round(webhookLatency)
      },
      refunds: {
        recent: refunds.data.length,
        successful: successfulRefunds.length,
        avgProcessingTime: Math.round(avgProcessingTime),
        latency: Math.round(refundLatency)
      }
    });
  } catch (error) {
    console.error('Payment system test failed:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to check payment systems',
        details: {
          stripe: false,
          webhook: false,
          refunds: false
        }
      },
      { status: 500 }
    );
  }
} 