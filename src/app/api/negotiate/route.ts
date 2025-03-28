import { NextRequest, NextResponse } from 'next/server';
import { simulateNegotiation } from '@/lib/gemini-api';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const clause = formData.get('clause') as string;
    const perspective = formData.get('perspective') as string;
    
    if (!clause) {
      return NextResponse.json(
        { error: 'Contract clause is required' },
        { status: 400 }
      );
    }
    
    if (!perspective) {
      return NextResponse.json(
        { error: 'Perspective is required' },
        { status: 400 }
      );
    }
    
    console.log(`Processing negotiation with perspective: ${perspective}`);
    
    // Call Gemini API
    const result = await simulateNegotiation(clause, perspective);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in negotiation API:', error);
    return NextResponse.json(
      { error: 'Failed to simulate negotiation: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 