'use client'

import { memo } from 'react'
import { Handle, Position } from 'reactflow'
import { FileText, Expand, Users, Calendar } from 'lucide-react'
import { PaperNode as PaperNodeType } from '@/types'

interface PaperNodeProps {
  id: string
  data: PaperNodeType['data']
  selected?: boolean
}

function PaperNode({ id, data, selected }: PaperNodeProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-lg border-2 p-4 min-w-[280px] max-w-[320px] transition-all ${
        selected ? 'border-blue-500 shadow-xl' : 'border-gray-200'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
            {data.title}
          </h3>
          {data.authors && data.authors.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
              <Users className="w-3 h-3" />
              <span className="truncate">{data.authors.slice(0, 2).join(', ')}</span>
              {data.authors.length > 2 && <span>+{data.authors.length - 2}</span>}
            </div>
          )}
          {data.year && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{data.year}</span>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-700 mb-3 line-clamp-3 leading-relaxed">
        {data.summary}
      </p>

      <button
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-xs font-medium transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          const event = new CustomEvent('expand-paper', { 
            detail: { nodeId: id }
          })
          window.dispatchEvent(event)
        }}
      >
        <Expand className="w-4 h-4" />
        Expand Concepts
      </button>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  )
}

export default memo(PaperNode)

