import ReactMarkdown, { type Components } from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import { Link } from 'react-router-dom'

// Assistant text is Markdown rendered without raw HTML and sanitized (security.md §11).
// Only links inside the store work: the agent gives relative product links; anything
// else shows as plain text. Images are never rendered.
const isStoreLink = (href: string | undefined): href is string => Boolean(href && href.startsWith('/') && !href.startsWith('//'))

export default function AssistantMessage({ text, onNavigate }: { text: string; onNavigate?: () => void }) {
    const components: Components = {
        a: ({ href, children }) =>
            isStoreLink(href) ? (
                <Link to={href} onClick={onNavigate} className="text-primary font-medium underline underline-offset-2">
                    {children}
                </Link>
            ) : (
                <span>{children}</span>
            ),
        img: () => null
    }
    return (
        <div className="space-y-2 text-sm leading-relaxed [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
            <ReactMarkdown rehypePlugins={[rehypeSanitize]} components={components}>
                {text}
            </ReactMarkdown>
        </div>
    )
}
