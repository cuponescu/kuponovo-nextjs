// Server-side API route for store rating
// This keeps the API key private on the server
// Implements rate limiting to prevent abuse

import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.WP_API_URL || '';
const API_TOKEN = process.env.API_TOKEN || '';

// In-memory rate limiting (per IP)
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const limit = rateLimits.get(ip);
  const now = Date.now();
  
  // Clean up expired entries periodically
  if (rateLimits.size > 1000) {
    for (const [key, value] of rateLimits.entries()) {
      if (now > value.resetAt) {
        rateLimits.delete(key);
      }
    }
  }
  
  if (!limit || now > limit.resetAt) {
    // New window or expired - reset
    rateLimits.set(ip, { count: 1, resetAt: now + 60000 }); // 1 minute window
    return true;
  }
  
  if (limit.count >= 10) {
    // Max 10 requests per minute
    return false;
  }
  
  limit.count++;
  return true;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Extract IP from headers
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             request.headers.get('x-real-ip') || 
             'unknown';

  // Check rate limit
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { id } = params;

    const response = await fetch(`${API_BASE}/stores/${id}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_TOKEN && { 'X-API-Key': API_TOKEN }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error rating store:', error);
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    );
  }
}

