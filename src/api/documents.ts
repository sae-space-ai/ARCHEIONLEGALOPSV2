// API de gestión documental con almacenamiento local
// Preparada para migrar a PostgreSQL + Vercel Blob

import type { 
  Document, 
  DocumentVersion, 
  ActionDocument, 
  AuditEvent,
  AllowedMimeType,
  ApiResponse 
} from '../types';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '../types';
import { calculateSHA256, generateUUID } from '../lib/crypto';

// Claves de localStorage
const DOCUMENTS_KEY = 'archeion_documents';
const VERSIONS_KEY = 'archeion_document_versions';
const LINKS_KEY = 'archeion_action_documents';
const AUDIT_KEY = 'archeion_audit_log';
const FILES_KEY = 'archeion_files'; // storageKey -> base64

// User ID fijo para modo público
const PUBLIC_USER_ID = '00000000-0000-0000-0000-000000000000';

// ============================================
// HELPERS
// ============================================

function getDocuments(): Document[] {
  const data = localStorage.getItem(DOCUMENTS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveDocuments(docs: Document[]): void {
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(docs));
}

function getVersions(): DocumentVersion[] {
  const data = localStorage.getItem(VERSIONS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveVersions(versions: DocumentVersion[]): void {
  localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
}

function getLinks(): ActionDocument[] {
  const data = localStorage.getItem(LINKS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveLinks(links: ActionDocument[]): void {
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
}

function getAuditLog(): AuditEvent[] {
  const data = localStorage.getItem(AUDIT_KEY);
  return data ? JSON.parse(data) : [];
}

function saveAuditLog(log: AuditEvent[]): void {
  localStorage.setItem(AUDIT_KEY, JSON.stringify(log));
}

function addAuditEvent(
  entityType: 'case' | 'event' | 'document' | 'user',
  entityId: string,
  action: AuditEvent['action'],
  metadata: Record<string, any> = {}
): void {
  const log = getAuditLog();
  const event: AuditEvent = {
    id: generateUUID(),
    actor_id: PUBLIC_USER_ID,
    entity_type: entityType,
    entity_id: entityId,
    action,
    timestamp: new Date().toISOString(),
    metadata,
  };
  log.push(event);
  saveAuditLog(log);
}

// Convierte File a base64 para almacenamiento
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Convierte base64 a Blob
function base64ToBlob(base64: string): Blob {
  const parts = base64.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const bstr = atob(parts[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

function storeFile(storageKey: string, base64: string): void {
  const files = JSON.parse(localStorage.getItem(FILES_KEY) || '{}');
  files[storageKey] = base64;
  localStorage.setItem(FILES_KEY, JSON.stringify(files));
}

function getFile(storageKey: string): Blob | null {
  const files = JSON.parse(localStorage.getItem(FILES_KEY) || '{}');
  const base64 = files[storageKey];
  return base64 ? base64ToBlob(base64) : null;
}

// ============================================
// VALIDACIÓN
// ============================================

function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type as AllowedMimeType)) {
    return { 
      valid: false, 
      error: `Tipo de archivo no permitido: ${file.type}. Permitidos: PDF, DOCX, DOC, TXT, JPG, PNG, EML` 
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `El archivo excede el tamaño máximo de ${MAX_FILE_SIZE / 1024 / 1024} MB` 
    };
  }
  return { valid: true };
}

// ============================================
// API PÚBLICA
// ============================================

export const documentsApi = {
  /**
   * Lista documentos de un expediente
   */
  list: async (caseId: string): Promise<ApiResponse<Document[]>> => {
    try {
      const docs = getDocuments().filter(d => d.case_id === caseId);
      return { success: true, data: docs };
    } catch (error) {
      return { success: false, error: 'Error al cargar documentos' };
    }
  },

  /**
   * Obtiene un documento por ID
   */
  get: async (id: string): Promise<ApiResponse<Document>> => {
    try {
      const doc = getDocuments().find(d => d.id === id);
      if (!doc) return { success: false, error: 'Documento no encontrado' };
      return { success: true, data: doc };
    } catch (error) {
      return { success: false, error: 'Error al cargar documento' };
    }
  },

  /**
   * Sube un nuevo documento
   */
  upload: async (
    caseId: string,
    file: File,
    metadata: {
      title: string;
      document_type: Document['document_type'];
      document_date: string;
      source: string;
      description: string;
      confidentiality_level: Document['confidentiality_level'];
    }
  ): Promise<ApiResponse<Document>> => {
    try {
      // Validar archivo
      const validation = validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Calcular SHA-256
      const sha256 = await calculateSHA256(file);

      // Generar storage key
      const storageKey = `doc_${generateUUID()}_${Date.now()}`;

      // Almacenar archivo
      const base64 = await fileToBase64(file);
      storeFile(storageKey, base64);

      // Crear documento
      const doc: Document = {
        id: generateUUID(),
        case_id: caseId,
        title: metadata.title,
        original_filename: file.name,
        mime_type: file.type as AllowedMimeType,
        file_size: file.size,
        storage_key: storageKey,
        sha256,
        document_type: metadata.document_type,
        document_date: metadata.document_date,
        received_at: new Date().toISOString(),
        uploaded_at: new Date().toISOString(),
        uploaded_by: PUBLIC_USER_ID,
        source: metadata.source,
        description: metadata.description,
        confidentiality_level: metadata.confidentiality_level,
        current_version: 1,
        status: 'activo',
      };

      const docs = getDocuments();
      docs.push(doc);
      saveDocuments(docs);

      // Crear versión inicial
      const version: DocumentVersion = {
        id: generateUUID(),
        document_id: doc.id,
        version: 1,
        storage_key: storageKey,
        sha256,
        uploaded_at: doc.uploaded_at,
        uploaded_by: PUBLIC_USER_ID,
        change_reason: 'Versión inicial',
      };

      const versions = getVersions();
      versions.push(version);
      saveVersions(versions);

      // Auditoría
      addAuditEvent('document', doc.id, 'upload', {
        filename: file.name,
        size: file.size,
        sha256,
      });

      return { success: true, data: doc };
    } catch (error) {
      console.error('Error al subir documento:', error);
      return { success: false, error: 'Error al subir documento' };
    }
  },

  /**
   * Descarga un documento
   */
  download: async (id: string): Promise<ApiResponse<Blob>> => {
    try {
      const doc = getDocuments().find(d => d.id === id);
      if (!doc) return { success: false, error: 'Documento no encontrado' };

      const blob = getFile(doc.storage_key);
      if (!blob) return { success: false, error: 'Archivo no encontrado' };

      // Auditoría
      addAuditEvent('document', doc.id, 'download', {
        filename: doc.original_filename,
      });

      return { success: true, data: blob };
    } catch (error) {
      return { success: false, error: 'Error al descargar documento' };
    }
  },

  /**
   * Elimina un documento (soft delete)
   */
  delete: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const docs = getDocuments();
      const doc = docs.find(d => d.id === id);
      if (!doc) return { success: false, error: 'Documento no encontrado' };

      // Soft delete
      doc.status = 'archivado';
      saveDocuments(docs);

      // Auditoría
      addAuditEvent('document', doc.id, 'delete', {
        filename: doc.original_filename,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error al eliminar documento' };
    }
  },

  /**
   * Obtiene el historial de versiones de un documento
   */
  getVersions: async (documentId: string): Promise<ApiResponse<DocumentVersion[]>> => {
    try {
      const versions = getVersions()
        .filter(v => v.document_id === documentId)
        .sort((a, b) => b.version - a.version);
      return { success: true, data: versions };
    } catch (error) {
      return { success: false, error: 'Error al cargar versiones' };
    }
  },

  /**
   * Vincula un documento a una actuación
   */
  linkToAction: async (
    actionId: string,
    documentId: string,
    relationshipType: ActionDocument['relationship_type'] = 'adjunto'
  ): Promise<ApiResponse<ActionDocument>> => {
    try {
      const links = getLinks();
      
      // Verificar que no exista ya
      const existing = links.find(
        l => l.action_id === actionId && l.document_id === documentId
      );
      if (existing) {
        return { success: false, error: 'El documento ya está vinculado' };
      }

      const link: ActionDocument = {
        id: generateUUID(),
        action_id: actionId,
        document_id: documentId,
        relationship_type: relationshipType,
      };

      links.push(link);
      saveLinks(links);

      // Auditoría
      addAuditEvent('document', documentId, 'link', {
        action_id: actionId,
        relationship_type: relationshipType,
      });

      return { success: true, data: link };
    } catch (error) {
      return { success: false, error: 'Error al vincular documento' };
    }
  },

  /**
   * Obtiene documentos vinculados a una actuación
   */
  getLinkedDocuments: async (actionId: string): Promise<ApiResponse<Document[]>> => {
    try {
      const links = getLinks().filter(l => l.action_id === actionId);
      const docs = getDocuments();
      const linkedDocs = links
        .map(link => docs.find(d => d.id === link.document_id))
        .filter((d): d is Document => d !== undefined);
      return { success: true, data: linkedDocs };
    } catch (error) {
      return { success: false, error: 'Error al cargar documentos vinculados' };
    }
  },

  /**
   * Obtiene el log de auditoría
   */
  getAuditLog: async (entityType?: AuditEvent['entity_type'], entityId?: string): Promise<ApiResponse<AuditEvent[]>> => {
    try {
      let log = getAuditLog();
      if (entityType) log = log.filter(e => e.entity_type === entityType);
      if (entityId) log = log.filter(e => e.entity_id === entityId);
      log.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return { success: true, data: log };
    } catch (error) {
      return { success: false, error: 'Error al cargar auditoría' };
    }
  },
};
