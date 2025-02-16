'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, Suspense } from 'react';
import { Home, AlertCircle, Settings as SettingsIcon, LogOut, MessageSquare, Users } from 'lucide-react';
import Login from '@/components/Login';
import Register from '@/components/Register';
import Incidents from '@/components/Incidents';
import Log from '@/components/Log';
import Settings from '@/components/Settings';
import PlayerStats from '@/components/PlayerStats';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  );
}

export default function Page() {
  const { isAuthenticated, token, logout } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return showRegister ? (
      <Register onLogin={() => setShowRegister(false)} onSuccess={() => {}} />
    ) : (
      <Login onRegister={() => setShowRegister(true)} onSuccess={() => {}} />
    );
  }

  const renderContent = () => {
    switch (pathname) {
      case '/':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>
            <p className="text-gray-400">Welcome to the Modcandy dashboard.</p>
          </div>
        );
      case '/incidents':
        return <Incidents />;
      case '/log':
        return <Log />;
      case '/settings':
        return <Settings token={token} />;
      case '/players':
        return <PlayerStats />;
      default:
        return null;
    }
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="min-h-screen bg-[#0a0b14] text-gray-200 flex">
        {/* Navigation Sidebar - Fixed width and always visible */}
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
            <SettingsIcon size={20} />
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

        {/* Main Content - Add margin to account for fixed sidebar */}
        <main className="flex-1 ml-64 min-h-screen">
          <div className="max-w-7xl mx-auto p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </Suspense>
  );
}