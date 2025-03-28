import AnalysisResults from '@/components/AnalysisResults';

export default function ResultsPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-6 text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold">Compliance Navigator</h1>
          <p className="text-lg opacity-80">Contract Analysis Results</p>
        </div>
      </header>
      
      <section className="flex-1 py-8 px-6">
        <AnalysisResults />
      </section>
      
      <footer className="bg-gray-800 text-white py-6 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-gray-400">
            Powered by Google Gemini Pro API
          </p>
        </div>
      </footer>
    </main>
  );
} 