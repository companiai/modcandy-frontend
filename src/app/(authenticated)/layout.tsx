'use client';

import { useAuth } from '@/context/AuthContext';
import { Home, AlertCircle, MessageSquare, Settings, Users, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useState, useEffect } from 'react';
import LoadingFallback from '@/components/LoadingFallback';     

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [isNavExpanded, setIsNavExpanded] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsNavExpanded(false);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleLogout = () => {
    logout();
  };

  // Close mobile nav when route changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/players', icon: Users, label: 'Player Stats' },
    { href: '/incidents', icon: AlertCircle, label: 'Incidents' },
    { href: '/log', icon: MessageSquare, label: 'Log' },
    { href: '/settings', icon: Settings, label: 'Settings' },
    
  ];

  return (
    <Suspense fallback={<LoadingFallback />}>
      <div className="min-h-screen bg-[#0a0b14] text-gray-200 flex">
        {/* Mobile Nav Toggle Button - Hamburger only, hidden when nav is open */}
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className={`md:hidden fixed top-4 left-4 z-50 p-2 bg-[#1a1b2e] rounded-lg transition-opacity duration-300
            ${isMobileNavOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <Menu size={28} />
        </button>

        {/* Navigation Sidebar */}
        <nav className={`
          ${isMobile ? (isMobileNavOpen ? 'translate-x-0' : '-translate-x-full') : ''}
          ${!isMobile && !isNavExpanded ? 'w-24' : 'w-64'}
          fixed left-0 h-full bg-[#1a1b2e] p-6 border-r border-gray-800
          transition-all duration-300 ease-in-out z-40
          md:translate-x-0
        `}>
          {/* Close button for mobile nav */}
          {isMobile && (
            <button
              onClick={() => setIsMobileNavOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-800/50 rounded-lg"
            >
              <X size={28} />
            </button>
          )}

          <div className="flex items-center mb-8 mt-4">
            <div className={`${!isNavExpanded && !isMobile ? 'hidden' : 'text-xl font-bold'}`}>
              Modcandy
            </div>
            {!isMobile && (
              <button
                onClick={() => setIsNavExpanded(!isNavExpanded)}
                className="p-2 hover:bg-gray-800/50 rounded-lg ml-auto"
              >
                <Menu size={20} />
              </button>
            )}
          </div>

          <div className="space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  pathname === item.href ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-800/50'
                }`}
              >
                <item.icon size={24} />
                <span className={!isNavExpanded && !isMobile ? 'hidden' : ''}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>

          <div className="pt-4 mt-auto border-t border-gray-700/50">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <LogOut size={20} />
              <span className={!isNavExpanded && !isMobile ? 'hidden' : ''}>
                Logout
              </span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className={`
          flex-1 transition-all duration-300 ease-in-out
          ${!isMobile && !isNavExpanded ? 'ml-24' : 'ml-0 md:ml-64'}
          ${isMobileNavOpen ? 'blur-sm md:blur-none' : ''}
          pt-16 md:pt-0
        `}>
          {children}
        </main>

        {/* Mobile Nav Overlay */}
        {isMobileNavOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsMobileNavOpen(false)}
          />
        )}
      </div>
    </Suspense>
  );
} 