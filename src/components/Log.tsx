import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '@/config/api';

interface Message {
  id: number;
  message: string;
  flagged: boolean;
  created: string;
  player_name: string;
  session_id: number;
}

function Log() {
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.RECENT_MESSAGES, {
          headers: {
            Authorization: `token ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [token]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const time = date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(' ', '');

    return `${day}, ${month} ${year} ${time}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Message Log</h1>
          <p className="text-gray-400">Total messages: {messages.length}</p>
        </div>
      </div>

      <div className="bg-[#1a1b2e] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-4 text-gray-400 font-medium">Message ID</th>
              <th className="text-left p-4 text-gray-400 font-medium">Player</th>
              <th className="text-left p-4 text-gray-400 font-medium">Session ID</th>
              <th className="text-left p-4 text-gray-400 font-medium">Message</th>
              <th className="text-left p-4 text-gray-400 font-medium">Flagged</th>
              <th className="text-left p-4 text-gray-400 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message) => (
              <tr key={message.id} className="border-b border-gray-700/50 hover:bg-gray-800/20">
                <td className="p-4">{message.id}</td>
                <td className="p-4">{message.player_name}</td>
                <td className="p-4">{message.session_id}</td>
                <td className="p-4 max-w-md">
                  <p className="truncate" title={message.message}>
                    {message.message}
                  </p>
                </td>
                <td className="p-4">
                  <span className={message.flagged ? 'text-red-400' : 'text-green-400'}>
                    {message.flagged ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="p-4">{formatDate(message.created)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Log;