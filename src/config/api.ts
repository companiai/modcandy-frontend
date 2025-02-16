export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://modcandy-api.compani.ai';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/account/api/auth/login`,
  REGISTER: `${API_BASE_URL}/account/api/auth/register`,
  API_KEY: `${API_BASE_URL}/account/api/key`,
  CREDIT: `${API_BASE_URL}/account/api/credit`,
  INCIDENTS: `${API_BASE_URL}/api/analyzer/list/incidents`,
  RECENT_MESSAGES: `${API_BASE_URL}/api/analyzer/messages/recent`,
  SESSION_MESSAGES: (sessionId: string) => `${API_BASE_URL}/api/analyzer/messages/session/${sessionId}`,
  PLAYER_STATS: `${API_BASE_URL}/api/analyzer/stats/players`,
  PLAYER_DETAILS: (playerId: string) => `${API_BASE_URL}/api/analyzer/stats/players/${playerId}/incidents`,
};