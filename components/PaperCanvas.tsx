'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  NodeTypes,
  EdgeTypes,
  ReactFlowInstance,
} from 'reactflow'
import 'reactflow/dist/style.css'
import PaperNode from './nodes/PaperNode'
import ConceptNode from './nodes/ConceptNode'
import CitationNode from './nodes/CitationNode'
import RelationshipEdge from './edges/RelationshipEdge'
import RelationshipChat from './RelationshipChat'
import RelationshipLegend from './RelationshipLegend'
import { getLayoutedElements } from '@/lib/graphLayout'
import { PaperNode as PaperNodeType, PaperEdge } from '@/types'
import PaperInput from './PaperInput'

const nodeTypes: NodeTypes = {
  paper: PaperNode,
  concept: ConceptNode,
  citation: CitationNode,
}

const edgeTypes: EdgeTypes = {
  default: RelationshipEdge,
  smoothstep: RelationshipEdge,
}

const initialNodes: Node[] = []
const initialEdges: Edge[] = []

export default function PaperCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isExpanding, setIsExpanding] = useState(false)
  const expandingNodeId = useRef<string | null>(null)
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null)
  const selectedNodes = useRef<Set<string>>(new Set())
  const [chatEdge, setChatEdge] = useState<Edge | null>(null)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handleAddPaper = useCallback(async (paperData: {
    title: string
    summary: string
    authors?: string[]
    year?: number
    paperId?: string
  }) => {
    const nodeId = paperData.paperId ? `paper-${paperData.paperId}` : `paper-${Date.now()}`
    const newNode: PaperNodeType = {
      id: nodeId,
      type: 'paper',
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
      data: {
        type: 'paper',
        title: paperData.title,
        summary: paperData.summary,
        authors: paperData.authors || [],
        year: paperData.year,
        paperId: paperData.paperId,
      },
    }

    console.log('Adding new node:', newNode.id, newNode.data.title)
    setNodes((nds) => {
      const updated = [...nds, newNode]
      console.log('Total nodes after add:', updated.length)
      return updated
    })
  }, [setNodes])

  const handleExpandPaper = useCallback(async (nodeId: string) => {
    if (isExpanding || expandingNodeId.current === nodeId) return

    setIsExpanding(true)
    expandingNodeId.current = nodeId

    const node = nodes.find((n) => n.id === nodeId) as PaperNodeType
    if (!node || node.data.type !== 'paper') {
      setIsExpanding(false)
      return
    }

    try {
      // Fetch concepts and citations
      const response = await fetch('/api/extract-concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperTitle: node.data.title,
          paperSummary: node.data.summary,
          paperId: node.data.paperId,
        }),
      })

      const responseData = await response.json()
      console.log('API Response:', responseData)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const { concepts, citationNodes = [], citationEdges = [] } = responseData
      
      if (!concepts || !Array.isArray(concepts) || concepts.length === 0) {
        console.error('No concepts returned from API')
        throw new Error('No concepts found')
      }

      console.log(`Creating ${concepts.length} concept nodes`)

      // Update citation edges to use the correct source node ID
      const updatedCitationEdges = citationEdges.map((edge: Edge) => ({
        ...edge,
        source: nodeId,
      }))

      // Create concept nodes with explosion animation
      const conceptNodes: Node[] = concepts.map((concept: any, index: number) => {
        const angle = (index * 2 * Math.PI) / concepts.length
        const radius = 300
        return {
          id: `concept-${nodeId}-${concept.id || index}`,
          type: 'concept',
          position: {
            x: node.position.x + Math.cos(angle) * radius,
            y: node.position.y + Math.sin(angle) * radius,
          },
          data: {
            type: 'concept',
            title: concept.name || `Concept ${index + 1}`,
            summary: concept.summary || '',
            importance: concept.importance || 'medium',
          },
        }
      })
      
      console.log('Created concept nodes:', conceptNodes.map(n => ({ id: n.id, position: n.position })))

      // Create edges from paper to concepts
      const conceptEdges: Edge[] = concepts.map((concept: any, index: number) => ({
        id: `edge-${nodeId}-concept-${concept.id || index}`,
        source: nodeId,
        target: `concept-${nodeId}-${concept.id || index}`,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#10B981', strokeWidth: 2 },
        data: { type: 'contains' },
      }))
      
      console.log('Created concept edges:', conceptEdges.length)

      // Add all new nodes and edges
      console.log('Adding nodes and edges to canvas')
      setNodes((nds) => {
        const updated = [...nds, ...conceptNodes, ...citationNodes]
        console.log(`Total nodes: ${nds.length} -> ${updated.length}`)
        return updated
      })
      setEdges((eds) => {
        const updated = [...eds, ...conceptEdges, ...updatedCitationEdges]
        console.log(`Total edges: ${eds.length} -> ${updated.length}`)
        return updated
      })

      // Apply layout after a short delay to allow explosion animation
      setTimeout(() => {
        console.log('Applying layout to all nodes')
        const allNodes = [...nodes, ...conceptNodes, ...citationNodes]
        const allEdges = [...edges, ...conceptEdges, ...updatedCitationEdges]
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          allNodes,
          allEdges
        )
        console.log('Layouted nodes:', layoutedNodes.length, 'Layouted edges:', layoutedEdges.length)
        setNodes(layoutedNodes)
        setEdges(layoutedEdges)
        
        // Fit view to show all nodes
        setTimeout(() => {
          if (reactFlowInstance.current) {
            reactFlowInstance.current.fitView({ padding: 0.2, maxZoom: 1.5 })
          }
        }, 100)
      }, 300)

      // Note: React Flow handles node visibility automatically, no need for opacity animation
      // The nodes should be visible immediately
    } catch (error) {
      console.error('Error expanding paper:', error)
    } finally {
      setIsExpanding(false)
      expandingNodeId.current = null
    }
  }, [nodes, edges, setNodes, setEdges, isExpanding])

  // Listen for expand events from PaperNode
  useEffect(() => {
    const handleExpand = (e: Event) => {
      const customEvent = e as CustomEvent
      handleExpandPaper(customEvent.detail.nodeId)
    }
    window.addEventListener('expand-paper', handleExpand)
    return () => window.removeEventListener('expand-paper', handleExpand)
  }, [handleExpandPaper])

  const handleAnalyzeRelationship = useCallback(async (edgeId: string, sourceId: string, targetId: string) => {
    const sourceNode = nodes.find(n => n.id === sourceId) as PaperNodeType
    const targetNode = nodes.find(n => n.id === targetId) as PaperNodeType

    if (!sourceNode || !targetNode || sourceNode.data.type !== 'paper' || targetNode.data.type !== 'paper') {
      console.error('Both nodes must be papers for relationship analysis')
      return
    }

    // Mark edge as analyzing
    setEdges((eds) =>
      eds.map((e) =>
        e.id === edgeId
          ? { ...e, data: { ...e.data, isAnalyzing: true } }
          : e
      )
    )

    try {
      const response = await fetch('/api/summarize-relationship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperA: {
            title: sourceNode.data.title,
            summary: sourceNode.data.summary,
            authors: sourceNode.data.authors,
          },
          paperB: {
            title: targetNode.data.title,
            summary: targetNode.data.summary,
            authors: targetNode.data.authors,
          },
          edgeId,
        }),
      })

      const { relationship } = await response.json()

      // Update edge with relationship metadata
      setEdges((eds) =>
        eds.map((e) => {
          if (e.id === edgeId) {
            const updatedEdge = {
              ...e,
              data: {
                ...e.data,
                relationship,
                isAnalyzing: false,
                label: relationship.summary.substring(0, 50) + '...',
              },
            }
            // Auto-open chat if relationship was just analyzed
            setChatEdge(updatedEdge)
            return updatedEdge
          }
          return e
        })
      )
    } catch (error) {
      console.error('Error analyzing relationship:', error)
      setEdges((eds) =>
        eds.map((e) =>
          e.id === edgeId ? { ...e, data: { ...e.data, isAnalyzing: false } } : e
        )
      )
    }
  }, [nodes, setEdges])

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance
  }, [])

  return (
    <div className="w-full h-full relative" style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(event, node) => {
          console.log('Node clicked:', node.id, node.data.type)
          
          // Handle multi-select for relationship analysis
          if (event.ctrlKey || event.metaKey) {
            if (selectedNodes.current.has(node.id)) {
              selectedNodes.current.delete(node.id)
            } else {
              selectedNodes.current.add(node.id)
            }
            
            // If two papers are selected, analyze their relationship
            if (selectedNodes.current.size === 2 && node.data.type === 'paper') {
              const selectedArray = Array.from(selectedNodes.current)
              const node1 = nodes.find(n => n.id === selectedArray[0]) as PaperNodeType
              const node2 = nodes.find(n => n.id === selectedArray[1]) as PaperNodeType
              
              if (node1 && node2 && node1.data.type === 'paper' && node2.data.type === 'paper') {
                // Find or create edge between the two papers
                let existingEdge: Edge | undefined = edges.find(
                  e => (e.source === selectedArray[0] && e.target === selectedArray[1]) ||
                       (e.source === selectedArray[1] && e.target === selectedArray[0])
                )
                
                if (!existingEdge) {
                  // Create new edge
                  const newEdge: Edge = {
                    id: `edge-${selectedArray[0]}-${selectedArray[1]}`,
                    source: selectedArray[0],
                    target: selectedArray[1],
                    type: 'smoothstep',
                    data: { type: 'related' },
                  }
                  setEdges((eds) => [...eds, newEdge])
                  existingEdge = newEdge
                }
                
                // Analyze relationship
                if (existingEdge.id && existingEdge.source && existingEdge.target) {
                  handleAnalyzeRelationship(existingEdge.id, existingEdge.source, existingEdge.target)
                }
                selectedNodes.current.clear()
              }
            }
          } else {
            // Single click - expand paper
            if (node.data.type === 'paper') {
              handleExpandPaper(node.id)
            }
            selectedNodes.current.clear()
          }
        }}
        onEdgeClick={(event, edge) => {
          console.log('Edge clicked:', edge.id)
          
          // If relationship exists, open chat. Otherwise, analyze first.
          const edgeData = edge.data as any
          if (edgeData?.relationship) {
            setChatEdge(edge)
          } else if (edge.source && edge.target && !edgeData?.isAnalyzing) {
            handleAnalyzeRelationship(edge.id, edge.source, edge.target)
            // After analysis, the edge will be updated and can be clicked again for chat
          }
        }}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 1.5 }}
        className="bg-transparent"
        style={{ width: '100%', height: '100%' }}
      >
        <Background 
          variant={BackgroundVariant.Dots}
          gap={20} 
          size={1}
          color="rgba(99, 102, 241, 0.15)"
        />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.data?.type === 'paper') return '#3B82F6'
            if (node.data?.type === 'concept') return '#10B981'
            if (node.data?.type === 'citation') return '#94A3B8'
            return '#ccc'
          }}
        />
      </ReactFlow>
          <PaperInput onAddPaper={handleAddPaper} />
          <RelationshipLegend />
          {chatEdge && chatEdge.source && chatEdge.target && (
            <RelationshipChat
              edge={chatEdge}
              sourceNode={nodes.find(n => n.id === chatEdge.source) as PaperNodeType}
              targetNode={nodes.find(n => n.id === chatEdge.target) as PaperNodeType}
              onClose={() => setChatEdge(null)}
            />
          )}
        </div>
      )
    }

