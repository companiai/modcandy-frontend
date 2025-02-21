'use client';

import { useAuth } from '@/context/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { MessageSquare, Users, Clock, AlertCircle } from 'lucide-react';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface SystemStats {
  total_messages: number;
  total_flagged_messages: number;
  total_sessions: number;
  toxic_sessions: number;
  total_players: number;
  toxic_players: number;
  flagged_message_percentage: number;
  toxic_session_percentage: number;
  toxic_player_percentage: number;
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.SYSTEM_STATS, {
          headers: {
            Authorization: `token ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching system stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-red-400">Failed to load dashboard data</div>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#9ca3af',
        },
      },
    },
  };

  const messageData: ChartData<'doughnut'> = {
    labels: ['Safe Messages', 'Flagged Messages'],
    datasets: [{
      data: [stats.total_messages - stats.total_flagged_messages, stats.total_flagged_messages],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
    }],
  };

  const sessionData: ChartData<'doughnut'> = {
    labels: ['Safe Sessions', 'Toxic Sessions'],
    datasets: [{
      data: [stats.total_sessions - stats.toxic_sessions, stats.toxic_sessions],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
    }],
  };

  const playerData: ChartData<'doughnut'> = {
    labels: ['Safe Players', 'Toxic Players'],
    datasets: [{
      data: [stats.total_players - stats.toxic_players, stats.toxic_players],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
    }],
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Dashboard Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1a1b2e] p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <h3 className="text-gray-400">Messages</h3>
          </div>
          <div className="text-2xl font-semibold mb-2">{stats.total_messages}</div>
          <div className="text-sm text-red-400">{stats.flagged_message_percentage.toFixed(1)}% Flagged</div>
        </div>

        <div className="bg-[#1a1b2e] p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-blue-400" />
            <h3 className="text-gray-400">Sessions</h3>
          </div>
          <div className="text-2xl font-semibold mb-2">{stats.total_sessions}</div>
          <div className="text-sm text-red-400">{stats.toxic_session_percentage.toFixed(1)}% Toxic</div>
        </div>

        <div className="bg-[#1a1b2e] p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="text-gray-400">Players</h3>
          </div>
          <div className="text-2xl font-semibold mb-2">{stats.total_players}</div>
          <div className="text-sm text-red-400">{stats.toxic_player_percentage.toFixed(1)}% Toxic</div>
        </div>

        <div className="bg-[#1a1b2e] p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h3 className="text-gray-400"> Flagged </h3>
          </div>
          <div className="text-2xl font-semibold mb-2">{stats.total_flagged_messages}</div>
          <div className="text-sm text-gray-400">Across all sessions</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1a1b2e] p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Message Analysis</h3>
          <div className="h-64">
            <Doughnut data={messageData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-[#1a1b2e] p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Session Analysis</h3>
          <div className="h-64">
            <Doughnut data={sessionData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-[#1a1b2e] p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Player Analysis</h3>
          <div className="h-64">
            <Doughnut data={playerData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
} 