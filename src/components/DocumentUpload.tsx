// Componente de subida de documentos
import { useState, useRef } from 'react';
import { documentsApi } from '../api/documents';
import type { Document, DocumentType, ConfidentialityLevel } from '../types';
import { DOCUMENT_TYPE_LABELS, CONFIDENTIALITY_LABELS, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '../types';

interface DocumentUploadProps {
  caseId: string;
  onUploadSuccess: (doc: Document) => void;
}

export function DocumentUpload({ caseId, onUploadSuccess }: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Metadata del documento
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('otro');
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState('');
  const [description, setDescription] = useState('');
  const [confidentiality, setConfidentiality] = useState<ConfidentialityLevel>('interno');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones del lado del cliente
    if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
      setError(`Tipo de archivo no permitido. Tipos aceptados: PDF, DOCX, DOC, TXT, JPG, PNG, EML`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`El archivo excede el tamaño máximo de ${MAX_FILE_SIZE / 1024 / 1024} MB`);
      return;
    }

    if (!title.trim()) {
      setError('Por favor, introduce un título para el documento');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await documentsApi.upload(caseId, file, {
        title: title.trim(),
        document_type: documentType,
        document_date: documentDate,
        source: source.trim(),
        description: description.trim(),
        confidentiality_level: confidentiality,
      });

      if (result.success && result.data) {
        setSuccess(`Documento "${file.name}" subido correctamente`);
        onUploadSuccess(result.data);
        
        // Reset form
        setTitle('');
        setDocumentType('otro');
        setDocumentDate(new Date().toISOString().split('T')[0]);
        setSource('');
        setDescription('');
        setConfidentiality('interno');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(result.error || 'Error al subir el documento');
      }
    } catch (err) {
      setError('Error inesperado al subir el documento');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Subir Nuevo Documento</h3>
      
      <div className="space-y-4">
        {/* File input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Archivo *
          </label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
            accept={ALLOWED_MIME_TYPES.join(',')}
            className="block w-full text-sm text-slate-300
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-amber-500 file:text-slate-900
              hover:file:bg-amber-400
              disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <p className="text-xs text-slate-500 mt-1">
            Tipos permitidos: PDF, DOCX, DOC, TXT, JPG, PNG, EML. Máximo {MAX_FILE_SIZE / 1024 / 1024} MB.
          </p>
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Título *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading}
            placeholder="Ej: Informe de riesgos psicosociales 2025"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
          />
        </div>

        {/* Tipo y Fecha en grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tipo de Documento
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              disabled={isUploading}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
            >
              {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Fecha del Documento
            </label>
            <input
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
              disabled={isUploading}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Procedencia */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Procedencia
          </label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={isUploading}
            placeholder="Ej: Servicio de Prevención Ajeno"
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUploading}
            rows={3}
            placeholder="Breve descripción del contenido del documento..."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 resize-none"
          />
        </div>

        {/* Confidencialidad */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Nivel de Confidencialidad
          </label>
          <select
            value={confidentiality}
            onChange={(e) => setConfidentiality(e.target.value as ConfidentialityLevel)}
            disabled={isUploading}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
          >
            {Object.entries(CONFIDENTIALITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-700 rounded-md text-red-300 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-900/20 border border-green-700 rounded-md text-green-300 text-sm">
            {success}
          </div>
        )}

        {/* Botón de subida (oculto, se activa al seleccionar archivo) */}
        {isUploading && (
          <div className="flex items-center gap-2 text-amber-400">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm">Calculando hash SHA-256 y subiendo documento...</span>
          </div>
        )}
      </div>
    </div>
  );
}
