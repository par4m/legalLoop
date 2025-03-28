'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ContractUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'text'>('file');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Validate file type and size
      if (!selectedFile.type.includes('pdf') && !selectedFile.type.includes('text')) {
        setErrorMessage('Please upload a PDF or text file');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setErrorMessage('File size too large. Please upload a file smaller than 10MB');
        return;
      }
      setFile(selectedFile);
      setErrorMessage('');
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setErrorMessage('');
  };

  const handleUpload = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      // Create form data
      const formData = new FormData();
      
      if (uploadMethod === 'file' && file) {
        formData.append('file', file);
        console.log(`Uploading file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
      } else if (uploadMethod === 'text' && text) {
        formData.append('text', text);
        // Save text to localStorage for template comparison
        localStorage.setItem('contractText', text);
        console.log(`Uploading text of length: ${text.length} characters`);
      } else {
        setErrorMessage('Please upload a file or enter text');
        setIsLoading(false);
        return;
      }

      // Call the API
      const response = await fetch('/api/audit', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze contract');
      }

      const data = await response.json();
      
      // Save data to localStorage
      localStorage.setItem('contractAnalysis', JSON.stringify(data));
      
      // For file uploads, we need to read the file content and store it
      if (uploadMethod === 'file' && file) {
        if (file.type.includes('text') || file.name.endsWith('.txt')) {
          // For text files, read as text
          const reader = new FileReader();
          reader.onload = (e) => {
            const fileContent = e.target?.result as string;
            localStorage.setItem('contractText', fileContent);
          };
          reader.readAsText(file);
        } else {
          // For PDFs, use the text extracted from the API response if available
          if (data && data.extractedText) {
            localStorage.setItem('contractText', data.extractedText);
          }
        }
      }
      
      // Navigate to results page
      router.push('/results');
    } catch (error) {
      console.error('Error uploading contract:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to analyze contract. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load sample contract
  const loadSampleContract = async () => {
    try {
      const response = await fetch('/demo/sample-contract.txt');
      if (!response.ok) {
        throw new Error('Failed to load sample contract');
      }
      const sampleText = await response.text();
      setText(sampleText);
      setUploadMethod('text');
    } catch (error) {
      console.error('Error loading sample contract:', error);
      setErrorMessage('Failed to load sample contract. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Upload Your Contract</h2>
      
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setUploadMethod('file')}
          className={`flex-1 py-2 rounded-md ${
            uploadMethod === 'file'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Upload PDF
        </button>
        <button
          onClick={() => setUploadMethod('text')}
          className={`flex-1 py-2 rounded-md ${
            uploadMethod === 'text'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Paste Text
        </button>
      </div>

      {uploadMethod === 'file' ? (
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Upload PDF file
          </label>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-medium
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-500">
              Selected file: {file.name}
            </p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Supported formats: PDF, TXT (Max size: 10MB)
          </p>
        </div>
      ) : (
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Paste contract text
          </label>
          <textarea
            value={text}
            onChange={handleTextChange}
            rows={10}
            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste your contract text here..."
          ></textarea>
          <button
            onClick={loadSampleContract}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Load sample contract
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={isLoading || (uploadMethod === 'file' ? !file : !text)}
        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Contract'}
      </button>
      
      <p className="mt-4 text-sm text-gray-500 text-center">
        Your document will be analyzed for compliance with Delaware Corporate Law, 
        SEC Regulation D, and YC SAFE templates.
      </p>
    </div>
  );
} 