"use client"

import dynamic from "next/dynamic"

const ReactMarkdown = dynamic(
  () => import("react-markdown").then((mod) => mod.default),
  { ssr: false }
)

interface MarkdownPreviewProps {
  content: string | null
  className?: string
}

export function MarkdownPreview({ content, className = "" }: MarkdownPreviewProps) {
  if (!content) return null

  return (
    <div className={`markdown-content max-w-none ${className}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
