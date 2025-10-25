import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Initialize Redis using environment variables
const redis = Redis.fromEnv();

export async function POST(request: Request) {
  try {
    // Example: Store the survey vote
    const data = await request.json();
    const result = await redis.get("votes");
    
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Fetch data from Redis
    const result = await redis.get("votes");
    
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}