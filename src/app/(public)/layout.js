// src/app/(public)/layout.js
import PublicSidebar from '@/components/PublicSidebar'
import PublicNavbar from '@/components/PublicNavbar'

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen  md:ml-64">
      <PublicSidebar />
      <div className="flex-1 flex flex-col w-[70%]">
        <PublicNavbar />
        <main className="flex-1 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}