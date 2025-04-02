# Compliance Navigator

An AI-powered contract auditing tool that helps startups, founders, and legal professionals analyze legal documents for compliance issues, simulate adversarial negotiations, and compare against industry-standard templates.

## Features

- **Contract Upload:** Upload contracts or agreements in PDF or text format for analysis
- **Automated Compliance Check:** Analysis for compliance with Delaware Corporate Law, SEC Regulation D, and more
- **Adversarial Loophole Simulation:** Simulates negotiations between founders and VC lawyers
- **YC SAFE Template Comparison:** Compares uploaded contracts with YC SAFE templates
- **Interactive Analysis Results:** Visualizes compliance issues with severity ratings and fix suggestions

## Tech Stack

- **Frontend:** Next.js 15+ with React 18
- **Backend:** FastAPI
- **Styling:** Tailwind CSS, Shadcn UI
- **AI Model:** Google Gemini 2.5


## Getting Started

### Prerequisites

- Node.js 18+ and npm
- FastAPI 

### Installation

1. Clone the repository:
```bash
git clone https://github.com/par4m/legalLoop
cd compliance-navigator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Gemini API key:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Upload a contract document (PDF) or paste contract text directly
2. The AI will analyze the document for compliance issues
3. View detailed analysis with risk scores and identified issues
4. Simulate adversarial negotiations for specific clauses
5. Compare your contract against YC SAFE templates

## Project Structure

```
compliance-navigator/
├── src/
│   ├── app/                 # Next.js pages
│   ├── components/          # React components
│   ├── lib/                 # Utility functions and API helpers
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── .env.local               # Environment variables
├── package.json             # Dependencies and scripts
└── README.md                # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License 
