/**
 * API service for backend communication.
 */
const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('sentinel_token');
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
  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    // Response body was empty or not JSON
    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      const hadToken = localStorage.getItem('sentinel_token');
      localStorage.removeItem('sentinel_token');
      localStorage.removeItem('sentinel_user');
      // Only reload if there was actually a session to expire
      // Otherwise we'd loop forever on the login page
      if (hadToken) {
        window.location.reload();
        return;
      }
    }
    throw new Error(data?.error || 'Request failed');
  }

  return data;
}

// Auth
export const login = (username, password) =>
  request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const signup = (userData) =>
  request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

export const resetPassword = (data) =>
  request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
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

export const deleteCamera = (cameraId) =>
  request(`/cameras/${cameraId}`, { method: 'DELETE' });

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

export const deleteEvent = (eventId) =>
  request(`/events/${eventId}`, { method: 'DELETE' });

// Streams
export const getActiveStreams = () => request('/streams');

// Video Analysis
export const uploadVideoForAnalysis = async (file) => {
  const formData = new FormData();
  formData.append('video', file);

  const token = localStorage.getItem('sentinel_token');
  console.log('[API] 📤 Dispatching situational mission clip deep scan...');
  const response = await fetch(`${API_BASE}/analysis/upload`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });

  if (!response.ok) {
    let errorMessage = 'SITUATIONAL_SCAN_FAILURE_UNK';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      errorMessage = `SYSTEM_FAILURE_${response.status} // ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  try {
    const data = await response.json();
    console.log('[API] ✅ Situational mission scan complete:', data);
    return data;
  } catch (e) {
    console.error('[API] ❌ Forensic JSON integrity failure:', e);
    throw new Error('SITUATIONAL_TELEMETRY_DESC_FAIL // Malformed Response');
  }

};
