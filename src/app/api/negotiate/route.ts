import { NextRequest, NextResponse } from 'next/server';
import { simulateNegotiation } from '@/lib/gemini-api';

export async function POST(req: NextRequest) {
  try {
    console.log('Received negotiate request');
    const formData = await req.formData();
    const clause = formData.get('clause') as string;
    const perspective = formData.get('perspective') as string;
    
    console.log('Request details:', {
      hasClause: !!clause,
      clauseLength: clause?.length,
      perspective: perspective
    });
    
    if (!clause) {
      console.error('No clause provided in request');
      return NextResponse.json(
        { error: 'Contract clause is required' },
        { status: 400 }
      );
    }
    
    if (!perspective) {
      console.error('No perspective provided in request');
      return NextResponse.json(
        { error: 'Perspective is required' },
        { status: 400 }
      );
    }
    
    console.log(`Processing negotiation with perspective: ${perspective}`);
    
    // Call Gemini API
    const result = await simulateNegotiation(clause, perspective);
    console.log('Received negotiation result:', {
      hasOriginalClause: !!result.originalClause,
      hasAnalysis: !!result.analysis,
      negotiationPointsCount: result.negotiationPoints?.length,
      hasSuggestedResponse: !!result.suggestedResponse
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in negotiation API:', error);
    return NextResponse.json(
      { error: 'Failed to simulate negotiation: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 