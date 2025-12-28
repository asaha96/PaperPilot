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
        className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-lg border border-gray-200 flex items-center gap-2 transition-colors"
        title="Relationship Type Legend"
      >
        <Info className="w-4 h-4" />
        <span className="text-sm font-medium">Legend</span>
      </button>

      {isOpen && (
        <div className="mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
          <h3 className="font-semibold text-sm mb-3 text-gray-900">Relationship Types</h3>
          <div className="space-y-2">
            {RELATIONSHIP_TYPES.map((item) => (
              <div key={item.type} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className="w-4 h-4 rounded-full border-2"
                    style={{
                      backgroundColor: item.dashed ? 'transparent' : item.color,
                      borderColor: item.color,
                      borderStyle: item.dashed ? 'dashed' : 'solid',
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-900">{item.type}</span>
                    <span className="text-xs text-gray-500">{item.icon}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              <strong>Tip:</strong> Click an edge or select two papers (Ctrl/Cmd + Click) to analyze their relationship.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

