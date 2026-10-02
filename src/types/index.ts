// Tipos TypeScript para ARCHEION LEGAL OPS

export interface User {
  id: string;
  email: string;
  created_at: string;
  account_status: 'active' | 'suspended' | 'pending';
}

export interface Session {
  userId: string;
  email: string;
  expiresAt: number;
}

export type CaseCategory = 'administrativo' | 'juridico' | 'prl';
export type CaseStatus = 'abierto' | 'en_curso' | 'cerrado' | 'archivado';
export type EventType = 'hecho' | 'registro' | 'comunicacion' | 'plazo' | 'fundamento' | 'peticion' | 'prl';

export interface Case {
  id: string;
  user_id: string;
  referencia: string;
  titulo: string;
  descripcion: string;
  categoria: CaseCategory;
  estado: CaseStatus;
  created_at: string;
  updated_at: string;
}

export interface CaseEvent {
  id: string;
  case_id: string;
  user_id: string;
  fecha_actuacion: string;
  tipo: EventType;
  descripcion: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
