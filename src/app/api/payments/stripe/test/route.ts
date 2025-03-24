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

    // Test Stripe connection by making a simple API call
    const balance = await stripe.balance.retrieve();
    
    // Get account details
    const account = await stripe.accounts.retrieve();

    return NextResponse.json({
      connected: true,
      mode: process.env.NODE_ENV === 'production' ? 'live' : 'test',
      currency: balance.available[0]?.currency || 'usd',
      accountType: account.type,
      capabilities: account.capabilities,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });
  } catch (error) {
    console.error('Stripe test failed:', error);
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'Failed to connect to Stripe',
        connected: false 
      },
      { status: 500 }
    );
  }
} 