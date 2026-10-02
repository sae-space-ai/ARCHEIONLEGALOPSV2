// Cliente API para ARCHEION LEGAL OPS — MODO PRIVADO con autenticación

import type { 
  User, 
  Case, 
  CaseEvent, 
  LoginRequest, 
  LoginResponse, 
  ApiResponse 
} from '../types';

const API_BASE = '/api';

// Error personalizado para errores de API
export class ApiError extends Error {
  status: number;
  serverMessage: string;
  
  constructor(status: number, serverMessage: string) {
    super(serverMessage);
    this.name = 'ApiError';
    this.status = status;
    this.serverMessage = serverMessage;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  let response: Response;
  
  try {
    response = await fetch(url, {
      ...options,
      credentials: 'include', // Enviar cookies de sesión
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  } catch (networkError) {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Verifica tu conexión a internet.');
  }

  // Intentar parsear la respuesta como JSON
  let responseBody: any;
  const contentType = response.headers.get('content-type') || '';
  
  if (contentType.includes('application/json')) {
    try {
      responseBody = await response.json();
    } catch {
      throw new ApiError(
        response.status,
        `El servidor devolvió una respuesta inválida (HTTP ${response.status}).`
      );
    }
  } else {
    const text = await response.text().catch(() => '');
    
    if (response.status === 500) {
      if (text.includes('FUNCTION_INVOCATION_FAILED')) {
        throw new ApiError(
          500,
          'Error del servidor. Probablemente la base de datos no está configurada.'
        );
      }
      throw new ApiError(500, `Error interno del servidor (HTTP 500).`);
    }
    
    if (response.status === 404) {
      throw new ApiError(
        404,
        `La ruta ${endpoint} no existe. El backend puede no estar desplegado correctamente.`
      );
    }
    
    throw new ApiError(
      response.status,
      `Respuesta inesperada del servidor (HTTP ${response.status}).`
    );
  }

  if (!response.ok) {
    const errorMessage = responseBody?.error || `Error HTTP ${response.status}`;
    throw new ApiError(response.status, errorMessage);
  }

  return responseBody as T;
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

// Expedientes (acceso privado)
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

// Actuaciones (acceso privado)
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
