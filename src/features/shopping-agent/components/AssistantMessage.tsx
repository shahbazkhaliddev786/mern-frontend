import ReactMarkdown, { type Components } from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import { Link } from 'react-router-dom'

// Assistant text is Markdown rendered without raw HTML and sanitized (security.md §11).
// Only two kinds of link work: store pages (relative product links) and Stripe Checkout,
// where the customer pays after place_order (spec 010). Anything else shows as plain text.
// Images are never rendered.
// Backend spec 022: a store link is a plain path on this site. Anything a browser could read as
// another host (`//x`, `/\\x`, or its encoded form `/%5Cx`) is shown as text.
const isStoreLink = (href: string | undefined): href is string => {
    if (!href || !href.startsWith('/') || href.startsWith('//') || /\\|%5c/i.test(href)) return false
    try {
        return new URL(href, window.location.origin).origin === window.location.origin
    } catch {
        return false
    }
}
const isStripeCheckout = (href: string | undefined): href is string => Boolean(href && href.startsWith('https://checkout.stripe.com/'))

export default function AssistantMessage({ text, onNavigate }: { text: string; onNavigate?: () => void }) {
    const components: Components = {
        a: ({ href, children }) =>
            isStoreLink(href) ? (
                <Link to={href} onClick={onNavigate} className="text-primary font-medium underline underline-offset-2">
                    {children}
                </Link>
            ) : isStripeCheckout(href) ? (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary font-medium underline underline-offset-2">
                    {children}
                </a>
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
