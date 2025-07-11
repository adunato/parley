import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-8">
      <div className="w-full max-w-4xl p-8 space-y-8">
        <h1 className="text-5xl font-extrabold text-center text-gray-900 dark:text-white">
          Welcome to Parley
        </h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-300">
          Your text-based adventure awaits.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/character-config" className="w-full sm:w-auto">
            <button className="w-full px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Create Character
            </button>
          </Link>
          <Link href="/persona-config" className="w-full sm:w-auto">
            <button className="w-full px-8 py-3 text-lg font-semibold text-gray-900 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
              Define Persona
            </button>
          </Link>
          <Link href="/world-info" className="w-full sm:w-auto">
            <button className="w-full px-8 py-3 text-lg font-semibold text-gray-900 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
              World Information
            </button>
          </Link>
          <Link href="/chat" className="w-full sm:w-auto">
            <button className="w-full px-8 py-3 text-lg font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              Start Chat
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}
