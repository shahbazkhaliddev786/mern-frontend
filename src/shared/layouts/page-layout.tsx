import Header from '../components/header'
import Footer from '../components/footer'
import { Outlet } from 'react-router-dom'
import { ChatLauncher } from '@/features/shopping-agent'

export default function PageLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <ChatLauncher />
        </div>
    )
}
