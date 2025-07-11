import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={inter.className}>
        <nav className="bg-gray-800 p-4">
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
              <Link href="/persona-config" className="text-white hover:text-gray-300">
                Personas
              </Link>
            </li>
            <li>
              <Link href="/world-info" className="text-white hover:text-gray-300">
                World Info
              </Link>
            </li>
          </ul>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}