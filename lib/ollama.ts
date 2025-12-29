/**
 * Ollama API client for local LLM inference
 */

export interface OllamaConfig {
  apiUrl?: string
  model?: string
  temperature?: number
}

const DEFAULT_CONFIG: Required<OllamaConfig> = {
  apiUrl: 'http://localhost:11434',
  model: 'llama3.2:3b',
  temperature: 0.3,
}

export async function checkOllamaConnection(apiUrl: string = DEFAULT_CONFIG.apiUrl): Promise<boolean> {
  try {
    const response = await fetch(`${apiUrl}/api/tags`, {
      method: 'GET',
    })
    return response.ok
  } catch (error) {
    return false
  }
}

export async function listAvailableModels(apiUrl: string = DEFAULT_CONFIG.apiUrl): Promise<string[]> {
  try {
    const response = await fetch(`${apiUrl}/api/tags`)
    if (!response.ok) {
      return []
    }
    const data = await response.json()
    return data.models?.map((model: any) => model.name) || []
  } catch (error) {
    console.error('Error listing Ollama models:', error)
    return []
  }
}

export async function generateWithOllama(
  prompt: string,
  systemPrompt: string = '',
  config: OllamaConfig = {}
): Promise<string> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  
  const response = await fetch(`${finalConfig.apiUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: finalConfig.model,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
      options: {
        temperature: finalConfig.temperature,
      },
      stream: false,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Ollama API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  return data.message?.content || data.response || ''
}



