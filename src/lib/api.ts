const API = '/api';

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function authLogin(email: string, password: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Login failed');
  }
  return res.json();
}

export async function authRegister(data: {
  email: string;
  password: string;
  name: string;
  branchName: string;
  branchLocation: string;
}) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Registration failed');
  }
  return res.json();
}

export async function getSalesHistory(params?: {
  partnerId?: string;
  branchId?: string;
  startDate?: string;
  endDate?: string;
}) {
  const q = new URLSearchParams();
  if (params?.partnerId) q.set('partnerId', params.partnerId);
  if (params?.branchId) q.set('branchId', params.branchId);
  if (params?.startDate) q.set('startDate', params.startDate);
  if (params?.endDate) q.set('endDate', params.endDate);
  const url = `${API}/sales/history${q.toString() ? `?${q}` : ''}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch sales');
  return res.json();
}

export async function getPartners() {
  const res = await fetch(`${API}/partners`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch partners');
  return res.json();
}

export async function submitSales(data: {
  date: string;
  productName: string;
  quantity: number;
  salesAmount: number;
  profit: number;
}) {
  const res = await fetch(`${API}/sales`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to submit sales');
  }
  return res.json();
}
