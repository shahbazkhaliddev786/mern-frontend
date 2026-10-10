// Incremental parser for a text/event-stream body. Feed it text as it arrives; it returns
// every complete event so far and keeps the rest for the next chunk.

export interface SseEvent {
    event: string
    data: unknown
}

export function createSseParser() {
    let buffer = ''

    return {
        push(chunk: string): SseEvent[] {
            buffer += chunk.replace(/\r\n/g, '\n')
            const events: SseEvent[] = []
            let boundary = buffer.indexOf('\n\n')
            while (boundary !== -1) {
                const block = buffer.slice(0, boundary)
                buffer = buffer.slice(boundary + 2)
                const parsed = parseBlock(block)
                if (parsed) events.push(parsed)
                boundary = buffer.indexOf('\n\n')
            }
            return events
        }
    }
}

function parseBlock(block: string): SseEvent | null {
    let event = 'message'
    const dataLines: string[] = []
    for (const line of block.split('\n')) {
        if (!line || line.startsWith(':')) continue // blank lines and comments (": keepalive")
        const colon = line.indexOf(':')
        const field = colon === -1 ? line : line.slice(0, colon)
        const value = colon === -1 ? '' : line.slice(colon + 1).replace(/^ /, '')
        if (field === 'event') event = value
        else if (field === 'data') dataLines.push(value)
    }
    if (dataLines.length === 0) return null
    const raw = dataLines.join('\n')
    try {
        return { event, data: JSON.parse(raw) as unknown }
    } catch {
        return { event, data: raw }
    }
}
