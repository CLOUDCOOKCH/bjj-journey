"use client"

import { Loader2 } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"

interface ButtonLoaderProps extends Omit<ButtonProps, "children"> {
  text?: string
  icon?: boolean
}

export function ButtonLoader({ 
  text = "Loading...", 
  icon = true,
  disabled = true,
  className,
  ...props 
}: ButtonLoaderProps) {
  return (
    <Button disabled={disabled} className={className} {...props}>
      {icon && <Loader2 className="h-4 w-4 animate-spin" />}
      {text}
    </Button>
  )
}
