// Cliente API para ARCHEION LEGAL OPS — MODO PÚBLICO (sin autenticación)

import type { Case, CaseEvent, ApiResponse } from '../types';

const API_BASE = '/api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
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

// Expedientes (acceso público)
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

// Actuaciones (acceso público)
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
