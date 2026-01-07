import './globals.css';
import { Inter, Cinzel, Oswald } from 'next/font/google';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased flex flex-col",
        inter.variable,
        cinzel.variable,
        oswald.variable
      )}>
        <nav className="bg-gray-800 p-4 fixed w-full z-10 top-0">
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="text-white hover:text-gray-300">
                Home
              </Link>
            </li>
            <li>
              <Link href="/chat" className="text-white hover:text-gray-300">
                Chat
              </Link>
            </li>
            <li>
              <Link href="/character-config" className="text-white hover:text-gray-300">
                Characters
              </Link>
            </li>
            <li>
              <Link href="/character-group-config" className="text-white hover:text-gray-300">
                Character Groups
              </Link>
            </li>
            <li>
              <Link href="/persona-config" className="text-white hover:text-gray-300">
                Personas
              </Link>
            </li>
            <li>
              <Link href="/world-info" className="text-white hover:text-gray-300">
                World Info
              </Link>
            </li>
            <li>
              <Link href="/locations" className="text-white hover:text-gray-300">
                Locations
              </Link>
            </li>
            <li>
              <Link href="/settings" className="text-white hover:text-gray-300">
                Settings
              </Link>
            </li>
          </ul>
        </nav>
        <main className="flex-grow pt-16">{children}</main>
      </body>
    </html>
  )
}