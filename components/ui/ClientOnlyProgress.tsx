'use client'

import dynamic from 'next/dynamic'

// On charge dynamiquement ton composant local pour désactiver le SSR
export const Progress = dynamic(
  () => import('@/components/ui/progress').then((mod) => mod.Progress),
  { ssr: false }
)
