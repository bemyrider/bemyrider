import type { Metadata } from 'next'
import { Inter, Manrope } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' })

export const metadata: Metadata = {
  title: 'bemyrider - Connetti Rider e Esercenti',
  description: 'Piattaforma che mette in contatto esercenti locali con rider autonomi per prenotazioni di consegne a tariffa oraria.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <head>
        <link rel="icon" type="image/svg+xml" href="/bemyrider_logo.svg" />
      </head>
      <body className={`${inter.className} ${manrope.variable}`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
} 