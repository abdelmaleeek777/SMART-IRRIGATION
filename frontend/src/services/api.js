export const API_BASE_URL = 'http://127.0.0.1:8003';

export function getApiErrorMessage(detail) {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((error) => error.msg || error.message || 'Invalid request data').join('. ');
  }
  return 'The server could not process the request.';
}

export async function apiRequest(path, options = {}) {
  let response;
  try {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    const token = window.localStorage.getItem('access_token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Unable to reach the server. Please check that the API is running.');
  }
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) throw new Error(getApiErrorMessage(body?.detail));
  return body;
}

export function logout() {
  window.localStorage.removeItem('access_token');
  window.location.assign('/login');
}
