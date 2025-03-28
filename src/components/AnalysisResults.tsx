'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Issue {
  severity: string;
  description: string;
  law: string;
  fix: string;
  ycReference?: string;
}

interface AnalysisData {
  summary: string;
  issues: Issue[];
  overallRisk: string;
  complianceScore: number;
}

export default function AnalysisResults() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [showRawResponse, setShowRawResponse] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Get data from localStorage
    const analysisData = localStorage.getItem('contractAnalysis');
    if (analysisData) {
      try {
        // Store the raw response
        setRawResponse(analysisData);
        
        // Try to parse it as JSON
        const parsedData = JSON.parse(analysisData);
        
        // Validate that it has the expected structure
        if (typeof parsedData.summary === 'string' && 
            Array.isArray(parsedData.issues) && 
            typeof parsedData.overallRisk === 'string' && 
            typeof parsedData.complianceScore === 'number') {
          setData(parsedData);
        } else {
          // If structure is invalid, create a fallback object
          setData({
            summary: parsedData.summary || "Could not process in structured format",
            issues: Array.isArray(parsedData.issues) ? parsedData.issues : [{
              severity: "Unknown",
              description: "The API response was incomplete or truncated. Please check the raw response for details.",
              law: "N/A",
              fix: "Try again or contact support."
            }],
            overallRisk: parsedData.overallRisk || "Unknown",
            complianceScore: parsedData.complianceScore || 0
          });
          setError("The API response was incomplete or truncated. You can view the raw response below.");
        }
      } catch (error) {
        console.error('Error parsing analysis data:', error);
        setError("Could not parse the API response as valid JSON. You can view the raw response below.");
        
        // Create fallback data
        setData({
          summary: "Could not process in structured format",
          issues: [{
            severity: "Unknown",
            description: "The API response was not valid JSON. Please check the raw response for details.",
            law: "N/A",
            fix: "Try again or contact support."
          }],
          overallRisk: "Unknown",
          complianceScore: 0
        });
      }
    } else {
      // No data found, redirect to upload page
      router.push('/');
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  if (!data) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold mb-4">No Analysis Data Found</h2>
        <p className="mb-4">Please upload a contract to analyze.</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Go to Upload
        </button>
      </div>
    );
  }

  // Calculate issue counts by severity
  const issuesBySeverity = data.issues.reduce(
    (acc, issue) => {
      const severity = issue.severity.toLowerCase();
      if (severity.includes('high')) acc.high++;
      else if (severity.includes('medium')) acc.medium++;
      else if (severity.includes('low')) acc.low++;
      else acc.unknown++;
      return acc;
    },
    { high: 0, medium: 0, low: 0, unknown: 0 }
  );

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Contract Analysis Results</h1>

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Executive Summary</h2>
        <p className="text-gray-700 mb-4">{data.summary}</p>
        
        <div className="flex flex-wrap gap-4 mt-6">
          <div className="flex-1 min-w-[150px] bg-gray-100 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Overall Risk</h3>
            <p className={`text-2xl font-bold ${
              data.overallRisk.toLowerCase() === 'high' 
                ? 'text-red-600' 
                : data.overallRisk.toLowerCase() === 'medium'
                ? 'text-yellow-600'
                : data.overallRisk.toLowerCase() === 'low'
                ? 'text-green-600'
                : 'text-gray-600'
            }`}>
              {data.overallRisk}
            </p>
          </div>
          
          <div className="flex-1 min-w-[150px] bg-gray-100 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Compliance Score</h3>
            <p className={`text-2xl font-bold ${
              data.complianceScore >= 80 
                ? 'text-green-600' 
                : data.complianceScore >= 60
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              {data.complianceScore}/100
            </p>
          </div>
          
          <div className="flex-1 min-w-[150px] bg-gray-100 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-500">Issues Found</h3>
            <p className="text-2xl font-bold text-gray-800">
              {data.issues.length}
            </p>
          </div>
        </div>
        
        <div className="flex gap-4 mt-6">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            <span className="text-sm">High: {issuesBySeverity.high}</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
            <span className="text-sm">Medium: {issuesBySeverity.medium}</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span className="text-sm">Low: {issuesBySeverity.low}</span>
          </div>
          {issuesBySeverity.unknown > 0 && (
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-gray-500 mr-2"></span>
              <span className="text-sm">Unknown: {issuesBySeverity.unknown}</span>
            </div>
          )}
        </div>
      </div>

      {/* Issues Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Compliance Issues</h2>
        
        {data.issues.length === 0 ? (
          <p className="text-green-600 font-medium">No compliance issues found!</p>
        ) : (
          <div className="space-y-6">
            {data.issues.map((issue, index) => (
              <div 
                key={index} 
                className={`border-l-4 ${
                  issue.severity.toLowerCase().includes('high') 
                    ? 'border-red-500' 
                    : issue.severity.toLowerCase().includes('medium')
                    ? 'border-yellow-500'
                    : issue.severity.toLowerCase().includes('low')
                    ? 'border-green-500'
                    : 'border-gray-500'
                } p-4 bg-gray-50 rounded-r-md`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">Issue #{index + 1}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    issue.severity.toLowerCase().includes('high') 
                      ? 'bg-red-100 text-red-800' 
                      : issue.severity.toLowerCase().includes('medium')
                      ? 'bg-yellow-100 text-yellow-800'
                      : issue.severity.toLowerCase().includes('low')
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {issue.severity}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-3">{issue.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-600">Reference:</p>
                    <p className="text-gray-700">{issue.law}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">YC Reference:</p>
                    <p className="text-gray-700">{issue.ycReference || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded">
                  <p className="font-medium mb-1">Suggested Fix:</p>
                  <p>{issue.fix}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
          onClick={() => router.push('/negotiate')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
        >
          Simulate Negotiation
        </button>
        <button
          onClick={() => router.push('/compare')}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
        >
          Compare with YC Template
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