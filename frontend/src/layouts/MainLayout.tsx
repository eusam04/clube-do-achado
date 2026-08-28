import type { ReactNode } from 'react'
import Sidebar from '../components/Sidebar'

interface MainLayoutProps {
  children: ReactNode
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div>
      <Sidebar />

      <main>
      {children}

      </main>
    </div>
  )
}

export default MainLayout