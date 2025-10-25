import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Initialize Redis using environment variables
const redis = Redis.fromEnv();

// Initialize votes if they don't exist
async function initializeVotesIfNeeded() {
  const exists = await redis.exists('votes');
  if (!exists) {
    await redis.hset('votes', {
      'yes': 0,
      'maybe': 0,
      'no': 0
    });
  }
}

export async function GET() {
  try {
    await initializeVotesIfNeeded();
    const votes = await redis.hgetall('votes');
    return NextResponse.json({ 
      votes: {
        yes: parseInt(votes.yes) || 0,
        maybe: parseInt(votes.maybe) || 0,
        no: parseInt(votes.no) || 0
      }
    });
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { option } = await request.json();
    
    // Validate option
    if (!['yes', 'maybe', 'no'].includes(option)) {
      return NextResponse.json(
        { error: 'Invalid vote option' },
        { status: 400 }
      );
    }

    await initializeVotesIfNeeded();
    await redis.hincrby('votes', option, 1);
    
    const votes = await redis.hgetall('votes');
    return NextResponse.json({ 
      votes: {
        yes: parseInt(votes.yes) || 0,
        maybe: parseInt(votes.maybe) || 0,
        no: parseInt(votes.no) || 0
      }
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}