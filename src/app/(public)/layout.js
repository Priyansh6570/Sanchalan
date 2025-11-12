// src/app/(public)/layout.js
import PublicSidebar from '@/components/PublicSidebar'
import PublicNavbar from '@/components/PublicNavbar'

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <PublicSidebar />
      <div className="flex-1 flex flex-col">
        <PublicNavbar />
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}