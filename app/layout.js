import { Syne, Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const syne = Syne({ 
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'E-Learning Hub | Online Learning Platform',
  description: 'Join 50,000+ students learning from world-class instructors. Courses in Development, Design, Business & More.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-[#0A0A0A] text-white">
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#FFFFFF',
              border: '1px solid #2A2A2A',
            },
            success: {
              iconTheme: {
                primary: '#6B21A8',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
