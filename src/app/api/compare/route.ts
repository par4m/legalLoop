import { NextRequest, NextResponse } from 'next/server';
import { compareWithYCTemplate } from '@/lib/gemini-api';
import { parsePdf } from '@/lib/pdf-utils';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const text = formData.get('text') as string | null;
    
    let contractText = '';
    
    if (file) {
      // Handle PDF file
      try {
        console.log(`Processing PDF file of size ${file.size} bytes and type ${file.type}`);
        const buffer = Buffer.from(await file.arrayBuffer());
        console.log(`Successfully created buffer of length ${buffer.length}`);
        
        const result = await parsePdf(buffer);
        contractText = result.text;
        
        console.log(`Successfully parsed PDF with text length: ${contractText.length} characters`);
        
        // If the text is very short, it may not have been parsed correctly
        if (contractText.length < 50) {
          console.warn('Warning: Extracted text is very short, PDF may not have been parsed correctly');
        }
      } catch (error) {
        console.error('Error parsing PDF:', error);
        return NextResponse.json(
          { error: 'Failed to parse PDF file: ' + (error instanceof Error ? error.message : String(error)) },
          { status: 400 }
        );
      }
    } else if (text) {
      // Handle text input
      contractText = text;
      console.log(`Processing text input of length ${contractText.length} characters`);
    } else {
      return NextResponse.json(
        { error: 'No file or text provided' },
        { status: 400 }
      );
    }
    
    // Compare the contract with YC template
    console.log('Sending contract text to Gemini API for comparison with YC template');
    const comparisonResult = await compareWithYCTemplate(contractText);
    
    // Include extracted text in the response for PDF uploads
    return NextResponse.json({
      ...comparisonResult,
      extractedText: file ? contractText : undefined
    });
  } catch (error) {
    console.error('Error in compare API:', error);
    return NextResponse.json(
      { error: 'Failed to compare contract with YC template: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 