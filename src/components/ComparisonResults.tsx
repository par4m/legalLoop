'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Difference {
  section: string;
  ycVersion: string;
  contractVersion: string;
  impact: string;
  recommendation: string;
}

interface MissingElement {
  element: string;
  importance: string;
  impact: string;
  recommendation: string;
}

interface ComparisonData {
  summary: string;
  adherence: string;
  differences: Difference[];
  missingElements: MissingElement[];
}

export default function ComparisonResults() {
  const [data, setData] = useState<ComparisonData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [showRawResponse, setShowRawResponse] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get contract text from localStorage
        const contractText = localStorage.getItem('contractText');
        
        if (!contractText) {
          setError('No contract text found. Please upload a contract first.');
          setIsLoading(false);
          return;
        }
        
        // Create form data
        const formData = new FormData();
        formData.append('text', contractText);
        
        // Call the compare API
        const response = await fetch('/api/compare', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to compare with YC template');
        }
        
        const jsonData = await response.json();
        setRawResponse(JSON.stringify(jsonData, null, 2));
        
        // Validate data structure
        if (jsonData && typeof jsonData.summary === 'string' && 
            typeof jsonData.adherence === 'string' && 
            Array.isArray(jsonData.differences)) {
          setData({
            summary: jsonData.summary,
            adherence: jsonData.adherence,
            differences: jsonData.differences || [],
            missingElements: jsonData.missingElements || []
          });
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error comparing with YC template:', error);
        setError(error instanceof Error ? error.message : 'Failed to compare with YC template');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [router]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="mb-4 text-red-600">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold mb-4">No Comparison Data</h2>
        <p className="mb-4">Please upload a contract to compare with YC SAFE template.</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">YC SAFE Template Comparison</h1>

      {/* Summary Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <p className="text-gray-700 mb-4">{data.summary}</p>
        
        <div className="mt-6 inline-block px-4 py-2 rounded-full bg-gray-100">
          <span className="text-sm font-medium text-gray-700 mr-2">Adherence to YC SAFE:</span>
          <span className={`font-bold ${
            data.adherence.toLowerCase().includes('high') 
              ? 'text-green-600' 
              : data.adherence.toLowerCase().includes('medium')
              ? 'text-yellow-600'
              : 'text-red-600'
          }`}>
            {data.adherence}
          </span>
        </div>
      </div>

      {/* Differences Section */}
      {data.differences.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Differences from YC SAFE Template</h2>
          
          <div className="space-y-6">
            {data.differences.map((diff, index) => (
              <div key={index} className="border-l-4 border-yellow-500 pl-4 py-2">
                <h3 className="font-medium text-lg">{diff.section}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="bg-green-50 p-3 rounded">
                    <p className="font-medium text-green-800 mb-1">YC SAFE Template:</p>
                    <p className="text-gray-800">{diff.ycVersion}</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded">
                    <p className="font-medium text-yellow-800 mb-1">Your Contract:</p>
                    <p className="text-gray-800">{diff.contractVersion}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="font-medium text-gray-700">Impact:</p>
                  <p className="text-gray-700">{diff.impact}</p>
                </div>
                
                <div className="mt-2 p-3 bg-blue-50 rounded">
                  <p className="font-medium text-blue-800 mb-1">Recommendation:</p>
                  <p className="text-gray-800">{diff.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Elements Section */}
      {data.missingElements && data.missingElements.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Missing Elements</h2>
          
          <div className="space-y-6">
            {data.missingElements.map((item, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{item.element}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.importance.toLowerCase().includes('high') 
                      ? 'bg-red-100 text-red-800' 
                      : item.importance.toLowerCase().includes('medium')
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.importance}
                  </span>
                </div>
                
                <div className="mt-2">
                  <p className="font-medium text-gray-700">Impact:</p>
                  <p className="text-gray-700">{item.impact}</p>
                </div>
                
                <div className="mt-2 p-3 bg-blue-50 rounded">
                  <p className="font-medium text-blue-800 mb-1">Recommendation:</p>
                  <p className="text-gray-800">{item.recommendation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Response Section */}
      {rawResponse && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Raw API Response</h2>
            <button 
              onClick={() => setShowRawResponse(!showRawResponse)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showRawResponse ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showRawResponse && (
            <div className="bg-gray-50 p-4 rounded overflow-auto max-h-96">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                {rawResponse}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap gap-4 justify-center mt-8">
        <button
          onClick={() => router.push('/results')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
        >
          Back to Results
        </button>
        <button
          onClick={() => router.push('/negotiate')}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
        >
          Negotiate Clauses
        </button>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md"
        >
          Upload New Contract
        </button>
      </div>
    </div>
  );
} 