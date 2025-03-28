import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

// Check if API key exists
const hasApiKey = !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Helper function to generate a proper error message
function getApiKeyErrorMessage() {
  return {
    summary: "API Key Configuration Error",
    issues: [{ 
      severity: "Error", 
      description: "Gemini API key is not configured or invalid. To use this feature, you need to enable the Generative Language API in your Google Cloud project.",
      law: "N/A",
      fix: "Visit https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com to enable the API and get a valid API key.",
      ycReference: "N/A"
    }],
    overallRisk: "Unknown",
    complianceScore: 0
  };
}

// Helper function to handle timeouts
function handleTimeout(error: any) {
  console.error('Request timed out:', error);
  return {
    summary: "Request Timed Out",
    issues: [{ 
      severity: "Error", 
      description: "The request took too long to process. This could be due to high API load or network issues. Please try again in a few moments.",
      law: "N/A",
      fix: "1. Wait a few moments and try again\n2. If the issue persists, try with a shorter contract\n3. If problems continue, contact support",
      ycReference: "N/A"
    }],
    overallRisk: "Unknown",
    complianceScore: 0
  };
}

// Helper function to handle API calls with timeout and retries
async function generateContentWithTimeout(model: any, prompt: string, timeoutMs: number = 25000, maxRetries: number = 1) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1} of ${maxRetries + 1}`);
      
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), timeoutMs)
        )
      ]);
      
      if (!result || !result.response) {
        throw new Error('Invalid API response');
      }
      
      return result;
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      // If it's not a timeout error, don't retry
      if (!(error instanceof Error && error.message === 'Request timed out')) {
        throw error;
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw lastError;
}

// Helper function to sanitize API responses and ensure they're valid JSON
function sanitizeAndParseResponse(text: string) {
  try {
    // First try to parse as is
    return JSON.parse(text);
  } catch (error) {
    console.log("Could not parse response as JSON directly, attempting to extract JSON portion");
    
    // Try to extract JSON portion from text using multiple patterns
    const patterns = [
      /\{[\s\S]*\}/,  // Basic JSON object
      /\[[\s\S]*\]/,  // JSON array
      /\{[\s\S]*\}(?![\s\S]*\{)/,  // Last JSON object in text
      /\[[\s\S]*\](?![\s\S]*\[)/   // Last JSON array in text
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
        } catch (nestedError) {
          console.error("Failed to parse extracted JSON portion:", nestedError);
        }
      }
    }
    
    // If all extraction attempts fail, try to clean the text and parse again
    try {
      // Remove any markdown code block markers
      const cleanedText = text.replace(/```json\n?|\n?```/g, '');
      // Remove any leading/trailing whitespace and newlines
      const trimmedText = cleanedText.trim();
      return JSON.parse(trimmedText);
    } catch (cleanError) {
      console.error("Failed to parse cleaned text:", cleanError);
    }
    
    // If all parsing attempts fail, create a fallback object with the raw text
    return {
      summary: "Could not process in structured format",
      issues: [{
        severity: "Unknown",
        description: text.substring(0, 500) + (text.length > 500 ? "..." : ""),
        law: "N/A",
        fix: "Contact legal counsel"
      }],
      overallRisk: "Unknown",
      complianceScore: 0,
      rawResponse: text // Include the raw response for debugging
    };
  }
}

// Helper function to truncate text with warning
function truncateText(text: string, maxLength: number = 4000) {
  if (text.length <= maxLength) {
    return text;
  }
  
  // Try to truncate at a sentence boundary
  const truncated = text.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');
  
  const truncateAt = lastSentence > maxLength * 0.5 ? lastSentence : lastSpace;
  const finalText = truncated.substring(0, truncateAt + 1);
  
  const warning = `\n\n[WARNING: Contract has been truncated to ${finalText.length} characters for processing. The full analysis may be limited.]`;
  
  return finalText + warning;
}

export async function analyzeContract(contractText: string) {
  if (!hasApiKey) {
    return getApiKeyErrorMessage();
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Truncate long contracts to prevent timeouts
    const truncatedText = truncateText(contractText);
    
    if (truncatedText !== contractText) {
      console.log(`Contract truncated from ${contractText.length} to ${truncatedText.length} characters`);
    }
    
    const prompt = `You are a legal AI assistant specializing in startup compliance.
    Current YC SAFE version: 2023. Always reference Delaware Corp Law and SEC Reg D when applicable.
    
    Analyze this contract for legal compliance. List potential issues or violations with:
    1. Severity (High/Medium/Low)
    2. Relevant law or regulation reference
    3. Suggested fix
    4. YC template reference (if applicable)
    
    Format your response as JSON with the following structure:
    {
      "summary": "Brief overview of the contract",
      "issues": [
        {
          "severity": "High",
          "description": "Description of the issue",
          "law": "Relevant law reference",
          "fix": "Suggested fix",
          "ycReference": "YC template reference (if applicable)"
        },
        ...more issues
      ],
      "overallRisk": "High/Medium/Low",
      "complianceScore": 0-100
    }
    
    CONTRACT TEXT:
    ${truncatedText}`;
    
    const result = await generateContentWithTimeout(model, prompt);
    const text = result.response.text();
    
    // Process the response to ensure it's valid JSON
    return sanitizeAndParseResponse(text);
  } catch (error) {
    console.error('Error analyzing contract:', error);
    
    // Check for timeout
    if (error instanceof Error && error.message === 'Request timed out') {
      return handleTimeout(error);
    }
    
    // Check for specific API errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('API key not valid') || 
        errorMessage.includes('API key expired') || 
        errorMessage.includes('API key not found')) {
      return getApiKeyErrorMessage();
    }
    
    if (errorMessage.includes('API has not been enabled')) {
      return {
        summary: "Gemini API Not Enabled",
        issues: [{ 
          severity: "Error", 
          description: "The Generative Language API is not enabled for your Google Cloud project.",
          law: "N/A",
          fix: "Visit https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com to enable the API.",
          ycReference: "N/A"
        }],
        overallRisk: "Unknown",
        complianceScore: 0
      };
    }
    
    return {
      summary: "Error Processing Contract",
      issues: [{ 
        severity: "Error", 
        description: `An error occurred while analyzing the contract: ${errorMessage}`,
        law: "N/A",
        fix: "Try again or contact support.",
        ycReference: "N/A"
      }],
      overallRisk: "Unknown",
      complianceScore: 0
    };
  }
}

export async function simulateNegotiation(clauseText: string, perspective: string) {
  if (!hasApiKey) {
    return getApiKeyErrorMessage();
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `You are an expert in legal negotiations for startup funding agreements.
    
    Simulate how a negotiation would play out for the following clause from the perspective of a ${perspective}.
    
    CLAUSE:
    ${clauseText}
    
    FORMAT YOUR RESPONSE AS JSON with this structure:
    {
      "originalClause": "The original clause text",
      "analysis": "Brief analysis of the clause from the perspective",
      "negotiationPoints": [
        {
          "point": "Specific point to negotiate",
          "justification": "Why this point matters",
          "suggestedRevision": "How the clause could be rewritten"
        },
        ...more points
      ],
      "suggestedResponse": "A suggested verbal response in a negotiation"
    }`;
    
    const result = await generateContentWithTimeout(model, prompt);
    const text = result.response.text();
    
    // Process the response to ensure it's valid JSON
    return sanitizeAndParseResponse(text);
  } catch (error) {
    console.error('Error simulating negotiation:', error);
    
    // Check for timeout
    if (error instanceof Error && error.message === 'Request timed out') {
      return {
        originalClause: clauseText,
        analysis: "Request timed out while processing the negotiation simulation.",
        negotiationPoints: [{
          point: "ERROR",
          justification: "The request took too long to process.",
          suggestedRevision: "Please try again with a shorter clause or contact support."
        }],
        suggestedResponse: "The request timed out. Please try again."
      };
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('API key not valid') || 
        errorMessage.includes('API key expired') || 
        errorMessage.includes('API key not found')) {
      return getApiKeyErrorMessage();
    }
    
    if (errorMessage.includes('API has not been enabled')) {
      return {
        originalClause: clauseText,
        analysis: "Error: Gemini API Not Enabled",
        negotiationPoints: [{
          point: "ERROR",
          justification: "The Generative Language API is not enabled for your Google Cloud project.",
          suggestedRevision: "Visit https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com to enable the API."
        }],
        suggestedResponse: "Please enable the Generative Language API in your Google Cloud project."
      };
    }
    
    return {
      originalClause: clauseText,
      analysis: "Error occurred during processing",
      negotiationPoints: [{
        point: "ERROR",
        justification: `An error occurred: ${errorMessage}`,
        suggestedRevision: "Please try again or contact support."
      }],
      suggestedResponse: "An error occurred. Please try again with a different clause."
    };
  }
}

export async function compareWithYCTemplate(contractText: string) {
  if (!hasApiKey) {
    return getApiKeyErrorMessage();
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Truncate long contracts to prevent timeouts
    const truncatedText = truncateText(contractText);
    
    const prompt = `You are a legal AI assistant specializing in startup funding agreements.
    
    Compare the following contract with the latest YC SAFE template (2023 version).
    Identify differences, missing elements, or additions that are not standard in the YC template.
    
    FORMAT YOUR RESPONSE AS JSON with this structure:
    {
      "summary": "Brief overview of how the contract compares to YC SAFE",
      "adherence": "High/Medium/Low - how closely it follows YC SAFE template",
      "differences": [
        {
          "section": "Section name or area of difference",
          "ycVersion": "What the YC template contains",
          "contractVersion": "What this contract contains",
          "impact": "The potential legal or business impact of this difference",
          "recommendation": "Recommendation on how to address this"
        },
        ...more differences
      ],
      "missingElements": [
        {
          "element": "Name of missing element",
          "importance": "High/Medium/Low",
          "impact": "Impact of this omission",
          "recommendation": "How to address this"
        },
        ...more missing elements
      ]
    }
    
    CONTRACT TEXT:
    ${truncatedText}`;
    
    const result = await generateContentWithTimeout(model, prompt);
    const text = result.response.text();
    
    // Process the response to ensure it's valid JSON
    return sanitizeAndParseResponse(text);
  } catch (error) {
    console.error('Error comparing with YC template:', error);
    
    // Check for timeout
    if (error instanceof Error && error.message === 'Request timed out') {
      return {
        summary: "Request Timed Out",
        adherence: "Unknown",
        differences: [{
          section: "ERROR",
          ycVersion: "N/A",
          contractVersion: "N/A",
          impact: "The request took too long to process.",
          recommendation: "Try again with a shorter contract or split the analysis into smaller sections."
        }],
        missingElements: []
      };
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('API key not valid') || 
        errorMessage.includes('API key expired') || 
        errorMessage.includes('API key not found')) {
      return getApiKeyErrorMessage();
    }
    
    if (errorMessage.includes('API has not been enabled')) {
      return {
        summary: "Gemini API Not Enabled",
        adherence: "Unknown",
        differences: [{
          section: "ERROR",
          ycVersion: "N/A",
          contractVersion: "N/A",
          impact: "The Generative Language API is not enabled for your Google Cloud project.",
          recommendation: "Visit https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com to enable the API."
        }],
        missingElements: []
      };
    }
    
    return {
      summary: "Error Processing Comparison",
      adherence: "Unknown",
      differences: [{
        section: "ERROR",
        ycVersion: "N/A",
        contractVersion: "N/A",
        impact: `An error occurred while comparing with YC template: ${errorMessage}`,
        recommendation: "Try again or contact support."
      }],
      missingElements: []
    };
  }
} 