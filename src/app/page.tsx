'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { analyzeContract, simulateNegotiation, compareWithYCTemplate } from '@/lib/gemini-api';
import ContractUpload from '@/components/ContractUpload';

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [contractText, setContractText] = useState<string>('');
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'audit' | 'compare' | 'simulate'>('audit');
  const [negotiationRole, setNegotiationRole] = useState<'founder' | 'investor'>('founder');
  const [simulationClause, setSimulationClause] = useState<string>('');
  const [simulationResults, setSimulationResults] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      // For PDF files, we would use pdf-parse here
      // For simplicity in this MVP, just read as text
      const text = await file.text();
      setContractText(text);
    } catch (error) {
      console.error("Error reading file:", error);
      alert("Error reading file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const analyzeCurrentContract = async () => {
    if (!contractText.trim()) {
      alert("Please enter or upload a contract first.");
      return;
    }

    setLoading(true);

    try {
      const analysisResults = await analyzeContract(contractText);
      setResults(analysisResults);
    } catch (error) {
      console.error("Error analyzing contract:", error);
      alert("Error analyzing contract. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const compareWithTemplate = async () => {
    if (!contractText.trim()) {
      alert("Please enter or upload a contract first.");
      return;
    }

    setLoading(true);

    try {
      const comparisonResults = await compareWithYCTemplate(contractText);
      setResults(comparisonResults);
    } catch (error) {
      console.error("Error comparing contract:", error);
      alert("Error comparing contract. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    if (!simulationClause.trim()) {
      alert("Please enter a clause to simulate negotiation.");
      return;
    }

    setLoading(true);

    try {
      const founderResponse = await simulateNegotiation(simulationClause, 'founder');
      const investorResponse = await simulateNegotiation(simulationClause, 'investor');
      
      setSimulationResults([founderResponse, investorResponse]);
    } catch (error) {
      console.error("Error simulating negotiation:", error);
      alert("Error simulating negotiation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12 px-6 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Compliance Navigator</h1>
          <p className="text-xl opacity-80">AI-Powered Contract Auditor with Live Loophole Simulation</p>
        </div>
      </header>
      
      <section className="flex-1 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">About Compliance Navigator</h2>
            <p className="text-gray-700 mb-4">
              Compliance Navigator is an AI-powered tool that helps startups, founders, and legal professionals 
              analyze contracts for compliance with laws and regulations, identify potential loopholes, 
              and compare against industry-standard templates.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-5 rounded-lg shadow-md">
                <div className="text-blue-600 text-xl font-bold mb-3">Compliance Check</div>
                <p className="text-gray-600 text-sm">
                  Analyze contracts for compliance with Delaware Corporate Law, SEC Regulation D, 
                  and California Labor Code.
                </p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-md">
                <div className="text-blue-600 text-xl font-bold mb-3">Loophole Simulation</div>
                <p className="text-gray-600 text-sm">
                  Simulate adversarial negotiations between a startup founder and a VC lawyer 
                  to identify potential loopholes.
                </p>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-md">
                <div className="text-blue-600 text-xl font-bold mb-3">Template Comparison</div>
                <p className="text-gray-600 text-sm">
                  Compare your contract with YC SAFE templates to identify deviations 
                  and understand their implications.
                </p>
              </div>
            </div>
          </div>
          
          <ContractUpload />
        </div>
      </section>
      
      <footer className="bg-gray-800 text-white py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="mb-2">Compliance Navigator</p>
          <p className="text-sm text-gray-400">
            Param Arora • MIT Manipal
          </p>
        </div>
      </footer>
    </main>
  );
} 