'use client';

import { useAuth } from '@/context/AuthContext';
import { Home, AlertCircle, MessageSquare, Settings, Users, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import LoadingFallback from '@/components/LoadingFallback';     

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="min-h-screen bg-[#0a0b14] text-gray-200 flex">
        {/* Navigation Sidebar */}
        <nav className="w-64 bg-[#1a1b2e] min-h-screen fixed left-0 p-6 space-y-4 border-r border-gray-800">
          <div className="text-xl font-bold mb-8">Modcandy</div>
          <Link
            href="/"
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
              pathname === '/' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-800/50'
            }`}
          >
            <Home size={20} />
            Home
          </Link>
          <Link
            href="/incidents"
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
              pathname === '/incidents' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-800/50'
            }`}
          >
            <AlertCircle size={20} />
            Incidents
          </Link>
          <Link
            href="/log"
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
              pathname === '/log' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-800/50'
            }`}
          >
            <MessageSquare size={20} />
            Log
          </Link>
          <Link
            href="/settings"
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
              pathname === '/settings' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-800/50'
            }`}
          >
            <Settings size={20} />
            Settings
          </Link>
          <Link
            href="/players"
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
              pathname === '/players' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-800/50'
            }`}
          >
            <Users size={20} />
            Player Stats
          </Link>
          <div className="pt-4 mt-auto border-t border-gray-700/50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 ml-64">
          {children}
        </main>
      </div>
    </Suspense>
  );
} 