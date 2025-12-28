'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Loader2 } from 'lucide-react'
import { Edge } from 'reactflow'
import { PaperNode, RelationshipMetadata } from '@/types'

interface RelationshipChatProps {
  edge: Edge | null
  sourceNode: PaperNode | null
  targetNode: PaperNode | null
  onClose: () => void
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function RelationshipChat({ edge, sourceNode, targetNode, onClose }: RelationshipChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !edge || !sourceNode || !targetNode) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/relationship-rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: input,
          edgeId: edge.id,
          sourcePaper: {
            title: sourceNode.data.title,
            summary: sourceNode.data.summary,
            authors: sourceNode.data.authors,
          },
          targetPaper: {
            title: targetNode.data.title,
            summary: targetNode.data.summary,
            authors: targetNode.data.authors,
          },
          relationship: (edge.data as any)?.relationship as RelationshipMetadata | undefined,
          conversationHistory: messages,
        }),
      })

      const data = await response.json()
      const assistantMessage: Message = { role: 'assistant', content: data.answer }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error getting RAG response:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (!edge || !sourceNode || !targetNode) return null

  return (
    <div className="fixed bottom-6 right-6 z-20 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col max-h-[600px]">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-sm">Relationship Chat</h3>
            <p className="text-xs text-gray-500">
              {sourceNode.data.title.substring(0, 30)}... ↔ {targetNode.data.title.substring(0, 30)}...
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-8">
            <p className="mb-2">Ask questions about the relationship between these papers:</p>
            <ul className="text-left space-y-1 text-xs">
              <li>• "How does the methodology differ?"</li>
              <li>• "What are the key improvements?"</li>
              <li>• "Compare their approaches"</li>
            </ul>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the relationship..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

