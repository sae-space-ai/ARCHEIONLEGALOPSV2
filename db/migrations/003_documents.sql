-- Migración V3.0: Módulo de Gestión Documental
-- ARCHEION LEGAL OPS
-- 
-- Esta migración añade las tablas necesarias para:
-- - Gestión documental con versionado
-- - Vinculación de documentos a actuaciones
-- - Log de auditoría completo
-- - Trazabilidad con hashes SHA-256

BEGIN;

-- ============================================
-- TABLA: documents
-- Almacena metadatos de documentos
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  original_filename VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  storage_key VARCHAR(500) NOT NULL, -- Clave en Vercel Blob/S3
  sha256 VARCHAR(64) NOT NULL, -- Hash SHA-256 del contenido
  document_type VARCHAR(50) NOT NULL, -- reclamacion, justificante, comunicacion, etc.
  document_date DATE NOT NULL, -- Fecha del documento (producción)
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Fecha de recepción
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Fecha de incorporación
  uploaded_by UUID NOT NULL REFERENCES users(id),
  source VARCHAR(500), -- Procedencia del documento
  description TEXT,
  confidentiality_level VARCHAR(20) NOT NULL DEFAULT 'interno', -- publico, interno, confidencial, secreto
  current_version INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'activo', -- activo, obsoleto, archivado
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLA: document_versions
-- Historial de versiones de documentos
-- ============================================
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  sha256 VARCHAR(64) NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID NOT NULL REFERENCES users(id),
  change_reason TEXT,
  
  UNIQUE(document_id, version)
);

-- ============================================
-- TABLA: action_documents
-- Vinculación muchos-a-muchos entre actuaciones y documentos
-- ============================================
CREATE TABLE IF NOT EXISTS action_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id UUID NOT NULL REFERENCES case_events(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL DEFAULT 'adjunto', -- adjunto, evidencia, referencia, anexo
  
  UNIQUE(action_id, document_id)
);

-- ============================================
-- TABLA: audit_events
-- Log de auditoría completo
-- ============================================
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES users(id),
  entity_type VARCHAR(50) NOT NULL, -- case, event, document, user
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- create, read, update, delete, upload, download, link, unlink, export, login, logout, failed_login
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb, -- Datos adicionales contextuales
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================

-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_case_id ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_confidentiality ON documents(confidentiality_level);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_sha256 ON documents(sha256);

-- Document versions
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);

-- Action documents
CREATE INDEX IF NOT EXISTS idx_action_documents_action_id ON action_documents(action_id);
CREATE INDEX IF NOT EXISTS idx_action_documents_document_id ON action_documents(document_id);

-- Audit events
CREATE INDEX IF NOT EXISTS idx_audit_events_actor_id ON audit_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_action ON audit_events(action);
CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON audit_events(timestamp DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para actualizar updated_at en documents
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_documents_updated_at ON documents;
CREATE TRIGGER trigger_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_updated_at();

COMMIT;

-- ============================================
-- NOTAS DE MIGRACIÓN
-- ============================================
-- 
-- 1. Esta migración es compatible con el esquema existente
-- 2. No modifica tablas existentes (cases, case_events, users)
-- 3. Añade funcionalidad documental sin romper lo existente
-- 4. Los hashes SHA-256 permiten verificar integridad
-- 5. El versionado permite preservar originales
-- 6. El log de auditoría es completo y consultable
-- 
-- PRÓXIMOS PASOS:
-- - Configurar Vercel Blob para almacenamiento de archivos
-- - Implementar API endpoints para documentos
-- - Añadir interfaz de subida/descarga
-- - Implementar exportación ZIP de expedientes
