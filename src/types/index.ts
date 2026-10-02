// Tipos TypeScript para ARCHEION LEGAL OPS V3.0
// Incluye gestión documental, auditoría y trazabilidad

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

// ============================================
// GESTIÓN DOCUMENTAL V3.0
// ============================================

export type DocumentType =
  | 'reclamacion'
  | 'justificante'
  | 'comunicacion'
  | 'solicitud'
  | 'informe_prevencion'
  | 'horario'
  | 'asignacion'
  | 'dotacion_tecnologica'
  | 'resolucion'
  | 'otro';

export type ConfidentialityLevel = 'publico' | 'interno' | 'confidencial' | 'secreto';

export type DocumentStatus = 'activo' | 'obsoleto' | 'archivado';

export type AllowedMimeType =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/msword'
  | 'text/plain'
  | 'image/jpeg'
  | 'image/png'
  | 'message/rfc822';

export interface Document {
  id: string;
  case_id: string;
  title: string;
  original_filename: string;
  mime_type: AllowedMimeType;
  file_size: number;
  storage_key: string;
  sha256: string;
  document_type: DocumentType;
  document_date: string; // Fecha del documento (producción)
  received_at: string; // Fecha de recepción
  uploaded_at: string; // Fecha de incorporación al sistema
  uploaded_by: string; // ID del usuario que subió
  source: string; // Procedencia
  description: string;
  confidentiality_level: ConfidentialityLevel;
  current_version: number;
  status: DocumentStatus;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version: number;
  storage_key: string;
  sha256: string;
  uploaded_at: string;
  uploaded_by: string;
  change_reason: string;
}

export interface ActionDocument {
  id: string;
  action_id: string;
  document_id: string;
  relationship_type: 'adjunto' | 'evidencia' | 'referencia' | 'anexo';
}

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'upload'
  | 'download'
  | 'link'
  | 'unlink'
  | 'export'
  | 'login'
  | 'logout'
  | 'failed_login';

export interface AuditEvent {
  id: string;
  actor_id: string;
  entity_type: 'case' | 'event' | 'document' | 'user';
  entity_id: string;
  action: AuditAction;
  timestamp: string;
  metadata: Record<string, any>;
}

// ============================================
// API REQUESTS/RESPONSES
// ============================================

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

// ============================================
// CONSTANTES
// ============================================

export const ALLOWED_MIME_TYPES: AllowedMimeType[] = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'image/jpeg',
  'image/png',
  'message/rfc822',
];

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  reclamacion: 'Reclamación',
  justificante: 'Justificante',
  comunicacion: 'Comunicación',
  solicitud: 'Solicitud',
  informe_prevencion: 'Informe de Prevención',
  horario: 'Horario',
  asignacion: 'Asignación',
  dotacion_tecnologica: 'Dotación Tecnológica',
  resolucion: 'Resolución',
  otro: 'Otro',
};

export const CONFIDENTIALITY_LABELS: Record<ConfidentialityLevel, string> = {
  publico: 'Público',
  interno: 'Interno',
  confidencial: 'Confidencial',
  secreto: 'Secreto',
};
