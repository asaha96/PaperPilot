import { NextRequest, NextResponse } from 'next/server'
import { searchPaper } from '@/lib/semanticScholar'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const paper = await searchPaper(query)

    if (!paper) {
      return NextResponse.json(
        { error: 'Paper not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      paperId: paper.paperId,
      title: paper.title,
      authors: paper.authors?.map((a) => a.name) || [],
      year: paper.year,
      venue: paper.venue,
      citationCount: paper.citationCount,
      referenceCount: paper.referenceCount,
    })
  } catch (error) {
    console.error('Error searching paper:', error)
    return NextResponse.json(
      { error: 'Failed to search paper' },
      { status: 500 }
    )
  }
}

