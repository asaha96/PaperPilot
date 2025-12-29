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
      className={`group relative bg-surface-elevated rounded-xl shadow-md border-2 border-dashed p-4 min-w-[240px] max-w-[280px] transition-all duration-300 backdrop-blur-sm ${
        data.isGhost 
          ? 'opacity-50 bg-surface/50 border-muted/40' 
          : 'border-muted/50 hover:border-muted hover:shadow-lg'
      } ${selected ? 'ring-2 ring-muted shadow-glow' : ''}`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-muted !border-2 !border-surface-elevated"
      />
      
      {/* Subtle pattern overlay for ghost nodes */}
      {data.isGhost && (
        <div className="absolute inset-0 rounded-xl opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 20px)',
        }} />
      )}
      
      <div className="flex items-start gap-3 mb-2.5 relative z-10">
        <div className={`p-2 rounded-lg border ${
          data.isGhost 
            ? 'bg-muted/10 border-muted/30' 
            : 'bg-muted/20 border-muted/40'
        }`}>
          <BookOpen className={`w-4 h-4 ${data.isGhost ? 'text-muted' : 'text-muted'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-xs leading-tight line-clamp-2 ${
            data.isGhost ? 'text-muted' : 'text-foreground/80'
          }`}>
            {data.title}
          </h3>
          {data.authors && data.authors.length > 0 && (
            <p className={`text-xs mt-1.5 truncate ${
              data.isGhost ? 'text-muted/70' : 'text-muted'
            }`}>
              {data.authors[0]}
              {data.authors.length > 1 && ` et al.`}
            </p>
          )}
          {data.year && (
            <p className={`text-xs mt-1 ${
              data.isGhost ? 'text-muted/60' : 'text-muted/70'
            }`}>
              {data.year}
            </p>
          )}
        </div>
      </div>

      {data.summary && (
        <p className={`text-xs leading-relaxed line-clamp-2 mt-2.5 relative z-10 ${
          data.isGhost ? 'text-muted/60' : 'text-foreground/70'
        }`}>
          {data.summary}
        </p>
      )}

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 !bg-muted !border-2 !border-surface-elevated"
      />
    </div>
  )
}

export default memo(CitationNode)

