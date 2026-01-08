import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function MainMenu() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="w-full max-w-md text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter font-cinzel text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
            PARLEY
          </h1>
          <p className="text-lg text-gray-400 font-oswald tracking-widest uppercase">
            Interactive Fiction Engine
          </p>
        </div>

        <div className="flex flex-col gap-4 w-64 mx-auto">
          {/* Main Menu Buttons */}
          <Button
            className="w-full h-12 text-lg uppercase tracking-widest font-semibold bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 transition-all opacity-50 cursor-not-allowed"
            disabled
          >
            New Game
          </Button>

          <Button
            className="w-full h-12 text-lg uppercase tracking-widest font-semibold bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 transition-all opacity-50 cursor-not-allowed"
            disabled
          >
            Continue
          </Button>

          <Button
            asChild
            className="w-full h-12 text-lg uppercase tracking-widest font-semibold bg-white text-black hover:bg-gray-200 border-0 transition-all"
          >
            <Link href="/character-config">
              Configuration
            </Link>
          </Button>
        </div>

        <div className="pt-12 text-xs text-gray-600 font-mono">
          v0.1.0 • Pre-Alpha Build
        </div>
      </div>
    </div>
  );
}
