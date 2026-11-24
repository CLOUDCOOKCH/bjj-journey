import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Providers } from '@/components/providers'
import './globals.css'

// Geist 1.7.0 from Vercel, distributed under the SIL Open Font License.
const geist = localFont({ src: './fonts/Geist-Variable.woff2', variable: '--geist-sans', weight: '100 900', display: 'swap' })
const geistMono = localFont({ src: './fonts/GeistMono-Variable.woff2', variable: '--geist-mono', weight: '100 900', display: 'swap', preload: false })

export const metadata: Metadata = {
  title: 'BJJ Journey',
  description: 'Track your BJJ training journey',
  generator: 'BJJ Journey',
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
