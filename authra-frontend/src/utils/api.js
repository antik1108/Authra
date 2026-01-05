// Simple API client for the frontend
// Default to the backend port used by the project (5000). You can override with VITE_API_URL.
const API_BASE = import.meta?.env?.VITE_API_URL || import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:5001';
const BASE_URL = `${API_BASE}/api`;

async function request(path, { method = 'GET', body, headers = {}, auth = false, isForm = false } = {}) {
  const opts = {
    method,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
  };

  if (auth) {
    const token = localStorage.getItem('auth_token');
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body !== undefined) {
    opts.body = isForm ? body : JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const isJSON = res.headers.get('content-type')?.includes('application/json');
  const data = isJSON ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = isJSON ? (data?.error || data?.message || `HTTP ${res.status}`) : res.statusText;
    throw new Error(msg);
  }

  return data;
}

export const api = {
  post: (path, body, options) => request(path, { method: 'POST', body, ...(options || {}) }),
  get: (path, options) => request(path, { method: 'GET', ...(options || {}) }),
  patch: (path, body, options) => request(path, { method: 'PATCH', body, ...(options || {}) }),
  del: (path, options) => request(path, { method: 'DELETE', ...(options || {}) }),
  postForm: (path, formData, options) => request(path, { method: 'POST', body: formData, isForm: true, ...(options || {}) }),
  BASE_URL,
};
