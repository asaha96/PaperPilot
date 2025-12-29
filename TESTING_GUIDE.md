# Testing Guide for PaperPilot

This guide explains how to test the relationship analysis and Graph-RAG features in PaperPilot.

## Prerequisites

1. **Ollama is running**: Make sure Ollama is installed and running on your system
   ```bash
   ollama serve
   ```

2. **Ollama model is available**: Ensure you have a model downloaded (e.g., `llama3.2:3b`)
   ```bash
   ollama pull llama3.2:3b
   ```

3. **Next.js dev server is running**:
   ```bash
   npm run dev
   ```

## Testing Relationship Analysis

### Method 1: Click on an Edge

1. **Add two papers to the canvas**:
   - Click "Add Paper" button
   - Enter title and summary for Paper A
   - Click "Add to Canvas"
   - Repeat for Paper B

2. **Create a connection**:
   - If papers are already connected (e.g., from citation expansion), an edge should exist
   - If not, you can manually connect them by dragging from one node to another

3. **Click on the edge**:
   - Click anywhere on the edge connecting the two papers
   - The edge will show "Analyzing..." in gray
   - After a few seconds, the edge will update with:
     - **Color-coded line** based on relationship type
     - **Relationship type label** (e.g., "Incremental", "Contradictory", "Applied")
     - **2-sentence summary** of the relationship

4. **Check the legend**:
   - Click the "Legend" button in the top-right corner
   - Verify the edge color matches the relationship type in the legend

### Method 2: Select Two Papers (Ctrl/Cmd + Click)

1. **Add two papers** to the canvas (same as above)

2. **Select both papers**:
   - Hold **Ctrl** (Windows/Linux) or **Cmd** (Mac)
   - Click on Paper A
   - While holding Ctrl/Cmd, click on Paper B
   - The relationship analysis will start automatically

3. **Observe the analysis**:
   - An edge will be created if it doesn't exist
   - The edge will show "Analyzing..." state
   - After analysis completes, the edge will display the relationship metadata

## Testing Graph-RAG (Relationship Chat)

### Step 1: Analyze a Relationship First

Before you can use Graph-RAG, you need to have an analyzed relationship:

1. Follow either Method 1 or Method 2 above to analyze a relationship between two papers
2. Wait for the analysis to complete (edge should show relationship type and summary)

### Step 2: Open the Relationship Chat

1. **Click on an analyzed edge** (one that has relationship metadata)
2. A chat interface will appear in the bottom-right corner
3. The chat shows:
   - Paper A title (truncated)
   - Paper B title (truncated)
   - A message suggesting example questions

### Step 3: Ask Questions

Try asking questions about the relationship:

**Example Questions:**
- "How does the methodology differ between these papers?"
- "What are the key improvements in Paper B?"
- "Compare their approaches to the problem"
- "What specific techniques does Paper B build upon from Paper A?"
- "Are there any contradictions between these papers?"

### Step 4: Verify Responses

1. **Check the response quality**:
   - The AI should provide context-aware answers
   - Answers should reference both papers
   - Answers should incorporate the relationship metadata

2. **Test conversation flow**:
   - Ask follow-up questions
   - The chat maintains conversation history (last 4 messages)
   - Responses should be contextually aware of previous questions

3. **Test error handling**:
   - If Ollama is not running, you should see an error message
   - The chat should gracefully handle errors

## Color Coding Reference

The relationship types are color-coded as follows:

- **🟢 Green** (`#10B981`): Incremental, Methodological Improvement
  - Paper B builds upon or improves Paper A

- **🔴 Red** (`#EF4444`): Contradictory
  - Paper B challenges or contradicts Paper A

- **🔵 Blue** (`#3B82F6`): Applied
  - Paper B applies Paper A's methods to a new domain

- **🟣 Purple** (`#8B5CF6`): Theoretical Extension
  - Paper B extends Paper A's theory

- **🟠 Amber** (`#F59E0B`): Comparative Analysis
  - Paper B compares with Paper A

- **⚫ Gray** (`#64748B`): Background Reference
  - Paper A cited as background context

- **⚪ Light Gray** (`#94A3B8`): Unanalyzed
  - Relationship not yet analyzed (dashed line)

## Troubleshooting

### Relationship Analysis Not Working

1. **Check Ollama connection**:
   ```bash
   curl http://localhost:11434/api/tags
   ```
   Should return a list of available models

2. **Check browser console**:
   - Open Developer Tools (F12)
   - Look for errors in the Console tab
   - Check Network tab for failed API calls

3. **Verify API endpoint**:
   ```bash
   curl -X POST http://localhost:3000/api/summarize-relationship \
     -H "Content-Type: application/json" \
     -d '{"paperA":{"title":"Test A","summary":"Summary A"},"paperB":{"title":"Test B","summary":"Summary B"},"edgeId":"test-edge"}'
   ```

### Graph-RAG Not Working

1. **Ensure relationship is analyzed first**:
   - The edge must have relationship metadata
   - Click the edge to verify it shows a relationship type

2. **Check Ollama is running**:
   - Same as above, verify Ollama is accessible

3. **Check API endpoint**:
   ```bash
   curl -X POST http://localhost:3000/api/relationship-rag \
     -H "Content-Type: application/json" \
     -d '{"question":"Test question","sourcePaper":{"title":"A","summary":"Summary A"},"targetPaper":{"title":"B","summary":"Summary B"}}'
   ```

### Edge Not Clickable

1. **Verify edge has relationship data**:
   - Unanalyzed edges may not open the chat
   - Analyze the relationship first

2. **Check z-index issues**:
   - Make sure no other UI elements are blocking the edge
   - Try zooming in/out

## Expected Behavior

### Relationship Analysis
- **Latency**: Should complete within 2-5 seconds (depending on model size)
- **Visual feedback**: Edge shows "Analyzing..." during processing
- **Result**: Edge displays colored line, relationship type, and summary

### Graph-RAG
- **Response time**: 2-5 seconds per question
- **Context awareness**: Answers reference both papers and relationship
- **Conversation**: Maintains context across multiple questions
- **Error handling**: Graceful fallback if Ollama is unavailable

## Advanced Testing

### Test with Real Papers

1. Use Semantic Scholar search to add real papers
2. Use "Explode" feature to extract concepts and citations
3. Analyze relationships between connected papers
4. Ask detailed questions about methodology, results, and contributions

### Test Edge Cases

1. **Very long summaries**: Test with papers that have 2000+ character summaries
2. **Missing metadata**: Test with papers that have minimal information
3. **Multiple relationships**: Analyze multiple edges simultaneously
4. **Rapid clicking**: Test UI responsiveness with multiple quick analyses

### Performance Testing

1. **Monitor latency**: Check browser Network tab for API call durations
2. **Concurrent requests**: Test multiple relationship analyses at once
3. **Large graphs**: Test with 10+ papers and multiple relationships



