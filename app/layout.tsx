import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import Header from '@/components/header'
import './globals.css'

// Load Geist font family for modern typography
const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

// SEO metadata for the application
export const metadata: Metadata = {
  title: 'AlumniConnect - Student-Alumni Mentorship Platform',
  description: 'Connect final-year students with alumni for placement guidance using smart matching based on skills, roles, and target companies.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {/* AuthProvider wraps the entire app for global auth state */}
        <AuthProvider>
          {/* Top navigation header (student/mentor aware) */}
          <div className="sticky top-0 z-40 bg-transparent">
            <Header />
          </div>

          <main className="min-h-[calc(100vh-64px)]">
            {children}
          </main>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
