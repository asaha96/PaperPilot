import { NextRequest, NextResponse } from 'next/server'

// Ollama configuration
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b'

const SYSTEM_PROMPT = `You are an expert research assistant specializing in analyzing relationships between academic papers. You have access to the full context of both papers, their relationship metadata, and conversation history.

Your role is to answer questions about how two papers relate to each other, their methodologies, differences, improvements, and connections. Use the relationship metadata and paper summaries to provide accurate, contextual answers.

Always be concise, accurate, and cite specific details from the papers when possible.`

export async function POST(request: NextRequest) {
  try {
    const {
      question,
      sourcePaper,
      targetPaper,
      relationship,
      conversationHistory = [],
    } = await request.json()

    if (!question || !sourcePaper || !targetPaper) {
      return NextResponse.json(
        { error: 'Question and both papers are required' },
        { status: 400 }
      )
    }

    // Build context from relationship metadata
    const relationshipContext = relationship
      ? `Relationship Type: ${relationship.relationType}\nSummary: ${relationship.summary}\nConfidence: ${relationship.confidenceScore}`
      : 'No relationship metadata available.'

    // Build conversation history context
    const historyContext =
      conversationHistory.length > 0
        ? conversationHistory
            .slice(-4) // Last 4 messages for context
            .map((msg: any) => `${msg.role}: ${msg.content}`)
            .join('\n')
        : ''

    const userPrompt = `Answer the following question about the relationship between two research papers:

PAPER A (Source):
Title: ${sourcePaper.title}
Summary: ${sourcePaper.summary}
Authors: ${sourcePaper.authors?.join(', ') || 'Unknown'}

PAPER B (Target):
Title: ${targetPaper.title}
Summary: ${targetPaper.summary}
Authors: ${targetPaper.authors?.join(', ') || 'Unknown'}

RELATIONSHIP CONTEXT:
${relationshipContext}

${historyContext ? `\nCONVERSATION HISTORY:\n${historyContext}\n` : ''}

QUESTION: ${question}

Provide a clear, concise answer based on the paper summaries and relationship context. If the question cannot be answered from the available information, say so.`

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
            temperature: 0.7, // Slightly higher for more natural conversation
          },
          stream: false,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`)
      }

      const data = await response.json()
      const answer = data.message?.content || data.response || 'Unable to generate answer.'

      return NextResponse.json({ answer })
    } catch (error) {
      console.error('Ollama RAG error:', error)
      return NextResponse.json(
        { answer: 'I encountered an error processing your question. Please try again.' },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error in relationship RAG:', error)
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    )
  }
}



