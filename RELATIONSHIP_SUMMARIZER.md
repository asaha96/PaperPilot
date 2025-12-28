# Relationship Summarizer Implementation

## Overview

The Relationship Summarizer analyzes connections between research papers using Ollama (local LLM) to classify and summarize relationships. It implements semantic chunking to extract relevant citation contexts and provides non-blocking analysis to maintain UI responsiveness.

## Architecture

### Components

1. **Semantic Chunking** (`lib/semanticChunking.ts`)
   - Extracts relevant sections where Paper B mentions Paper A
   - Uses keyword matching and context extraction
   - Limits context window to 2000 characters for token efficiency

2. **API Endpoint** (`app/api/summarize-relationship/route.ts`)
   - POST endpoint that accepts two papers
   - Performs semantic chunking
   - Calls Ollama for relationship analysis
   - Returns relationship metadata in JSON format

3. **UI Integration** (`components/PaperCanvas.tsx`)
   - Click edge to analyze relationship
   - Ctrl/Cmd + Click two paper nodes to analyze their relationship
   - Displays relationship summary on edges

4. **Custom Edge Component** (`components/edges/RelationshipEdge.tsx`)
   - Visualizes relationship type and summary
   - Color-coded by relationship type
   - Shows "Analyzing..." state during processing

## Relationship Types

The system classifies relationships into 7 categories:

1. **Incremental** - Paper B builds upon Paper A
2. **Contradictory** - Paper B challenges Paper A
3. **Applied** - Paper B applies Paper A's methods to new domain
4. **Methodological Improvement** - Paper B improves Paper A's methodology
5. **Theoretical Extension** - Paper B extends Paper A's theory
6. **Comparative Analysis** - Paper B compares with Paper A
7. **Background Reference** - Paper A cited as background

## Usage

### Method 1: Click an Edge
1. Click on any edge connecting two papers
2. System automatically analyzes the relationship
3. Summary appears on the edge

### Method 2: Select Two Papers
1. Hold Ctrl (Windows/Linux) or Cmd (Mac)
2. Click on Paper A
3. Click on Paper B (while holding Ctrl/Cmd)
4. System creates edge and analyzes relationship

## API Response Format

```json
{
  "edgeId": "edge-paper1-paper2",
  "relationship": {
    "relationType": "Methodological Improvement",
    "summary": "Paper B improves the throughput of the database engine described in Paper A by 80% using safe DDL generation.",
    "confidenceScore": 0.95
  },
  "citationChunksFound": 3
}
```

## Performance Considerations

- **Non-blocking**: Analysis runs asynchronously, UI remains responsive
- **Context Window Management**: Limits to 2000 characters to stay within token limits
- **Semantic Chunking**: Only extracts relevant citation sections, not full papers
- **Caching**: Relationship metadata is stored in edge data, preventing re-analysis
- **Error Handling**: Falls back to "Background Reference" if analysis fails

## Configuration

The system uses the same Ollama configuration as concept extraction:
- Model: `llama3.2:3b` (default, configurable via `OLLAMA_MODEL`)
- Temperature: 0.2 (lower for consistent classification)
- Format: JSON (enforced for structured output)

## Future Enhancements

1. **Embedding-based Chunking**: Use embeddings for better semantic matching
2. **Batch Analysis**: Analyze multiple relationships in parallel
3. **Relationship History**: Track relationship analysis over time
4. **Confidence Thresholds**: Filter low-confidence relationships
5. **Custom Relationship Types**: Allow users to define custom types

