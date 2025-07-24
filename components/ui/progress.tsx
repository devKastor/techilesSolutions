'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value?: number  // 0–100
  className?: string
}

export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  className,
}) => {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div
      className={cn(
        'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
        className
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
    >
      <div
        className="h-full bg-primary transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
Progress.displayName = 'Progress'
