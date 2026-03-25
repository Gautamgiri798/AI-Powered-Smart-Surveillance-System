/**
 * API service for backend communication.
 */
const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('safetysnap_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      // Token is invalid/expired - force logout
      localStorage.removeItem('safetysnap_token');
      localStorage.removeItem('safetysnap_user');
      window.location.reload();
    }
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

// Auth
export const login = (username, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const getMe = () => request('/auth/me');

// Cameras
export const getCameras = () => request('/cameras');
export const addCamera = (camera) =>
  request('/cameras', {
    method: 'POST',
    body: JSON.stringify(camera),
  });
export const updateCamera = (cameraId, updates) =>
  request(`/cameras/${cameraId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
export const startCamera = (cameraId) =>
  request(`/cameras/${cameraId}/start`, { method: 'POST' });
export const stopCamera = (cameraId) =>
  request(`/cameras/${cameraId}/stop`, { method: 'POST' });

// Events
export const getEvents = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return request(`/events${query ? `?${query}` : ''}`);
};
export const getEventStats = () => request('/events/stats');
export const acknowledgeEvent = (eventId) =>
  request(`/events/${eventId}/acknowledge`, { method: 'POST' });
export const clearEvents = () =>
  request('/events/clear', { method: 'DELETE' });

// Streams
export const getActiveStreams = () => request('/streams');
