"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface PageHeaderProps {
    title: string
    subtitle?: string
    actions?: React.ReactNode
    backButton?: boolean
    className?: string
    children?: React.ReactNode // For any extra content inside the header container if really needed, but `actions` is preferred
}

export function PageHeader({
    title,
    subtitle,
    actions,
    backButton = false,
    className,
    children
}: PageHeaderProps) {
    const router = useRouter()

    return (
        <header className={cn(
            "sticky top-0 z-40 flex h-20 items-center justify-between px-4 lg:px-8 bg-background/80 backdrop-blur-md border-b border-border/50",
            className
        )}>
            <div className="flex items-center gap-4">
                {backButton && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.back()}
                        className="border-border hover:bg-card shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Go back</span>
                    </Button>
                )}

                <div className="min-w-0">
                    <h1 className="text-xl lg:text-2xl font-bold text-foreground font-heading truncate">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="text-xs lg:text-sm text-muted-foreground font-medium truncate">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
                {actions}
                {children}
            </div>
        </header>
    )
}
