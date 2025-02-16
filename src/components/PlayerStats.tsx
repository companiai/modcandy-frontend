import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { Users } from 'lucide-react';
import Link from 'next/link';

interface ToxicPlayer {
  playerId: string;
  playerName: string;
  player_tox_score: number;
  incident_count: number;
}

interface PlayerStatsData {
  total_players: number;
  top_toxic_players: ToxicPlayer[];
}

function PlayerStats() {
  const { token } = useAuth();
  const [stats, setStats] = useState<PlayerStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.PLAYER_STATS, {
          headers: {
            Authorization: `token ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch player statistics');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError('Failed to load player statistics');
        console.error('Error fetching player stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerStats();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading player statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Player Statistics</h1>
          <p className="text-gray-400 mt-1">Total Players: {stats?.total_players}</p>
        </div>
      </div>

      <div className="bg-[#1a1b2e] rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-2 text-lg font-medium">
            <Users className="w-5 h-5 text-blue-400" />
            Top Toxic Players
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-4 text-gray-400 font-medium">Player Name</th>
              <th className="text-left p-4 text-gray-400 font-medium">Player ID</th>
              <th className="text-left p-4 text-gray-400 font-medium">Toxicity Score</th>
              <th className="text-left p-4 text-gray-400 font-medium">Incident Count</th>
            </tr>
          </thead>
          <tbody>
            {stats?.top_toxic_players.map((player) => (
              <tr key={player.playerId} className="border-b border-gray-700/50 hover:bg-gray-800/20">
                <td className="p-4">
                  <Link
                    href={`/players/${player.playerId}`}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {player.playerName}
                  </Link>
                </td>
                <td className="p-4 text-gray-400">{player.playerId}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-[#0a0b14] rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-red-500 h-full transition-all duration-500"
                        style={{ 
                          width: `${(player.player_tox_score / 300) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-red-400">{player.player_tox_score}</span>
                  </div>
                </td>
                <td className="p-4">{player.incident_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PlayerStats; 