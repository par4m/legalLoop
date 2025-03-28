'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Difference {
  section: string;
  ycVersion: string;
  submittedVersion: string;
  impact: string;
  recommendation: string;
}

interface ComparisonData {
  alignment: string;
  differences: Difference[];
  overallAssessment: string;
}

export default function TemplateComparison() {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ComparisonData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const performComparison = async () => {
      try {
        // Get analysis data from localStorage
        const analysisData = localStorage.getItem('contractAnalysis');
        if (!analysisData) {
          router.push('/');
          return;
        }

        // Get the contractText from localStorage if available
        const contractText = localStorage.getItem('contractText');
        if (!contractText) {
          alert('Contract text not found. Please upload your contract again.');
          router.push('/');
          return;
        }

        // Call the comparison API
        const formData = new FormData();
        formData.append('text', contractText);

        const response = await fetch('/api/compare', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to compare with YC template');
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error comparing with YC template:', error);
        alert('Failed to compare with YC template. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    performComparison();
  }, [router]);

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading comparison...</div>;
  }

  if (!data) {
    return (
      <div className="text-center p-10">
        <h2 className="text-2xl font-bold mb-4">Comparison Failed</h2>
        <p className="mb-4">We couldn't compare your contract with the YC SAFE template.</p>
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
        <h2 className="text-xl font-semibold mb-4">Comparison Summary</h2>
        
        <div className="flex items-center mb-6">
          <div className="mr-4">
            <span className="text-sm text-gray-500">Template Alignment</span>
            <div className={`text-xl font-bold ${
              data.alignment.toLowerCase() === 'high' 
                ? 'text-green-600' 
                : data.alignment.toLowerCase() === 'medium'
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              {data.alignment}
            </div>
          </div>
          
          <div className="flex-1 h-2 bg-gray-200 rounded-full">
            <div 
              className={`h-2 rounded-full ${
                data.alignment.toLowerCase() === 'high' 
                  ? 'bg-green-500 w-4/5' 
                  : data.alignment.toLowerCase() === 'medium'
                  ? 'bg-yellow-500 w-1/2'
                  : 'bg-red-500 w-1/4'
              }`}
            ></div>
          </div>
        </div>
        
        <div className="prose max-w-none">
          <p>{data.overallAssessment}</p>
        </div>
      </div>

      {/* Differences Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Key Differences</h2>
        
        {data.differences.length === 0 ? (
          <p className="text-green-600 font-medium">No significant differences found!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    YC Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Your Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recommendation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.differences.map((diff, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {diff.section}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-h-24 overflow-y-auto">
                        {diff.ycVersion}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-h-24 overflow-y-auto">
                        {diff.submittedVersion}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        diff.impact.toLowerCase().includes('founder') 
                          ? 'bg-green-100 text-green-800' 
                          : diff.impact.toLowerCase().includes('investor')
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {diff.impact}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-h-24 overflow-y-auto">
                        {diff.recommendation}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => router.push('/results')}
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