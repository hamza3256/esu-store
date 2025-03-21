import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });

    // Get recent refunds
    const refunds = await stripe.refunds.list({ limit: 5 });
    
    // Calculate average processing time (simplified)
    const successfulRefunds = refunds.data.filter(refund => refund.status === 'succeeded');
    const avgProcessingTime = successfulRefunds.length > 0 
      ? Math.round(successfulRefunds.reduce((acc, refund) => acc + (Date.now() / 1000 - refund.created), 0) / successfulRefunds.length * 1000)
      : 0;

    // Get account status
    const account = await stripe.accounts.retrieve();

    return NextResponse.json({
      success: true,
      avgProcessingTime,
      recentRefunds: refunds.data.length,
      successfulRefunds: successfulRefunds.length,
      chargesEnabled: account.charges_enabled,
      defaultCurrency: account.default_currency,
    });
  } catch (error) {
    console.error('Refund test failed:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Failed to check refund status',
        success: false 
      },
      { status: 500 }
    );
  }
} 