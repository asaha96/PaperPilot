'use client'

import { Info } from 'lucide-react'
import { useState } from 'react'

const RELATIONSHIP_TYPES = [
  {
    type: 'Incremental',
    description: 'Paper B builds upon Paper A',
    color: '#10B981', // Green
    icon: '↑',
  },
  {
    type: 'Contradictory',
    description: 'Paper B challenges Paper A',
    color: '#EF4444', // Red
    icon: '⚠',
  },
  {
    type: 'Applied',
    description: 'Paper B applies Paper A\'s methods to new domain',
    color: '#3B82F6', // Blue
    icon: '→',
  },
  {
    type: 'Methodological Improvement',
    description: 'Paper B improves Paper A\'s methodology',
    color: '#10B981', // Green (same as Incremental)
    icon: '⚡',
  },
  {
    type: 'Theoretical Extension',
    description: 'Paper B extends Paper A\'s theory',
    color: '#8B5CF6', // Purple
    icon: '∞',
  },
  {
    type: 'Comparative Analysis',
    description: 'Paper B compares with Paper A',
    color: '#F59E0B', // Amber
    icon: '↔',
  },
  {
    type: 'Background Reference',
    description: 'Paper A cited as background',
    color: '#64748B', // Gray
    icon: '•',
  },
  {
    type: 'Unanalyzed',
    description: 'Relationship not yet analyzed',
    color: '#94A3B8', // Light gray
    icon: '...',
    dashed: true,
  },
]

export default function RelationshipLegend() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed top-6 right-6 z-30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-surface-elevated hover:bg-surface-hover text-foreground px-5 py-2.5 rounded-xl shadow-lg border border-border/50 flex items-center gap-2.5 transition-all duration-200 hover:shadow-xl hover:scale-105 backdrop-blur-sm"
        title="Relationship Type Legend"
      >
        <Info className="w-4 h-4 text-paper-primary" />
        <span className="text-sm font-semibold">Legend</span>
      </button>

      {isOpen && (
        <div className="mt-3 bg-surface-elevated rounded-2xl shadow-2xl border border-border/50 p-5 w-80 backdrop-blur-xl animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 w-8 bg-gradient-to-r from-paper-primary to-paper-secondary rounded-full" />
            <h3 className="font-bold text-sm text-foreground">Relationship Types</h3>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {RELATIONSHIP_TYPES.map((item) => (
              <div key={item.type} className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface/50 transition-colors">
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className="w-4 h-4 rounded-full border-2 transition-all"
                    style={{
                      backgroundColor: item.dashed ? 'transparent' : item.color,
                      borderColor: item.color,
                      borderStyle: item.dashed ? 'dashed' : 'solid',
                      boxShadow: item.dashed ? 'none' : `0 0 8px ${item.color}40`,
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{item.type}</span>
                    <span className="text-xs text-muted">{item.icon}</span>
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-border/50">
            <p className="text-xs text-muted leading-relaxed">
              <span className="font-semibold text-foreground">Tip:</span> Click an edge or select two papers (Ctrl/Cmd + Click) to analyze their relationship.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}



