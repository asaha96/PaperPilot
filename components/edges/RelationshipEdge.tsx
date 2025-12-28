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

  // Color based on relationship type with clear mapping
  const getEdgeColor = () => {
    if (isAnalyzing) return '#94A3B8' // Light gray while analyzing
    if (!relationship) return '#64748B' // Medium gray for unanalyzed
    
    const type = relationship.relationType.toLowerCase()
    
    // Incremental or Methodological Improvement - Green
    if (type.includes('incremental') || type.includes('methodological improvement')) {
      return '#10B981' // Green
    }
    // Contradictory - Red
    if (type.includes('contradictory')) {
      return '#EF4444' // Red
    }
    // Applied - Blue
    if (type.includes('applied')) {
      return '#3B82F6' // Blue
    }
    // Theoretical Extension - Purple
    if (type.includes('theoretical extension') || type.includes('extension')) {
      return '#8B5CF6' // Purple
    }
    // Comparative Analysis - Amber/Orange
    if (type.includes('comparative') || type.includes('compare')) {
      return '#F59E0B' // Amber
    }
    // Background Reference - Gray
    if (type.includes('background')) {
      return '#64748B' // Gray
    }
    
    // Default for unknown types - Purple
    return '#8B5CF6'
  }

  // Get icon based on relationship type
  const getRelationshipIcon = () => {
    if (!relationship) return ''
    const type = relationship.relationType.toLowerCase()
    if (type.includes('incremental') || type.includes('improvement')) return '↑'
    if (type.includes('contradictory')) return '⚠'
    if (type.includes('applied')) return '→'
    if (type.includes('extension')) return '∞'
    if (type.includes('comparative') || type.includes('compare')) return '↔'
    if (type.includes('background')) return '•'
    return '•'
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
            x={-110}
            y={-25}
            width={220}
            height={50}
            fill="white"
            stroke={getEdgeColor()}
            strokeWidth={2.5}
            rx={8}
            opacity={0.98}
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
          />
          <circle
            cx={-95}
            cy={-5}
            r={6}
            fill={getEdgeColor()}
            opacity={0.2}
          />
          <text
            x={-80}
            y={0}
            fontSize={12}
            fontWeight="bold"
            fill={getEdgeColor()}
          >
            {getRelationshipIcon()}
          </text>
          <text
            x={0}
            y={-8}
            textAnchor="middle"
            fontSize={10}
            fontWeight="bold"
            fill={getEdgeColor()}
          >
            {relationship.relationType}
          </text>
          <text
            x={0}
            y={8}
            textAnchor="middle"
            fontSize={8.5}
            fill="#64748B"
            width={200}
          >
            {relationship.summary.substring(0, 70)}
            {relationship.summary.length > 70 ? '...' : ''}
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

