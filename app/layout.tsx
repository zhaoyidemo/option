import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '双币理财看板',
  description: '双币理财收益追踪与分析',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
