import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@eco/core-tokens/tokens.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Eco Shell',
  description: 'Provenance Shell Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}