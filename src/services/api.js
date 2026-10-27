// Cliente de API Selene (Reverse Proxy & Configurable Prefix Routing)
const rawPrefix = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_PREFIX !== undefined)
  ? String(import.meta.env.VITE_API_PREFIX).trim()
  : '/api';

export const API_PREFIX = rawPrefix
  ? (rawPrefix.startsWith('/') ? rawPrefix.replace(/\/+$/, '') : `/${rawPrefix.replace(/\/+$/, '')}`)
  : '';

export const API_BASE_URL = '';

export const getAuthToken = () => {
  if (typeof window === 'undefined') return '';
  const token = localStorage.getItem('access_token') || '';
  return token.replace(/[\r\n\s]+/g, '');
};

export const setAuthToken = async (token) => {
  if (typeof window !== 'undefined') {
    if (token) {
      const cleanToken = String(token).replace(/[\r\n\s]+/g, '');
      localStorage.setItem('access_token', cleanToken);
      return cleanToken;
    } else {
      localStorage.removeItem('access_token');
      return '';
    }
  }
  return '';
};

export const apiRequest = async (endpoint, options = {}) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // O único endpoint público desautenticado é o login
  const isAuthEndpoint = cleanEndpoint.includes('/rpc/login');
  const token = isAuthEndpoint || options.noAuth ? '' : getAuthToken();
  const isRpc = cleanEndpoint.includes('/rpc/');

  const headers = {
    'Content-Type': 'application/json',
    'Prefer': 'return=representation, count=exact',
    ...(isRpc ? { 'Accept-Profile': 'api', 'Content-Profile': 'api' } : {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob)) {
    body = JSON.stringify(body);
  }

  // Prepend API_PREFIX se ainda não estiver presente no endpoint
  const pathWithPrefix = (API_PREFIX && !cleanEndpoint.startsWith(API_PREFIX))
    ? `${API_PREFIX}${cleanEndpoint}`
    : cleanEndpoint;

  const url = `${API_BASE_URL}${pathWithPrefix}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      ...(body !== undefined ? { body } : {})
    });
    const totalCount = res.headers.get('Content-Range')?.split('/')[1] || null;
    let data;
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = text;
    }
    return { data, status: res.status, totalCount, ok: res.ok };
  } catch (err) {
    return { data: [], status: 500, totalCount: 0, ok: false, error: err };
  }
};
