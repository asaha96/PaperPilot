import { Node, Edge } from 'reactflow'

export interface PaperNode extends Node {
  data: {
    type: 'paper' | 'concept' | 'citation'
    title: string
    summary: string
    authors?: string[]
    year?: number
    paperId?: string
    doi?: string
    isGhost?: boolean
    concepts?: Concept[]
  }
}

export interface Concept {
  id: string
  name: string
  summary: string
  importance: 'high' | 'medium' | 'low'
}

export interface RelationshipMetadata {
  relationType: string
  summary: string
  confidenceScore: number
}

export interface PaperEdge extends Edge {
  data?: {
    type: 'cites' | 'contains' | 'related'
    label?: string
    relationship?: RelationshipMetadata
    isAnalyzing?: boolean
  }
}

export interface ConceptExtractionResponse {
  concepts: Concept[]
  nodes: PaperNode[]
  edges: PaperEdge[]
}

export interface SemanticScholarPaper {
  paperId: string
  title: string
  authors: Array<{ name: string }>
  year: number
  venue?: string
  citationCount?: number
  referenceCount?: number
}

