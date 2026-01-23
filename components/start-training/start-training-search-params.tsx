"use client"

import { useSearchParams } from "next/navigation"

export function StartTrainingSearchParams({ children }: { children: (searchParams: ReturnType<typeof useSearchParams>) => React.ReactNode }) {
  const searchParams = useSearchParams()
  return <>{children(searchParams)}</>
}
