// src/app/layout.js
import './globals.css'
import { getServerSession } from 'next-auth'
import SessionProvider from '@/components/SessionProvider'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Veer Bharat CMS',
  description: 'Content Management System for Veer Bharat YouTube Channel',
}

export default async function RootLayout({ children }) {
  const session = await getServerSession()

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <SessionProvider session={session}>
          {session ? (
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex-1 flex flex-col">
                <Navbar />
                <main className="flex-1 p-6">
                  {children}
                </main>
              </div>
            </div>
          ) : (
            <div>{children}</div>
          )}
        </SessionProvider>
      </body>
    </html>
  )
}