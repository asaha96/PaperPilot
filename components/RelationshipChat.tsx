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
    <div className="fixed bottom-6 right-6 z-20 w-96 bg-surface-elevated rounded-2xl shadow-2xl border border-border/50 backdrop-blur-xl flex flex-col max-h-[600px] animate-slide-up">
      <div className="p-5 border-b border-border/50 flex items-center justify-between bg-gradient-to-r from-paper-primary/5 to-paper-secondary/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-paper-primary/20 to-paper-secondary/20 rounded-lg border border-paper-primary/30">
            <MessageCircle className="w-5 h-5 text-paper-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground">Relationship Chat</h3>
            <p className="text-xs text-muted mt-0.5">
              {sourceNode.data.title.substring(0, 25)}... ↔ {targetNode.data.title.substring(0, 25)}...
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-muted hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-surface"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div className="text-sm text-muted text-center py-8">
            <p className="mb-3 font-medium text-foreground">Ask questions about the relationship between these papers:</p>
            <ul className="text-left space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <span className="text-paper-primary">•</span>
                <span>"How does the methodology differ?"</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-paper-primary">•</span>
                <span>"What are the key improvements?"</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-paper-primary">•</span>
                <span>"Compare their approaches"</span>
              </li>
            </ul>
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm font-medium ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-paper-primary to-paper-secondary text-white shadow-lg'
                  : 'bg-surface text-foreground border border-border/50'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-surface border border-border/50 rounded-xl px-4 py-2.5 text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-paper-primary" />
              <span className="text-foreground font-medium">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-5 border-t border-border/50 bg-surface/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the relationship..."
            className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-foreground placeholder:text-muted focus:ring-2 focus:ring-paper-primary focus:border-paper-primary transition-all font-medium"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-paper-primary to-paper-secondary hover:from-paper-primary/90 hover:to-paper-secondary/90 disabled:from-muted disabled:to-muted text-white rounded-xl transition-all duration-200 shadow-lg shadow-paper-primary/30 hover:shadow-xl hover:shadow-paper-primary/40 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

