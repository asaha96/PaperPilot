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
  const importanceConfig = {
    high: {
      bgColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: 'rgba(16, 185, 129, 0.4)',
      textColor: '#10b981',
      iconBg: 'rgba(16, 185, 129, 0.2)',
    },
    medium: {
      bgColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: 'rgba(245, 158, 11, 0.4)',
      textColor: '#f59e0b',
      iconBg: 'rgba(245, 158, 11, 0.2)',
    },
    low: {
      bgColor: 'rgba(100, 116, 139, 0.1)',
      borderColor: 'rgba(100, 116, 139, 0.4)',
      textColor: '#64748b',
      iconBg: 'rgba(100, 116, 139, 0.2)',
    },
  }

  const config = importanceConfig[data.importance || 'medium']

  return (
    <div
      className={`group relative bg-surface-elevated rounded-xl shadow-lg border-2 p-4 min-w-[260px] max-w-[300px] transition-all duration-300 backdrop-blur-sm ${
        selected ? 'ring-2 shadow-glow' : 'hover:shadow-xl'
      }`}
      style={{
        backgroundColor: `color-mix(in srgb, ${config.bgColor} 100%, var(--surface-elevated))`,
        borderColor: config.borderColor,
      }}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !border-2 !border-surface-elevated"
        style={{ backgroundColor: config.textColor }}
      />
      
      {/* Subtle gradient accent */}
      <div 
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl opacity-50"
        style={{ background: `linear-gradient(to right, transparent, ${config.textColor}, transparent)` }}
      />
      
      <div className="flex items-start gap-3 mb-3">
        <div 
          className="p-2 rounded-lg border"
          style={{ 
            backgroundColor: config.iconBg,
            borderColor: config.borderColor,
          }}
        >
          <Lightbulb className="w-4 h-4" style={{ color: config.textColor }} />
        </div>
        <h3 
          className="font-bold text-sm leading-tight flex-1 group-hover:scale-105 transition-transform"
          style={{ color: config.textColor }}
        >
          {data.title}
        </h3>
      </div>

      <p className="text-xs text-foreground/80 leading-relaxed line-clamp-4 font-medium">
        {data.summary}
      </p>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 !border-2 !border-surface-elevated"
        style={{ backgroundColor: config.textColor }}
      />
    </div>
  )
}

export default memo(ConceptNode)



