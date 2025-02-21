import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import Link from 'next/link';
import { MessageSquare, Users } from 'lucide-react';

interface Session {
  session_id: string;
  tox_score: number;
  total_messages: number;
  flagged_messages: number;
  total_players: number;
  toxic_players: number;
  created: string;
}

interface SessionsResponse {
  sessions: Session[];
  total_sessions: number;
}

export default function Sessions() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.SESSIONS, {
          headers: {
            Authorization: `token ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }

        const data: SessionsResponse = await response.json();
        setSessions(data.sessions);
        setTotalSessions(data.total_sessions);
      } catch (err) {
        setError('Failed to load sessions');
        console.error('Error fetching sessions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [token]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading sessions...</div>
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Game Sessions</h2>
          <p className="text-gray-400">Total Sessions: {totalSessions}</p>
        </div>
      </div>

      <div className="bg-[#1a1b2e] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400 font-medium">Session ID</th>
                <th className="text-left p-4 text-gray-400 font-medium">Toxicity Score</th>
                <th className="text-left p-4 text-gray-400 font-medium">Messages</th>
                <th className="text-left p-4 text-gray-400 font-medium">Players</th>
                <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                <th className="text-left p-4 text-gray-400 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.session_id} className="border-b border-gray-700/50 hover:bg-gray-800/20">
                  <td className="p-4">{session.session_id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-[#0a0b14] rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-red-500 h-full transition-all duration-500"
                          style={{ width: `${session.tox_score}%` }}
                        />
                      </div>
                      <span className="text-red-400">{session.tox_score}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-gray-400" />
                      <span>{session.total_messages}</span>
                      <span className="text-red-400">({session.flagged_messages} flagged)</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span>{session.total_players}</span>
                      <span className="text-red-400">({session.toxic_players} toxic)</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/sessions/${session.session_id}`}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View Details
                    </Link>
                  </td>
                  <td className="p-4">{formatDate(session.created)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 