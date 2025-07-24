'use client';

import React, { createContext, useState } from 'react';
import { ToastProps } from './toast';

type ToastContextType = {
  toasts: ToastProps[];
  addToast: (toast: ToastProps) => void;
};

export const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (toast: ToastProps) => {
    setToasts((prev) => [...prev, toast]);
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast }}>
      {children}
    </ToastContext.Provider>
  );
};
