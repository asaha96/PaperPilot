'use client'

import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { Lightbulb } from 'lucide-react'

interface ConceptNodeProps {
  data: {
    type: 'concept'
    title: string
    summary: string
    importance?: 'high' | 'medium' | 'low'
  }
  selected?: boolean
}

function ConceptNode({ data, selected }: ConceptNodeProps) {
  const importanceColors = {
    high: 'bg-green-100 text-green-700 border-green-300',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    low: 'bg-gray-100 text-gray-700 border-gray-300',
  }

  const colorClass = importanceColors[data.importance || 'medium']

  return (
    <div
      className={`bg-white rounded-lg shadow-md border-2 p-4 min-w-[240px] max-w-[280px] transition-all ${colorClass} ${
        selected ? 'ring-2 ring-green-500' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-start gap-2 mb-2">
        <div className={`p-1.5 rounded-md ${colorClass}`}>
          <Lightbulb className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-sm text-gray-900 leading-tight flex-1">
          {data.title}
        </h3>
      </div>

      <p className="text-xs text-gray-700 leading-relaxed line-clamp-4">
        {data.summary}
      </p>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  )
}

export default memo(ConceptNode)

