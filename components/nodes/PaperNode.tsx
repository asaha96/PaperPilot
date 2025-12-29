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
      className={`group relative bg-surface-elevated rounded-2xl shadow-xl border-2 p-5 min-w-[300px] max-w-[340px] transition-all duration-300 backdrop-blur-sm ${
        selected 
          ? 'border-paper-primary shadow-glow-lg ring-2 ring-paper-primary/30' 
          : 'border-border/50 hover:border-paper-primary/50 hover:shadow-2xl'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-paper-primary !border-2 !border-surface-elevated" />
      
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-paper-primary via-paper-secondary to-paper-primary rounded-t-2xl" />
      
      <div className="flex items-start gap-4 mb-4">
        <div className="p-2.5 bg-gradient-to-br from-paper-primary/20 to-paper-secondary/20 rounded-xl border border-paper-primary/30 backdrop-blur-sm">
          <FileText className="w-5 h-5 text-paper-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground text-base leading-tight mb-2 line-clamp-2 group-hover:text-paper-primary transition-colors">
            {data.title}
          </h3>
          {data.authors && data.authors.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted mb-1.5">
              <Users className="w-3.5 h-3.5" />
              <span className="truncate font-medium">{data.authors.slice(0, 2).join(', ')}</span>
              {data.authors.length > 2 && <span className="text-paper-primary">+{data.authors.length - 2}</span>}
            </div>
          )}
          {data.year && (
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Calendar className="w-3.5 h-3.5" />
              <span className="font-medium">{data.year}</span>
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-foreground/80 mb-4 line-clamp-3 leading-relaxed">
        {data.summary}
      </p>

      <div className="flex gap-2">
        <button
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-paper-primary/10 to-paper-secondary/10 hover:from-paper-primary/20 hover:to-paper-secondary/20 border border-paper-primary/30 text-paper-primary rounded-xl text-xs font-semibold transition-all duration-200 hover:scale-105 hover:shadow-glow"
          onClick={(e) => {
            e.stopPropagation()
            const event = new CustomEvent('expand-paper', { 
              detail: { nodeId: id }
            })
            window.dispatchEvent(event)
          }}
        >
          <Expand className="w-4 h-4" />
          Explode
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-paper-primary !border-2 !border-surface-elevated" />
    </div>
  )
}

export default memo(PaperNode)

