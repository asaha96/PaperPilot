'use client'

import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { BookOpen } from 'lucide-react'

interface CitationNodeProps {
  data: {
    type: 'citation'
    title: string
    summary?: string
    authors?: string[]
    year?: number
    isGhost?: boolean
  }
  selected?: boolean
}

function CitationNode({ data, selected }: CitationNodeProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border-2 border-dashed p-3 min-w-[220px] max-w-[260px] transition-all ${
        data.isGhost ? 'opacity-60 bg-gray-50 border-gray-300' : 'border-gray-200'
      } ${selected ? 'ring-2 ring-gray-400' : ''}`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-start gap-2 mb-2">
        <div className="p-1 bg-gray-100 rounded-md">
          <BookOpen className="w-4 h-4 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-xs text-gray-700 leading-tight line-clamp-2">
            {data.title}
          </h3>
          {data.authors && data.authors.length > 0 && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {data.authors[0]?.name || data.authors[0]}
              {data.authors.length > 1 && ` et al.`}
            </p>
          )}
          {data.year && (
            <p className="text-xs text-gray-400 mt-0.5">{data.year}</p>
          )}
        </div>
      </div>

      {data.summary && (
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mt-2">
          {data.summary}
        </p>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  )
}

export default memo(CitationNode)

