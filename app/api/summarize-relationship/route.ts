import { NextRequest, NextResponse } from 'next/server'
import { extractCitationChunks, combineChunksForAnalysis } from '@/lib/semanticChunking'

// Ollama configuration
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b'

export interface RelationshipMetadata {
  relationType: string
  summary: string
  confidenceScore: number
}

const SYSTEM_PROMPT = `You are an expert research paper analyst specializing in identifying relationships between academic papers.

Your task is to analyze how two papers relate to each other and classify their relationship type.

RELATIONSHIP TYPES:
1. "Incremental" - Paper B builds upon or extends the work in Paper A
2. "Contradictory" - Paper B challenges, refutes, or contradicts findings in Paper A
3. "Applied" - Paper B applies methods or concepts from Paper A to a new domain or problem
4. "Methodological Improvement" - Paper B improves upon the methodology or techniques in Paper A
5. "Theoretical Extension" - Paper B extends the theoretical framework from Paper A
6. "Comparative Analysis" - Paper B compares its approach with Paper A
7. "Background Reference" - Paper A is cited as background or related work without direct extension

Always return valid JSON only, no markdown formatting, no code blocks, just pure JSON.`

async function analyzeRelationshipWithOllama(
  paperATitle: string,
  paperASummary: string,
  paperBTitle: string,
  paperBSummary: string,
  citationContext: string
): Promise<RelationshipMetadata> {
  const userPrompt = `Analyze the relationship between two research papers:

PAPER A:
Title: ${paperATitle}
Summary: ${paperASummary}

PAPER B:
Title: ${paperBTitle}
Summary: ${paperBSummary}

CITATION CONTEXT (where Paper B mentions Paper A):
${citationContext || 'No specific citation context available. Use the summaries above.'}

Based on this information, determine:
1. The relationship type (choose from the types listed in the system prompt)
2. A concise 2-sentence summary of how the papers relate
3. A confidence score (0.0 to 1.0) indicating how certain you are about this relationship

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "relationType": "Incremental",
  "summary": "Paper B extends the database optimization techniques from Paper A by introducing a new indexing strategy that improves query performance by 40%.",
  "confidenceScore": 0.92
}`

  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        options: {
          temperature: 0.2, // Lower temperature for more consistent relationship classification
          format: 'json',
        },
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const content = data.message?.content || data.response || ''
    
    // Clean the response - remove markdown code blocks if present
    let cleanedContent = content.trim()
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    const parsed = JSON.parse(cleanedContent)
    
    // Validate and normalize the response
    return {
      relationType: parsed.relationType || 'Background Reference',
      summary: parsed.summary || 'Relationship analysis unavailable.',
      confidenceScore: Math.max(0, Math.min(1, parsed.confidenceScore || 0.5)),
    }
  } catch (error) {
    console.error('Ollama relationship analysis error:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      paperA,
      paperB,
      edgeId,
    } = await request.json()

    if (!paperA || !paperB) {
      return NextResponse.json(
        { error: 'Both papers are required' },
        { status: 400 }
      )
    }

    // Extract citation chunks from Paper B that mention Paper A
    const citationChunks = extractCitationChunks(
      paperB.summary || paperB.text || '',
      paperA.title,
      paperA.authors
    )

    // Combine chunks for analysis (limit to 2000 chars for context window)
    const citationContext = combineChunksForAnalysis(citationChunks, 2000)

    // If no citation context found, use summaries
    const contextToUse = citationContext || 
      `Paper A Summary: ${paperA.summary}\n\nPaper B Summary: ${paperB.summary}`

    // Analyze relationship with Ollama (non-blocking - returns immediately)
    const relationshipMetadata = await analyzeRelationshipWithOllama(
      paperA.title,
      paperA.summary || '',
      paperB.title,
      paperB.summary || '',
      contextToUse
    )

    return NextResponse.json({
      edgeId,
      relationship: relationshipMetadata,
      citationChunksFound: citationChunks.length,
    })
  } catch (error) {
    console.error('Error summarizing relationship:', error)
    
    // Return fallback relationship metadata on error
    return NextResponse.json({
      relationship: {
        relationType: 'Background Reference',
        summary: 'Relationship analysis unavailable. Papers may be related but specific connection could not be determined.',
        confidenceScore: 0.3,
      },
      error: 'Analysis failed, using fallback',
    }, { status: 200 }) // Return 200 so UI can still display something
  }
}



