// Test helpers: a fetch stand-in whose response body streams the given chunks.

export const sse = (event: string, data: unknown) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`

/** A streaming Response. With `hang`, the body stays open until the request is aborted. */
export function streamingResponse(
    chunks: string[],
    { status = 200, hang = false, signal }: { status?: number; hang?: boolean; signal?: AbortSignal | null } = {}
) {
    const encoder = new TextEncoder()
    const body = new ReadableStream<Uint8Array>({
        start(controller) {
            for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
            if (!hang) return controller.close()
            signal?.addEventListener('abort', () => controller.error(new DOMException('The operation was aborted.', 'AbortError')))
        }
    })
    return new Response(body, { status, headers: { 'Content-Type': 'text/event-stream' } })
}

export const jsonResponse = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

export interface RecordedRequest {
    url: string
    body: Record<string, unknown> | undefined
    authorization: string | null
}

/** Queue one responder per expected request; records each request. */
export function fakeFetch(...responders: ((init: RequestInit | undefined) => Response | Promise<Response>)[]) {
    const requests: RecordedRequest[] = []
    const fn = async (input: RequestInfo | URL, init?: RequestInit) => {
        const headers = new Headers(init?.headers)
        requests.push({
            url: String(input),
            body: typeof init?.body === 'string' ? (JSON.parse(init.body) as Record<string, unknown>) : undefined,
            authorization: headers.get('Authorization')
        })
        if (init?.signal?.aborted) throw new DOMException('The operation was aborted.', 'AbortError')
        const next = responders.shift()
        if (!next) throw new Error(`Unexpected request to ${String(input)}`)
        return next(init)
    }
    return { fn, requests }
}
