import * as React from 'react'
import { cn } from '@/lib/utils'

const skeletonVariants = {
  default: 'h-4 w-full',
  card: 'h-24 w-full rounded-xl',
  avatar: 'h-10 w-10 rounded-full',
  button: 'h-10 w-full rounded-lg',
  text: 'h-4 w-3/4',
  title: 'h-8 w-1/2',
  circle: 'rounded-full',
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof skeletonVariants
}

function Skeleton({ className, variant = 'default', ...props }: SkeletonProps) {
  const baseClass = skeletonVariants[variant]
  
  return (
    <div
      className={cn(
        'animate-shimmer bg-muted',
        'relative overflow-hidden',
        'before:absolute before:inset-0',
        'before:-translate-x-full',
        'before:animate-[shimmer_1.5s_infinite]',
        'before:bg-gradient-to-r',
        'before:from-transparent',
        'before:via-muted-foreground/10',
        'before:to-transparent',
        baseClass,
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
