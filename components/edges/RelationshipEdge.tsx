'use client'

import { memo } from 'react'
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow'
import { RelationshipMetadata } from '@/types'

interface RelationshipEdgeProps extends EdgeProps {
  data?: {
    relationship?: RelationshipMetadata
    isAnalyzing?: boolean
  }
}

function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: RelationshipEdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const relationship = data?.relationship
  const isAnalyzing = data?.isAnalyzing

  // Color based on relationship type
  const getEdgeColor = () => {
    if (isAnalyzing) return '#94A3B8' // Gray while analyzing
    if (!relationship) return '#64748B' // Default gray
    
    const type = relationship.relationType.toLowerCase()
    if (type.includes('incremental') || type.includes('improvement')) return '#10B981' // Green
    if (type.includes('contradictory')) return '#EF4444' // Red
    if (type.includes('applied')) return '#3B82F6' // Blue
    return '#8B5CF6' // Purple for others
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: getEdgeColor(),
          strokeWidth: relationship ? 3 : 2,
          strokeDasharray: relationship ? '0' : '5,5',
        }}
      />
      {relationship && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x={-100}
            y={-20}
            width={200}
            height={40}
            fill="white"
            stroke={getEdgeColor()}
            strokeWidth={2}
            rx={8}
            opacity={0.95}
          />
          <text
            x={0}
            y={-5}
            textAnchor="middle"
            fontSize={10}
            fontWeight="bold"
            fill={getEdgeColor()}
          >
            {relationship.relationType}
          </text>
          <text
            x={0}
            y={10}
            textAnchor="middle"
            fontSize={9}
            fill="#64748B"
            width={180}
          >
            {relationship.summary.substring(0, 60)}
            {relationship.summary.length > 60 ? '...' : ''}
          </text>
        </g>
      )}
      {isAnalyzing && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <text
            x={0}
            y={0}
            textAnchor="middle"
            fontSize={10}
            fill="#64748B"
          >
            Analyzing...
          </text>
        </g>
      )}
    </>
  )
}

export default memo(RelationshipEdge)

