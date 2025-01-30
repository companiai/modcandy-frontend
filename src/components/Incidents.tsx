import React, { useState, useEffect } from 'react';
import { Filter, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Incident {
  incident_id: number;
  playerName: string;
  sessionId: string;
  tox_type: string;
  severity: string;
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

const SEVERITY_OPTIONS = ['HIGH', 'MEDIUM', 'LOW'];
const TYPE_OPTIONS = ['TOXICITY', 'HARASSMENT', 'HATE_SPEECH', 'THREAT'];

function Incidents() {
  const { token } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState<string | null>(null);
  const [prevPage, setPrevPage] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Temporary states for date picker
  const [tempStartDate, setTempStartDate] = useState<string>('');
  const [tempEndDate, setTempEndDate] = useState<string>('');
  
  // Applied states for date picker
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Temporary state for filters
  const [tempFilters, setTempFilters] = useState<FilterState>({
    sessionId: '',
    type: '',
    severity: '',
    playerName: ''
  });
  
  // Applied filters state
  const [filters, setFilters] = useState<FilterState>({
    sessionId: '',
    type: '',
    severity: '',
    playerName: ''
  });

  const fetchIncidents = async (url: string = 'https://modcandy-api.compani.ai/api/analyzer/list/incidents') => {
    setIsLoading(true);
    try {
      const urlObj = new URL(url);
      
      // Add date parameters only if they are set
      if (startDate) {
        urlObj.searchParams.set('start_date', startDate);
      }
      if (endDate) {
        urlObj.searchParams.set('end_date', endDate);
      }

      // Add filter parameters
      if (filters.sessionId) {
        urlObj.searchParams.set('sessionId', filters.sessionId);
      }
      if (filters.type) {
        urlObj.searchParams.set('type', filters.type);
      }
      if (filters.severity) {
        urlObj.searchParams.set('severity', filters.severity);
      }
      if (filters.playerName) {
        urlObj.searchParams.set('playerName', filters.playerName);
      }

      const response = await fetch(urlObj.toString(), {
        headers: {
          Authorization: `token ${token}`,
        },
      });
      if (response.ok) {
        const data: IncidentsResponse = await response.json();
        setIncidents(data.results);
        setTotalCount(data.count);
        setNextPage(data.next);
        setPrevPage(data.previous);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
      setIncidents([]);
      setTotalCount(0);
      setNextPage(null);
      setPrevPage(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [token, startDate, endDate, filters]);

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
    const time = date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(' ', ''); // Remove space between time and AM/PM

    return `${day}, ${month} ${year} ${time}`;
  };

  const formatDisplayDateRange = () => {
    if (!startDate && !endDate) return 'All time';
    
    const start = startDate ? new Date(startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    }) : 'Start';
    
    const end = endDate ? new Date(endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    }) : 'End';

    return `${start} - ${end}`;
  };

  const handleTempFilterChange = (key: keyof FilterState, value: string) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
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
      playerName: ''
    });
    setFilters({
      sessionId: '',
      type: '',
      severity: '',
      playerName: ''
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

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // Initialize temp states when opening dropdowns
  const handleOpenDatePicker = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setShowDatePicker(true);
  };

  const handleOpenFilters = () => {
    setTempFilters(filters);
    setShowFilters(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading incidents...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Incidents</h1>
          <p className="text-gray-400 mt-1">Total incidents: {totalCount}</p>
        </div>
        <div className="flex items-center gap-4 relative">
          <button 
            className="flex items-center gap-2 bg-[#1a1b2e] px-4 py-2 rounded-lg"
            onClick={handleOpenDatePicker}
          >
            <Calendar size={18} />
            {formatDisplayDateRange()}
          </button>

          {showDatePicker && (
            <div className="absolute right-0 top-12 bg-[#1a1b2e] p-4 rounded-lg shadow-lg z-10 border border-gray-700">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={tempStartDate}
                    max={tempEndDate || undefined}
                    onChange={(e) => setTempStartDate(e.target.value)}
                    className="bg-[#0a0b14] border border-gray-700 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={tempEndDate}
                    min={tempStartDate || undefined}
                    onChange={(e) => setTempEndDate(e.target.value)}
                    className="bg-[#0a0b14] border border-gray-700 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={resetDateRange}
                    className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                  >
                    Reset
                  </button>
                  <button
                    onClick={applyDateRange}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              hasActiveFilters ? 'bg-blue-500 text-white' : 'bg-[#1a1b2e]'
            }`}
            onClick={handleOpenFilters}
          >
            <Filter size={18} />
            {hasActiveFilters ? 'Filters Applied' : 'Filter'}
          </button>

          {showFilters && (
            <div className="absolute left-0 top-12 bg-[#1a1b2e] p-4 rounded-lg shadow-lg z-10 border border-gray-700 min-w-[300px]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Session ID</label>
                  <input
                    type="text"
                    value={tempFilters.sessionId}
                    onChange={(e) => handleTempFilterChange('sessionId', e.target.value)}
                    placeholder="Enter Session ID"
                    className="bg-[#0a0b14] border border-gray-700 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Type</label>
                  <select
                    value={tempFilters.type}
                    onChange={(e) => handleTempFilterChange('type', e.target.value)}
                    className="bg-[#0a0b14] border border-gray-700 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-blue-500"
                  >
                    <option value="">All Types</option>
                    {TYPE_OPTIONS.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Severity</label>
                  <select
                    value={tempFilters.severity}
                    onChange={(e) => handleTempFilterChange('severity', e.target.value)}
                    className="bg-[#0a0b14] border border-gray-700 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-blue-500"
                  >
                    <option value="">All Severities</option>
                    {SEVERITY_OPTIONS.map(severity => (
                      <option key={severity} value={severity}>{severity}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Player Name</label>
                  <input
                    type="text"
                    value={tempFilters.playerName}
                    onChange={(e) => handleTempFilterChange('playerName', e.target.value)}
                    placeholder="Enter Player Name"
                    className="bg-[#0a0b14] border border-gray-700 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={resetFilters}
                    className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                  >
                    Reset
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 bg-[#1a1b2e] px-3 py-1 rounded-lg text-sm"
                >
                  <span className="text-gray-400">{key}:</span>
                  <span>{value}</span>
                  <button
                    onClick={() => removeFilter(key as keyof FilterState)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-[#1a1b2e] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-4 text-gray-400 font-medium">Incident ID</th>
              <th className="text-left p-4 text-gray-400 font-medium">Session ID</th>
              <th className="text-left p-4 text-gray-400 font-medium">Type</th>
              <th className="text-left p-4 text-gray-400 font-medium">Severity</th>
              <th className="text-left p-4 text-gray-400 font-medium">Player</th>
              <th className="text-left p-4 text-gray-400 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.incident_id} className="border-b border-gray-700/50 hover:bg-gray-800/20">
                <td className="p-4">{incident.incident_id}</td>
                <td className="p-4">{incident.sessionId}</td>
                <td className="p-4">{incident.tox_type}</td>
                <td className={`p-4 ${getSeverityColor(incident.severity)}`}>
                  {incident.severity}
                </td>
                <td className="p-4">{incident.playerName}</td>
                <td className="p-4">{formatDate(incident.created)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={() => prevPage && fetchIncidents(prevPage)}
              disabled={!prevPage}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#0a0b14] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              onClick={() => nextPage && fetchIncidents(nextPage)}
              disabled={!nextPage}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#0a0b14] text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Incidents;