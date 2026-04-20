import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.WP_API_URL || '';
const API_TOKEN = process.env.API_TOKEN || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const couponId = body.coupon_id;

    if (!couponId) {
      return NextResponse.json({ error: 'Missing coupon_id' }, { status: 400 });
    }

    const response = await fetch(`${API_BASE}/track-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_TOKEN && { 'X-API-Key': API_TOKEN }),
      },
      body: JSON.stringify({ coupon_id: couponId }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 });
  }
}
