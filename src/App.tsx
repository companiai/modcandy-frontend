import React, { useState } from 'react';
import { Home, AlertCircle, Settings as SettingsIcon, LogOut, MessageSquare } from 'lucide-react';
import Login from './components/Login';
import Register from './components/Register';
import Incidents from './components/flagged';
import Log from './components/Activity';
import Settings from './components/Settings';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('incidents');
  const [showRegister, setShowRegister] = useState(false);

  const handleLogout = () => {
    logout();
    setActiveTab('incidents');
  };

  if (!isAuthenticated) {
    return showRegister ? (
      <Register onLogin={() => setShowRegister(false)} onSuccess={() => {}} />
    ) : (
      <Login onRegister={() => setShowRegister(true)} onSuccess={() => {}} />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Dashboard Overview</h2>
            <p className="text-gray-400">Welcome to the Modcandy dashboard.</p>
          </div>
        );
      case 'incidents':
        return <Incidents />;
      case 'log':
        return <Log />;
      case 'settings':
        return token ? (
          <Settings token={token} />
        ) : (
          <div className="p-6">
            <p className="text-gray-400">Please log in to access settings.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] text-gray-200 flex">
      {/* Navigation Sidebar */}
      <nav className="w-64 bg-[#1a1b2e] p-6 space-y-4">
        <div className="text-xl font-bold mb-8">Modcandy</div>
        <button
          onClick={() => setActiveTab('home')}
          className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
            activeTab === 'home' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-800/50'
          }`}
        >
          <Home size={20} />
          Home
        </button>
        <button
          onClick={() => setActiveTab('incidents')}
          className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
            activeTab === 'incidents' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-800/50'
          }`}
        >
          <AlertCircle size={20} />
          Incidents
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
            activeTab === 'log' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-800/50'
          }`}
        >
          <MessageSquare size={20} />
          Log
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
            activeTab === 'settings' ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-800/50'
          }`}
        >
          <SettingsIcon size={20} />
          Settings
        </button>
        <div className="pt-4 mt-auto border-t border-gray-700">
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
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;