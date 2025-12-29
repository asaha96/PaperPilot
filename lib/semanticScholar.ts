import axios from 'axios'
import { SemanticScholarPaper } from '@/types'

const SEMANTIC_SCHOLAR_API = 'https://api.semanticscholar.org/graph/v1'

export async function searchPaper(query: string): Promise<SemanticScholarPaper | null> {
  try {
    const response = await axios.get(`${SEMANTIC_SCHOLAR_API}/paper/search`, {
      params: {
        query,
        limit: 1,
        fields: 'title,authors,year,venue,citationCount,referenceCount',
      },
    })

    if (response.data.data && response.data.data.length > 0) {
      return response.data.data[0]
    }
    return null
  } catch (error) {
    console.error('Error searching Semantic Scholar:', error)
    return null
  }
}

export async function getPaperCitations(paperId: string): Promise<SemanticScholarPaper[]> {
  try {
    const response = await axios.get(
      `${SEMANTIC_SCHOLAR_API}/paper/${paperId}/citations`,
      {
        params: {
          limit: 20,
          fields: 'title,authors,year,venue,citationCount',
        },
      }
    )

    return response.data.data?.map((item: any) => item.citingPaper) || []
  } catch (error) {
    console.error('Error fetching citations:', error)
    return []
  }
}

export async function getPaperReferences(paperId: string): Promise<SemanticScholarPaper[]> {
  try {
    const response = await axios.get(
      `${SEMANTIC_SCHOLAR_API}/paper/${paperId}/references`,
      {
        params: {
          limit: 20,
          fields: 'title,authors,year,venue,citationCount',
        },
      }
    )

    return response.data.data?.map((item: any) => item.citedPaper) || []
  } catch (error) {
    console.error('Error fetching references:', error)
    return []
  }
}



