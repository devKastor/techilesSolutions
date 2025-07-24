import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/components/ui/toast-context'; // 👈 important !

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TechÎle Solutions - Services informatiques aux Îles-de-la-Madeleine',
  description: 'Support technique, sauvegarde cloud et création de sites web pour les Îles-de-la-Madeleine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider> {/* 👈 enveloppe tes children */}
          {children}
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}
