import { NextRequest, NextResponse } from 'next/server'
import { getPaperReferences } from '@/lib/semanticScholar'
import { PaperNode, PaperEdge } from '@/types'

// Ollama configuration
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b'

async function extractConceptsWithOllama(paperTitle: string, paperSummary: string) {
  const systemPrompt = `You are an expert at analyzing research papers and extracting atomic concepts. 
Always return valid JSON only, no markdown formatting, no code blocks, just pure JSON.`

  const userPrompt = `Analyze the following research paper and extract 5-8 key atomic concepts. Each concept should be:
1. A distinct, self-contained idea or technique
2. Clearly named (2-5 words)
3. Summarized in 1-2 sentences that reduce cognitive load for CS students
4. Rated by importance (high/medium/low)

Paper Title: ${paperTitle}
Paper Summary: ${paperSummary}

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "concepts": [
    {
      "id": "concept-1",
      "name": "Concept Name",
      "summary": "Clear, concise explanation",
      "importance": "high"
    }
  ]
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
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        options: {
          temperature: 0.3,
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
    return parsed.concepts || []
  } catch (error) {
    console.error('Ollama API error:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { paperTitle, paperSummary, paperId } = await request.json()

    if (!paperTitle || !paperSummary) {
      return NextResponse.json(
        { error: 'Paper title and summary are required' },
        { status: 400 }
      )
    }

    // Use Ollama for concept extraction
    let concepts
    try {
      concepts = await extractConceptsWithOllama(paperTitle, paperSummary)
      
      // Validate concepts structure
      if (!Array.isArray(concepts) || concepts.length === 0) {
        throw new Error('Invalid concepts format from Ollama')
      }
    } catch (error) {
      console.error('Error extracting concepts with Ollama:', error)
      // Fallback to mock concepts if Ollama fails
      console.log('Falling back to mock concepts')
      const mockData = getMockConcepts(paperTitle, paperSummary, paperId)
      return NextResponse.json(mockData)
    }

    // Fetch citations if paperId is provided
    let citationNodes: PaperNode[] = []
    let citationEdges: PaperEdge[] = []

    if (paperId) {
      try {
        const references = await getPaperReferences(paperId)
        citationNodes = references.slice(0, 10).map((ref, index) => ({
          id: `citation-${paperId}-${index}`,
          type: 'citation',
          position: { x: 0, y: 0 }, // Will be positioned by layout
          data: {
            type: 'citation',
            title: ref.title,
            summary: ref.venue ? `Published in ${ref.venue}${ref.year ? ` (${ref.year})` : ''}` : `Citation ${index + 1}`,
            authors: ref.authors?.map((a) => a.name) || [],
            year: ref.year,
            isGhost: true,
          },
        }))

        citationEdges = citationNodes.map((node, index) => ({
          id: `edge-citation-${paperId}-${index}`,
          source: paperId ? `paper-${paperId}` : 'paper-temp',
          target: node.id,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#94A3B8', strokeDasharray: '5,5' },
          data: { type: 'cites' },
        }))
      } catch (error) {
        console.error('Error fetching citations:', error)
      }
    }

    return NextResponse.json({
      concepts,
      citationNodes,
      citationEdges,
    })
  } catch (error) {
    console.error('Error extracting concepts:', error)
    return NextResponse.json(
      { error: 'Failed to extract concepts' },
      { status: 500 }
    )
  }
}

function getMockConcepts(paperTitle: string, paperSummary: string, paperId?: string) {
  // Mock concepts for development/testing
  const concepts = [
    {
      id: 'concept-1',
      name: 'Core Algorithm',
      summary: 'The main computational approach used to solve the problem',
      importance: 'high' as const,
    },
    {
      id: 'concept-2',
      name: 'Data Structure',
      summary: 'The way data is organized and accessed in the system',
      importance: 'high' as const,
    },
    {
      id: 'concept-3',
      name: 'Optimization Technique',
      summary: 'Methods used to improve performance or efficiency',
      importance: 'medium' as const,
    },
    {
      id: 'concept-4',
      name: 'Evaluation Metric',
      summary: 'How the approach is measured and validated',
      importance: 'medium' as const,
    },
    {
      id: 'concept-5',
      name: 'Baseline Comparison',
      summary: 'Comparison with existing approaches in the field',
      importance: 'low' as const,
    },
  ]

  return {
    concepts,
    citationNodes: [],
    citationEdges: [],
  }
}

