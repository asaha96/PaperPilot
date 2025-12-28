# PaperPilot - Spatial Research Tool

An infinite whiteboard for visualizing research papers and their atomic concepts. Built with Next.js, React Flow, and AI-powered concept extraction using local LLMs.

## Overview

PaperPilot transforms traditional paper reading into a spatial exploration experience. Instead of reading papers linearly, you can visualize them as nodes on an infinite canvas, expand them into their core concepts, and map relationships between papers through citations.

## Features

- **Spatial UI**: Infinite canvas using React Flow for intuitive paper visualization
- **Concept Extraction**: AI-powered extraction of atomic concepts from papers using local LLMs (Ollama)
- **Citation Mapping**: Automatic integration with Semantic Scholar API for citation visualization
- **Cognitive Scaffolding**: Summaries designed to reduce cognitive load for CS students and researchers
- **Graph Layout**: Automatic layout using dagre algorithm to prevent node overlap
- **Local AI**: No API keys required - uses Ollama for completely private concept extraction

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Canvas**: React Flow
- **Styling**: Tailwind CSS
- **Layout**: Dagre
- **AI**: Ollama (local LLM - no API key needed)
- **Citations**: Semantic Scholar API

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Ollama installed and running

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/asaha96/PaperPilot.git
cd PaperPilot/ini
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Ollama

**Install Ollama:**

On macOS:
```bash
brew install ollama
```

On Linux:
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

On Windows, download from [ollama.ai](https://ollama.ai/download)

**Start Ollama Service:**

```bash
ollama serve
```

Keep this terminal running. Ollama will start on `http://localhost:11434` by default.

**Download a Model:**

```bash
# Recommended: llama3.2:3b (fast, good for structured tasks)
ollama pull llama3.2:3b
```

Alternative models:
- `llama3.1:8b` - Better quality, larger model
- `mistral:7b` - Excellent at following instructions
- `llama3.3:8b` - Latest model with improved capabilities

### 4. Configure Environment (Optional)

Create `.env.local` in the project root:

```bash
# Optional: Change Ollama API URL (default: http://localhost:11434)
OLLAMA_API_URL=http://localhost:11434

# Optional: Change model (default: llama3.2:3b)
OLLAMA_MODEL=llama3.2:3b
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Important**: Make sure Ollama is running (`ollama serve`) before using the app. If Ollama is not available, the app will fall back to mock concepts.

## Usage

### Adding Papers

1. Click the "Add Paper" button at the top center of the canvas
2. Enter the paper title
3. Paste the abstract or summary in the text area
4. Click "Add to Canvas"

The app will automatically search Semantic Scholar for metadata (authors, year, etc.). If the search fails, the paper will still be added with the information you provided.

### Expanding Papers into Concepts

1. Click on any paper node on the canvas
2. Or click the "Expand Concepts" button on a paper node
3. The paper will expand into its atomic concepts
4. Each concept appears as a separate node with its own summary
5. Citations are automatically fetched and displayed as ghost nodes

### Navigating the Canvas

- **Pan**: Click and drag the canvas background
- **Zoom**: Use mouse wheel or the zoom controls in the bottom-left
- **Select**: Click on nodes to select them
- **Minimap**: Use the minimap in the bottom-right to navigate large graphs

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── extract-concepts/    # LLM concept extraction endpoint
│   │   └── search-paper/        # Semantic Scholar search endpoint
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Main page
├── components/
│   ├── nodes/
│   │   ├── PaperNode.tsx       # Paper node component
│   │   ├── ConceptNode.tsx     # Concept node component
│   │   └── CitationNode.tsx    # Citation node component
│   ├── PaperCanvas.tsx          # Main canvas component
│   └── PaperInput.tsx           # Paper input form
├── lib/
│   ├── graphLayout.ts           # Dagre layout algorithm
│   ├── ollama.ts                # Ollama API client utilities
│   └── semanticScholar.ts       # Semantic Scholar API client
├── types/
│   └── index.ts                 # TypeScript type definitions
└── SETUP.md                     # Detailed setup guide
```

## API Endpoints

### POST `/api/extract-concepts`

Extracts atomic concepts from a paper using Ollama.

**Request Body:**
```json
{
  "paperTitle": "Paper Title",
  "paperSummary": "Paper abstract or summary",
  "paperId": "optional-semantic-scholar-id"
}
```

**Response:**
```json
{
  "concepts": [
    {
      "id": "concept-1",
      "name": "Concept Name",
      "summary": "Concept summary",
      "importance": "high"
    }
  ],
  "citationNodes": [...],
  "citationEdges": [...]
}
```

### POST `/api/search-paper`

Searches Semantic Scholar for paper metadata.

**Request Body:**
```json
{
  "query": "Paper title or author"
}
```

## Customization

### Changing the Ollama Model

You can use different Ollama models by setting the `OLLAMA_MODEL` environment variable.

**Recommended models for concept extraction:**
- `llama3.2:3b` - Fast, good for structured tasks (default)
- `llama3.1:8b` - Better quality, larger model
- `mistral:7b` - Excellent at following instructions
- `llama3.3:8b` - Latest model with improved capabilities

**To switch models:**
```bash
# Pull the model first
ollama pull llama3.1:8b

# Then set in .env.local
OLLAMA_MODEL=llama3.1:8b
```

### Adjusting Concept Extraction

Modify the prompt in `app/api/extract-concepts/route.ts` to change how concepts are extracted. The current prompt is designed to:
- Extract 5-8 atomic concepts
- Provide clear, concise summaries
- Rate importance (high/medium/low)

### Graph Layout

The layout algorithm can be customized in `lib/graphLayout.ts`. You can:
- Change direction (TB/LR)
- Adjust node spacing (`nodesep`, `ranksep`)
- Switch to force-directed layout

## Performance Considerations

- The app is designed to handle large graphs efficiently
- Citation fetching is limited to 20 references per paper
- Graph layout is computed asynchronously to prevent UI blocking
- Concept extraction runs locally via Ollama for privacy and speed

## Troubleshooting

### Ollama Connection Issues

If concept extraction fails:
1. Verify Ollama is running: `curl http://localhost:11434/api/tags`
2. Check the model is downloaded: `ollama list`
3. Verify the API URL in `.env.local` matches your Ollama instance

### Nodes Not Appearing

If concept nodes don't appear after expanding:
1. Check the browser console for errors
2. Verify the API response in the Network tab
3. Ensure Ollama is responding correctly

### Semantic Scholar Search Fails

The app will still work if Semantic Scholar search fails. Papers can be added manually without metadata.

## Contributing

This is a research tool built for spatial visualization of academic papers. Contributions are welcome!

## License

MIT

## Acknowledgments

- React Flow for the excellent canvas library
- Ollama for local LLM inference
- Semantic Scholar for citation data
- Dagre for graph layout algorithms
