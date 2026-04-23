function sanitizeInput(text) {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, 500)
}

export async function streamAIResponse(messages, onChunk, signal, { tone, temperature, onMeta } = {}) {
  const sanitized = messages.map(m => ({ ...m, text: sanitizeInput(m.text) }))

  const API_BASE = import.meta.env.VITE_API_URL ?? ''

  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: sanitized, tone, temperature }),
    signal,
  })

  if (!response.ok) {
    throw new Error(`Error del servidor: ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const payload = line.slice(6).trim()
      if (payload === '[DONE]') return
      try {
        const parsed = JSON.parse(payload)
        if (parsed.meta) { onMeta?.(parsed.meta); continue }
        if (parsed.error) throw new Error(parsed.error)
        if (parsed.text) onChunk(parsed.text)
      } catch (e) {
        if (e.message !== 'Unexpected end of JSON input') throw e
      }
    }
  }
}
