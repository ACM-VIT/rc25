import "@/app/globals.css";
import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>
          <nav className="space-y-4">
            <Link 
              href="/problems" 
              className="block px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Problems
            </Link>
            <Link 
              href="/anticheat" 
              className="block px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Anti-cheat
            </Link>
            <Link 
              href="/extra" 
              className="block px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Extra
            </Link>
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
