import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export default function NotFound() {
    return (
        <section className="relative flex flex-col items-center justify-center min-h-screen text-center overflow-hidden bg-background px-4">
            <div
                className="pointer-events-none absolute top-1/2 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl"
                aria-hidden="true"
            />
            <div className="relative">
                <p className="font-display text-[7rem] md:text-[10rem] leading-none font-semibold text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/20">
                    404
                </p>
                <h1 className="font-display text-2xl md:text-3xl font-semibold mb-3 -mt-4">Page Not Found</h1>
                <p className="text-muted-foreground max-w-sm mx-auto mb-8">The page you're looking for doesn't exist or may have been moved.</p>
                <Button asChild variant="accent" size="lg" className="px-8">
                    <Link to="/">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </div>
        </section>
    )
}
