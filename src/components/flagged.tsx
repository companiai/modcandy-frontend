import React, { useState, useEffect } from 'react';
import {
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_ENDPOINTS } from '@/config/api';

interface Incident {
  id: number;
  playerName: string;
  sessionId: string;
  tox_type: string;
  severity: string;
  created: string;
  message: string;
}

interface SessionMessage {
  message: string;
  player_name: string;
  session_id: number;
  assigned_tox_score: number;
  flagged: boolean;
  created: string;
}

interface IncidentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Incident[];
}

interface FilterState {
  sessionId: string;
  type: string;
  severity: string;
  playerName: string;
}

const SEVERITY_OPTIONS = ['HIGH', 'LOW'];
const TYPE_OPTIONS = [
  'INSULT',
  'PROFANITY',
  'IDENTITY_ATTACK',
  'THREAT',
  'SEXUALLY_EXPLICIT',
];

function FlaggedLog() {
  const { token } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalIncidents, setTotalIncidents] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sessionMessages, setSessionMessages] = useState<SessionMessage[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const [tempStartDate, setTempStartDate] = useState<string>('');
  const [tempEndDate, setTempEndDate] = useState<string>('');

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [tempFilters, setTempFilters] = useState<FilterState>({
    sessionId: '',
    type: '',
    severity: '',
    playerName: '',
  });

  const [filters, setFilters] = useState<FilterState>({
    sessionId: '',
    type: '',
    severity: '',
    playerName: '',
  });

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

  const buildUrl = (baseUrl: string) => {
    const url = new URL(baseUrl);

    if (startDate) {
      url.searchParams.set('start_date', startDate);
    }
    if (endDate) {
      url.searchParams.set('end_date', endDate);
    }

    if (filters.sessionId) {
      url.searchParams.set('sessionId', filters.sessionId);
    }
    if (filters.type) {
      url.searchParams.set('type', filters.type);
    }
    if (filters.severity) {
      url.searchParams.set('severity', filters.severity);
    }
    if (filters.playerName) {
      url.searchParams.set('playerName', filters.playerName);
    }

    return url.toString();
  };

  const fetchIncidents = async (page: number = 1) => {
    try {
      setIsLoading(true);
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const url = buildUrl(`${API_ENDPOINTS.INCIDENTS}?page=${page}`);
      const response = await fetch(url, {
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch incidents');
      }
      
      const data: IncidentsResponse = await response.json();
      setIncidents(data.results);
      setTotalIncidents(data.count);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [token, startDate, endDate, filters]);

  const handlePageChange = (url: string | null) => {
    if (url) {
      fetchIncidents(currentPage);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const time = date
      .toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .replace(' ', '');

    return (
      <div className="flex flex-col">
        <span>{`${day}, ${month} ${year}`}</span>
        <span className="text-gray-400">{time}</span>
      </div>
    );
  };

  const formatDisplayDateRange = () => {
    if (!startDate && !endDate) return 'All time';

    const start = startDate
      ? new Date(startDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: '2-digit',
        })
      : 'Start';

    const end = endDate
      ? new Date(endDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: '2-digit',
        })
      : 'End';

    return `${start} - ${end}`;
  };

  const handleTempFilterChange = (key: keyof FilterState, value: string) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
  };

  const applyDateRange = () => {
    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setShowDatePicker(false);
  };

  const resetFilters = () => {
    setTempFilters({
      sessionId: '',
      type: '',
      severity: '',
      playerName: '',
    });
    setFilters({
      sessionId: '',
      type: '',
      severity: '',
      playerName: '',
    });
    setShowFilters(false);
  };

  const resetDateRange = () => {
    setTempStartDate('');
    setTempEndDate('');
    setStartDate('');
    setEndDate('');
    setShowDatePicker(false);
  };

  const removeFilter = (key: keyof FilterState) => {
    const newFilters = { ...filters, [key]: '' };
    setFilters(newFilters);
    setTempFilters(newFilters);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  const handleDatePickerClick = () => {
    if (!showDatePicker) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
    }
    setShowDatePicker(!showDatePicker);
    setShowFilters(false);
  };

  const handleFiltersClick = () => {
    if (!showFilters) {
      setTempFilters(filters);
    }
    setShowFilters(!showFilters);
    setShowDatePicker(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const filterPopup = document.getElementById('filter-popup');
      const datePopup = document.getElementById('date-popup');
      const filterButton = document.getElementById('filter-button');
      const dateButton = document.getElementById('date-button');
      const chatPopup = document.getElementById('session-chat');

      if (
        filterPopup &&
        !filterPopup.contains(target) &&
        !filterButton?.contains(target)
      ) {
        setShowFilters(false);
      }
      if (
        datePopup &&
        !datePopup.contains(target) &&
        !dateButton?.contains(target)
      ) {
        setShowDatePicker(false);
      }
      if (
        chatPopup &&
        !chatPopup.contains(target) &&
        !target.closest('tr[data-session-row]')
      ) {
        setSelectedSessionId(null);
        setSessionMessages([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading incidents...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b14] text-gray-200">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Flagged Messages</h2>
            <p className="text-gray-400">
              Total Flagged: {totalIncidents}
            </p>
          </div>
          <button className="bg-[#1a1b2e] px-4 py-2 rounded-lg flex items-center gap-2">
            <Calendar size={20} />
            All time
          </button>
        </div>

        <button className="mb-6 bg-[#1a1b2e] px-4 py-2 rounded-lg flex items-center gap-2">
          <Filter size={20} />
          Filter
        </button>

        <div className="bg-[#1a1b2e] rounded-lg overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left p-4 w-28">Message ID</th>
                  <th className="text-left p-4 w-28">Session ID</th>
                  <th className="text-left p-4 w-32">Type</th>
                  <th className="text-left p-4 w-28">Severity</th>
                  <th className="text-left p-4 w-40">Player</th>
                  <th className="text-left p-4 flex-1 min-w-[300px]">Message</th>
                  <th className="text-left p-4 w-44">Time</th>
                  <th className="text-left p-4 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incidents?.map((incident) => (
                  <tr 
                    key={incident.id} 
                    className="border-b border-gray-800/50 hover:bg-gray-800/20"
                    data-session-row
                  >
                    <td className="p-4 whitespace-nowrap">{incident.id}</td>
                    <td className="p-4 whitespace-nowrap">{incident.sessionId}</td>
                    <td className="p-4 truncate" title={incident.tox_type}>{incident.tox_type}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={getSeverityColor(incident.severity)}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap overflow-hidden text-ellipsis">{incident.playerName}</td>
                    <td className="p-4 min-w-[300px]">
                      <p className="truncate" title={incident.message}>
                        {incident.message}
                      </p>
                    </td>
                    <td className="p-4">{formatDate(incident.created)}</td>
                    <td className="p-4 whitespace-nowrap">
                      <button
                        onClick={() => fetchSessionMessages(incident.sessionId)}
                        className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300"
                      >
                        <MessageSquare size={14} />
                        Logs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

        {/* Add pagination controls at the bottom */}
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => fetchIncidents(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${
              currentPage === 1 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage}
          </span>
          <button
            onClick={() => fetchIncidents(currentPage + 1)}
            disabled={incidents.length < 10} // Assuming page size is 10
            className={`px-4 py-2 rounded ${
              incidents.length < 10
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default FlaggedLog;