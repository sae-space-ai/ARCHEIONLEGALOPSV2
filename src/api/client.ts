// Cliente API para ARCHEION LEGAL OPS
// Todas las peticiones incluyen credenciales para enviar cookies de sesión

import type { 
  User, 
  Case, 
  CaseEvent, 
  LoginRequest, 
  LoginResponse, 
  ApiResponse 
} from '../types';

const API_BASE = '/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Enviar cookies de sesión
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Autenticación
export const authApi = {
  getSession: () => request<{ user: User | null }>('/session'),
  
  login: (data: LoginRequest) => 
    request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  logout: () => 
    request<{ success: boolean }>('/logout', {
      method: 'POST',
    }),
};

// Expedientes
export const casesApi = {
  list: (filters?: { categoria?: string; estado?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.categoria) params.set('categoria', filters.categoria);
    if (filters?.estado) params.set('estado', filters.estado);
    if (filters?.search) params.set('search', filters.search);
    
    const query = params.toString();
    return request<ApiResponse<Case[]>>(`/cases${query ? `?${query}` : ''}`);
  },
  
  get: (id: string) => request<ApiResponse<Case>>(`/cases/${id}`),
  
  create: (data: { 
    referencia: string; 
    titulo: string; 
    descripcion: string; 
    categoria: string; 
  }) => request<ApiResponse<Case>>('/cases', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Actuaciones
export const eventsApi = {
  list: (caseId: string) => 
    request<ApiResponse<CaseEvent[]>>(`/cases/${caseId}/events`),
  
  create: (caseId: string, data: { 
    fecha_actuacion: string; 
    tipo: string; 
    descripcion: string; 
  }) => request<ApiResponse<CaseEvent>>(`/cases/${caseId}/events`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};
