import './globals.css';
import { Inter, Cinzel, Oswald } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ClientLayout } from '@/components/layout/client-layout';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' });
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald' });

export const metadata = {
  title: 'Parley',
  description: 'An application for parleying with characters.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(
      inter.variable,
      cinzel.variable,
      oswald.variable
    )}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}
