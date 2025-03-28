import { NextResponse } from 'next/server';
import { simulateNegotiation } from '@/lib/gemini-api';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, role } = body;

    if (!text) {
      return NextResponse.json({ error: 'Clause text is required' }, { status: 400 });
    }

    if (!role || (role !== 'founder' && role !== 'investor')) {
      return NextResponse.json({ error: 'Valid role (founder or investor) is required' }, { status: 400 });
    }

    const simulation = await simulateNegotiation(text, role);
    return NextResponse.json({ result: simulation });
  } catch (error) {
    console.error('Error in simulation API:', error);
    return NextResponse.json(
      { error: 'Failed to simulate negotiation' },
      { status: 500 }
    );
  }
} 