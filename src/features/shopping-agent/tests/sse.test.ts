import { describe, expect, it } from 'vitest'
import { createSseParser } from '../services/sse'

describe('createSseParser', () => {
    it('parses several events in one chunk', () => {
        const parser = createSseParser()
        expect(parser.push('event: token\ndata: {"text":"Hi"}\n\nevent: done\ndata: {"threadId":"t1"}\n\n')).toEqual([
            { event: 'token', data: { text: 'Hi' } },
            { event: 'done', data: { threadId: 't1' } }
        ])
    })

    it('holds a partial event until the rest arrives', () => {
        const parser = createSseParser()
        expect(parser.push('event: tok')).toEqual([])
        expect(parser.push('en\ndata: {"te')).toEqual([])
        expect(parser.push('xt":"Hello"}\n')).toEqual([])
        expect(parser.push('\n')).toEqual([{ event: 'token', data: { text: 'Hello' } }])
    })

    it('skips comments and keepalives, and accepts CRLF line endings', () => {
        const parser = createSseParser()
        expect(parser.push(': open\n\n: keepalive\n\nevent: done\r\ndata: {"threadId":"t"}\r\n\r\n')).toEqual([
            { event: 'done', data: { threadId: 't' } }
        ])
    })
})
