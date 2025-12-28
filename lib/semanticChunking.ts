/**
 * Semantic Chunking for Paper Relationship Analysis
 * Extracts relevant sections where papers cite each other
 */

export interface PaperChunk {
  text: string
  context: string
  relevanceScore: number
}

/**
 * Extracts relevant chunks from a paper's text that mention another paper
 * Uses simple keyword matching and context extraction for now
 * Can be enhanced with embeddings for better semantic matching
 */
export function extractCitationChunks(
  paperText: string,
  citedPaperTitle: string,
  citedPaperAuthors?: string[]
): PaperChunk[] {
  const chunks: PaperChunk[] = []
  const titleWords = citedPaperTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  
  // Split text into sentences
  const sentences = paperText.split(/[.!?]+/).filter(s => s.trim().length > 20)
  
  // Find sentences that mention the cited paper
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].toLowerCase()
    
    // Check if sentence contains title words or author names
    const hasTitleWords = titleWords.some(word => sentence.includes(word))
    const hasAuthorNames = citedPaperAuthors?.some(author => {
      const authorWords = author.toLowerCase().split(/\s+/)
      return authorWords.some(word => word.length > 3 && sentence.includes(word))
    })
    
    if (hasTitleWords || hasAuthorNames) {
      // Extract context: previous sentence + current + next sentence
      const contextStart = Math.max(0, i - 1)
      const contextEnd = Math.min(sentences.length, i + 2)
      const context = sentences.slice(contextStart, contextEnd).join('. ').trim()
      
      // Calculate relevance score (simple heuristic)
      const titleWordMatches = titleWords.filter(word => sentence.includes(word)).length
      const relevanceScore = Math.min(1.0, (titleWordMatches / titleWords.length) * 0.7 + (hasAuthorNames ? 0.3 : 0))
      
      chunks.push({
        text: sentences[i].trim(),
        context,
        relevanceScore,
      })
    }
  }
  
  // Sort by relevance and return top chunks
  return chunks
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5) // Return top 5 most relevant chunks
}

/**
 * Combines chunks into a context window suitable for LLM analysis
 * Limits total length to stay within token limits
 */
export function combineChunksForAnalysis(chunks: PaperChunk[], maxLength: number = 2000): string {
  let combined = ''
  
  for (const chunk of chunks) {
    const chunkText = chunk.context
    if (combined.length + chunkText.length > maxLength) {
      break
    }
    combined += chunkText + '\n\n'
  }
  
  return combined.trim()
}

