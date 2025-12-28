'use client'

import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'

interface PaperInputProps {
  onAddPaper: (paperData: {
    title: string
    summary: string
    authors?: string[]
    year?: number
    paperId?: string
  }) => void
}

export default function PaperInput({ onAddPaper }: PaperInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!title.trim() || !summary.trim()) {
      alert('Please fill in both title and summary')
      return
    }

    setIsLoading(true)
    console.log('Adding paper:', { title: title.trim(), summary: summary.trim().substring(0, 50) + '...' })
    try {
      // Search for paper on Semantic Scholar (optional - will work even if it fails)
      let paperData: any = {}
      try {
        const searchResponse = await fetch('/api/search-paper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: title }),
        })

        if (searchResponse.ok) {
          paperData = await searchResponse.json()
        }
      } catch (searchError) {
        console.log('Semantic Scholar search failed, continuing without metadata:', searchError)
      }

      // Add paper even if search failed
      console.log('Calling onAddPaper with:', { title: title.trim(), hasAuthors: !!paperData.authors })
      onAddPaper({
        title: title.trim(),
        summary: summary.trim(),
        authors: paperData.authors || [],
        year: paperData.year,
        paperId: paperData.paperId,
      })

      console.log('Paper added successfully')
      setTitle('')
      setSummary('')
      setIsOpen(false)
    } catch (error) {
      console.error('Error adding paper:', error)
      alert('Failed to add paper. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 left-1/2 transform -translate-x-1/2 z-10 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
      >
        <FileText className="w-5 h-5" />
        Add Paper
      </button>
    )
  }

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl border border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Paper Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter paper title..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
            Summary
          </label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Enter paper summary or paste abstract..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            required
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add to Canvas'
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false)
              setTitle('')
              setSummary('')
            }}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

