'use client';

import { useAuth } from '@/context/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { ArrowLeft, MessageSquare, Users, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchData } from '@/lib/utils';

interface ToxicMessage {
  message: string;
  assigned_tox_score: number;
  player__playerName: string;
  created: string;
}

interface ToxicPlayer {
  playerName: string;
  player_tox_score: number;
  session_tox_score: number;
  toxic_messages_count: number;
}

interface SessionMessage {
  message: string;
  player_name: string;
  created: string;
  flagged: boolean;
}

interface SessionDetailsData {
  session_id: string;
  tox_score: number;
  total_messages: number;
  flagged_messages: number;
  total_players: number;
  toxic_players: number;
  created: string;
  updated: string;
  toxic_messages: ToxicMessage[];
  top_toxic_players: ToxicPlayer[];
  messages: SessionMessage[];
}

export default function SessionDetailsPage({ params }: { params: { id: string } }) {
  const { token } = useAuth();
  const [sessionData, setSessionData] = useState<SessionDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [sessionMessages, setSessionMessages] = useState<SessionMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_ENDPOINTS.SESSIONS}/${params.id}`, {
          headers: {
            Authorization: `token ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch session details');
        }

        const data = await response.json();
        setSessionData(data);
      } catch (err) {
        setError('Failed to load session details');
        console.error('Error fetching session details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchSessionDetails();
    }
  }, [token, params.id]);

  const fetchSessionMessages = async () => {
    if (!token) return;
    setIsLoadingMessages(true);
    try {
      const messages = await fetchData(`${API_ENDPOINTS.SESSION_MESSAGES(params.id)}`, token);
      setSessionMessages(messages);
    } catch (error) {
      console.error('Error fetching session messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleViewAllMessages = () => {
    setShowAllMessages(true);
    fetchSessionMessages();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse text-gray-400">Loading session details...</div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error || 'Failed to load session details'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/sessions"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Sessions
        </Link>
      </div>

      <div className="space-y-6">
        {/* Session Overview */}
        <div className="bg-[#1a1b2e] rounded-lg p-6">
          <h1 className="text-2xl font-semibold mb-4">Session {sessionData.session_id}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#0a0b14] p-4 rounded-lg">
              <h3 className="text-gray-400 mb-1">Toxicity Score</h3>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-red-500 h-full transition-all duration-500"
                    style={{ width: `${sessionData.tox_score}%` }}
                  />
                </div>
                <span className="text-3xl font-medium text-red-400">{sessionData.tox_score}</span>
              </div>
            </div>

            <div className="bg-[#0a0b14] p-4 rounded-lg">
              <h3 className="text-gray-400 mb-1">Flagged Messages</h3>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <span className="text-3xl font-medium">{sessionData.total_messages}</span>
                <span className="text-sm text-red-400">({sessionData.flagged_messages} flagged)</span>
              </div>
            </div>

            <div className="bg-[#0a0b14] p-4 rounded-lg">
              <h3 className="text-gray-400 mb-1">Players</h3>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-3xl font-medium">{sessionData.total_players}</span>
                <span className="text-sm text-red-400">({sessionData.toxic_players} toxic)</span>
              </div>
            </div>

            <div className="bg-[#0a0b14] p-4 rounded-lg">
              <h3 className="text-gray-400 mb-1">Session Time</h3>
              <p className="text-lg">
                {new Date(sessionData.created).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Toxic Players */}
        <div className="bg-[#1a1b2e] rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Toxic Players</h2>
          <div className="space-y-3">
            {sessionData.top_toxic_players.map((player, index) => (
              <div
                key={index}
                className="bg-[#0a0b14] p-4 rounded-lg flex items-center justify-between"
              >
                <div>
                  <Link
                    href={`/players/${player.playerName}`}
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    {player.playerName}
                  </Link>
                  <div className="text-sm text-gray-400">
                    {player.toxic_messages_count} toxic messages
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-red-400 font-medium">
                    Score: {player.session_tox_score.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-400">
                    Overall: {player.player_tox_score.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toxic Messages */}
        <div className="bg-[#1a1b2e] rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Messages</h2>
            <button
              onClick={handleViewAllMessages}
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
            >
              View All Messages
            </button>
          </div>
          <div className="space-y-3">
            {sessionData.toxic_messages.map((message, index) => (
              <div
                key={index}
                className="bg-[#0a0b14] p-4 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Link
                    href={`/players/${message.player__playerName}`}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {message.player__playerName}
                  </Link>
                  <span className="text-gray-400 text-sm">
                    {new Date(message.created).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-200">{message.message}</p>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-400">Toxicity Score:</div>
                  <div className="w-16 bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-red-500 h-full transition-all duration-500"
                      style={{ width: `${message.assigned_tox_score}%` }}
                    />
                  </div>
                  <span className="text-sm text-red-400">{message.assigned_tox_score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Messages Popup */}
      {showAllMessages && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAllMessages(false);
            }
          }}
        >
          <div className="bg-[#1a1b2e] rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium">Session Messages</h3>
              <button 
                onClick={() => setShowAllMessages(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {isLoadingMessages ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
                </div>
              ) : sessionMessages.length ? (
                <div className="space-y-4">
                  {sessionMessages.map((msg, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg ${
                        msg.flagged ? 'bg-red-500/10' : 'bg-[#0a0b14]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <Link
                          href={`/players/${msg.player_name}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {msg.player_name}
                        </Link>
                        <span className="text-sm text-gray-400">
                          {new Date(msg.created).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-200">{msg.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400">No messages found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 