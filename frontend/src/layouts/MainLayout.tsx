import type { ReactNode } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'

interface MainLayoutProps {
  children: ReactNode
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div>
      <Sidebar />

      <Header />

      <main>
        {children}
      </main>

    </div>
  )
}

export default MainLayout