'use client'

import { useState, useCallback } from 'react'
import { FileText, Loader2, Upload, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

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
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isExtractingPdf, setIsExtractingPdf] = useState(false)

  const handleFileProcess = useCallback(async (file: File) => {
    // Check file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file')
      return
    }

    setPdfFile(file)
    setIsExtractingPdf(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('Extracting PDF:', file.name, 'Size:', file.size, 'Type:', file.type)
      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        body: formData,
      })

      console.log('API Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to extract PDF')
      }

      const data = await response.json()
      console.log('PDF extracted successfully:', { title: data.title, summaryLength: data.summary?.length })
      
      setTitle(data.title || file.name.replace('.pdf', ''))
      setSummary(data.summary || '')
      setIsOpen(true)
    } catch (error) {
      console.error('Error extracting PDF:', error)
      alert(`Failed to extract PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or enter manually.`)
      setPdfFile(null)
    } finally {
      setIsExtractingPdf(false)
    }
  }, [])

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    console.log('onDrop called:', { accepted: acceptedFiles.length, rejected: rejectedFiles.length })
    
    if (rejectedFiles.length > 0) {
      alert('Please upload a PDF file')
      return
    }

    const file = acceptedFiles[0]
    if (!file) {
      console.log('No file in acceptedFiles')
      return
    }

    await handleFileProcess(file)
  }, [handleFileProcess])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    noClick: false, // Allow dropzone to handle clicks
    noKeyboard: true,
  })

  // Handle file input change (when user clicks and selects file)
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      console.log('File selected via input:', file.name)
      handleFileProcess(file)
      // Reset input so same file can be selected again
      e.target.value = ''
    }
  }, [handleFileProcess])

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
      setPdfFile(null)
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
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-10">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
        >
          <FileText className="w-5 h-5" />
          Add Paper
        </button>
      </div>
    )
  }

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl border border-gray-200">
      {pdfFile && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">{pdfFile.name}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setPdfFile(null)
              setTitle('')
              setSummary('')
            }}
            className="text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div
        {...getRootProps()}
        className={`mb-4 p-4 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-green-500 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">
          {isDragActive
            ? 'Drop PDF here'
            : 'Drag & drop PDF here, or click to select'}
        </p>
      </div>
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
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black"
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

