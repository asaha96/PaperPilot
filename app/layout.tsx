import type { Metadata } from 'next'
import './globals.css'
import 'reactflow/dist/style.css'

export const metadata: Metadata = {
  title: 'PaperPilot - Spatial Research Tool',
  description: 'An infinite whiteboard for visualizing research papers and their concepts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

