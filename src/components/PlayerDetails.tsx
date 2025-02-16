import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { ArrowLeft, MessageSquare, X } from 'lucide-react';
import Link from 'next/link';

interface IncidentsByType {
  tox_type: string;
  count: number;
}

interface IncidentsBySeverity {
  severity: string;
  count: number;
}

interface Incident {
  incident_id: number;
  playerName: string;
  sessionId: string;
  tox_type: string;
  message: string;
  severity: string;
  created: string;
}

interface SessionMessage {
  player_name: string;
  message: string;
  flagged: boolean;
  created: string;
}

interface PlayerDetailsData {
  player_id: string;
  player_name: string;
  tox_score: number;
  total_incidents: number;
  incidents_by_type: IncidentsByType[];
  incidents_by_severity: IncidentsBySeverity[];
  recent_incidents: Incident[];
  total_messages: number;
  toxic_messages: number;
  total_sessions: number;
  toxic_sessions: number;
}

export default function PlayerDetails({ playerId }: { playerId: string }) {
  const { token } = useAuth();
  const [playerData, setPlayerData] = useState<PlayerDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionMessages, setSessionMessages] = useState<SessionMessage[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.PLAYER_DETAILS(playerId), {
          headers: {
            Authorization: `token ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch player details');
        }

        const data = await response.json();
        setPlayerData(data);
      } catch (err) {
        setError('Failed to load player details');
        console.error('Error fetching player details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerDetails();
  }, [playerId, token]);

  const fetchSessionMessages = async (sessionId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await fetch(
        API_ENDPOINTS.SESSION_MESSAGES(sessionId),
        {
          headers: {
            Authorization: `token ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSessionMessages(data);
        setSelectedSessionId(sessionId);
      }
    } catch (error) {
      console.error('Error fetching session messages:', error);
      setSessionMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading player details...</div>
      </div>
    );
  }

  if (error || !playerData) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error || 'Failed to load player details'}
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/players"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Players
        </Link>
      </div>

      <div className="space-y-6">
        <div className="bg-[#1a1b2e] rounded-lg p-6">
          <h1 className="text-2xl font-semibold mb-4">{playerData.player_name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#0a0b14] p-4 rounded-lg">
              <h3 className="text-gray-400 mb-1">Toxicity Score</h3>
              <p className="text-3xl font-medium text-red-400">{playerData.tox_score}</p>
            </div>
            <div className="bg-[#0a0b14] p-4 rounded-lg">
              <h3 className="text-gray-400 mb-1">Total Incidents</h3>
              <p className="text-3xl font-medium text-red-400">{playerData.total_incidents}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#0a0b14] p-4 rounded-lg">
              <h3 className="text-gray-400 mb-1">Total Messages</h3>
              <p className="text-3xl font-medium">{playerData.total_messages}</p>
            </div>
            <div className="bg-[#0a0b14] p-4 rounded-lg">
              <h3 className="text-gray-400 mb-1">Total Sessions</h3>
              <p className="text-3xl font-medium">{playerData.total_sessions}</p>
            </div>
            <div className="bg-[#0a0b14] p-4 rounded-lg">
              <h3 className="text-gray-400 mb-1">Toxic Sessions</h3>
              <p className="text-3xl font-medium text-red-400">{playerData.toxic_sessions}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium mb-4">Incidents by Type</h2>
              <div className="space-y-2">
                {playerData.incidents_by_type.map((type, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-[#0a0b14] p-3 rounded-lg"
                  >
                    <span>{type.tox_type}</span>
                    <span className="text-gray-400">{type.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-4">Incidents by Severity</h2>
              <div className="space-y-2">
                {playerData.incidents_by_severity.map((severity, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-[#0a0b14] p-3 rounded-lg"
                  >
                    <span>{severity.severity}</span>
                    <span className="text-gray-400">{severity.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1b2e] rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Recent Incidents</h2>
          <div className="space-y-3">
            {playerData.recent_incidents.map((incident) => (
              <div
                key={incident.incident_id}
                className="bg-[#0a0b14] p-4 rounded-lg space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      incident.severity === 'HIGH'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {incident.severity}
                  </span>
                  <span
                    className="px-2 py-1 rounded text-sm bg-blue-500/20 text-blue-400"
                  >
                    {incident.tox_type}
                  </span>
                </div>
                <p className="text-gray-200">{incident.message}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-400">
                    {formatDate(incident.created)}
                  </span>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-500">
                      Session ID: {incident.sessionId}
                    </span>
                    <button
                      onClick={() => fetchSessionMessages(incident.sessionId)}
                      className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300"
                    >
                      <MessageSquare size={14} />
                      View Logs
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Popup */}
      {selectedSessionId && (
        <div 
          id="session-chat"
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000]"
        >
          <div className="bg-[#1a1b2e] rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium">Session ID: {selectedSessionId}</h3>
              <button 
                onClick={() => {
                  setSelectedSessionId(null);
                  setSessionMessages([]);
                }}
                className="text-gray-400 hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {isLoadingMessages ? (
                <div className="text-center text-gray-400">Loading messages...</div>
              ) : sessionMessages.length > 0 ? (
                <div className="space-y-4">
                  {sessionMessages.map((msg, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg ${
                        msg.flagged 
                          ? 'bg-red-500/10 border border-red-500/50' 
                          : 'bg-[#0a0b14] border border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <span className="font-medium">{msg.player_name}</span>
                        <span className="text-sm text-gray-400 whitespace-nowrap">
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