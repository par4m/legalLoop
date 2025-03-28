'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface NegotiationPoint {
  point: string;
  justification: string;
  suggestedRevision: string;
}

interface NegotiationResult {
  originalClause: string;
  analysis: string;
  negotiationPoints: NegotiationPoint[];
  suggestedResponse: string;
  error?: string;
}

export default function NegotiationSimulator() {
  const [clause, setClause] = useState<string>('');
  const [perspective, setPerspective] = useState<string>('Founder Perspective');
  const [result, setResult] = useState<NegotiationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSimulate = async () => {
    if (!clause.trim()) {
      setError('Please enter a contract clause to simulate');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Create form data for the request
      const formData = new FormData();
      formData.append('clause', clause);
      formData.append('perspective', perspective);

      const response = await fetch('/api/negotiate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to simulate negotiation');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error simulating negotiation:', error);
      setError(error instanceof Error ? error.message : 'Failed to simulate negotiation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Contract Negotiation Simulator</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <p className="text-gray-700 mb-6">
          This tool simulates a negotiation between parties, highlighting potential tactics and 
          counter-arguments for a specific contract clause based on your chosen perspective.
        </p>
        
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Select Perspective
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setPerspective('Founder Perspective')}
              className={`flex-1 py-2 px-4 rounded-md ${
                perspective === 'Founder Perspective'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Founder Perspective
            </button>
            <button
              onClick={() => setPerspective('Investor Perspective')}
              className={`flex-1 py-2 px-4 rounded-md ${
                perspective === 'Investor Perspective'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Investor Perspective
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {perspective === 'Founder Perspective'
              ? 'Analyze as a founder defending your interests'
              : 'Analyze as an investor looking for potential advantages'}
          </p>
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Contract Clause
          </label>
          <textarea
            value={clause}
            onChange={(e) => setClause(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste the contract clause here..."
          ></textarea>
        </div>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <button
          onClick={handleSimulate}
          disabled={isLoading || !clause.trim()}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Simulating...' : 'Simulate Negotiation'}
        </button>
      </div>
      
      {result && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {perspective} Analysis
          </h2>
          
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">Original Clause:</h3>
            <p className="text-gray-800 italic">{result.originalClause}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Analysis:</h3>
            <p className="text-gray-800">{result.analysis}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Negotiation Points:</h3>
            <div className="space-y-4">
              {result.negotiationPoints && result.negotiationPoints.map((point, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-medium text-blue-700">{point.point}</h4>
                  <p className="text-gray-700 mt-1"><span className="font-medium">Justification:</span> {point.justification}</p>
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <p className="text-gray-800"><span className="font-medium">Suggested Revision:</span> {point.suggestedRevision}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-indigo-50 rounded-lg">
            <h3 className="font-medium text-indigo-700 mb-2">Suggested Verbal Response:</h3>
            <p className="text-gray-800">{result.suggestedResponse}</p>
          </div>
        </div>
      )}
      
      <div className="flex justify-center mt-8">
        <button
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md mr-4"
        >
          Back to Results
        </button>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          Upload New Contract
        </button>
      </div>
    </div>
  );
} 