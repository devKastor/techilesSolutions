'use client'

import { toast as baseToast } from 'sonner'

// 1) Les options pour success/error
type ToastOptions = Parameters<typeof baseToast.success>[1]

// 2) Les options pour `baseToast(...)` (la fonction générique)
type ShowOptions = Parameters<typeof baseToast>[0]

type ToastWithHelpers = {
  success: (message: string, options?: ToastOptions) => void
  error:   (message: string, options?: ToastOptions) => void
  info:    (message: string, options?: ToastOptions) => void
  show:    (options: ShowOptions) => void
}

export const toast: ToastWithHelpers = {
  success: (message, options) =>
    baseToast.success(message, options),

  error: (message, options) =>
    baseToast.error(message, options),

  info: (message, options) =>
    baseToast(message, { ...options, duration: 3000 }),

  // Ici on utilise ShowOptions, pas ToastOptions
  show: (options) =>
    baseToast(options),
}
