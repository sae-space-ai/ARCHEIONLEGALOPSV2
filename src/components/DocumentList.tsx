// Componente de lista de documentos
import { useState, useEffect } from 'react';
import { documentsApi } from '../api/documents';
import type { Document } from '../types';
import { DOCUMENT_TYPE_LABELS, CONFIDENTIALITY_LABELS } from '../types';
import { formatHash } from '../lib/crypto';
import { saveAs } from 'file-saver';

interface DocumentListProps {
  caseId: string;
  onDocumentDeleted?: () => void;
}

export function DocumentList({ caseId, onDocumentDeleted }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [caseId]);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await documentsApi.list(caseId);
      if (result.success && result.data) {
        setDocuments(result.data);
      } else {
        setError(result.error || 'Error al cargar documentos');
      }
    } catch (err) {
      setError('Error inesperado al cargar documentos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc: Document) => {
    setDownloadingId(doc.id);
    try {
      const result = await documentsApi.download(doc.id);
      if (result.success && result.data) {
        saveAs(result.data, doc.original_filename);
      } else {
        setError(result.error || 'Error al descargar documento');
      }
    } catch (err) {
      setError('Error inesperado al descargar');
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar \"${doc.title}\"?`)) {
      return;
    }

    try {
      const result = await documentsApi.delete(doc.id);
      if (result.success) {
        setDocuments(documents.filter(d => d.id !== doc.id));
        onDocumentDeleted?.();
      } else {
        setError(result.error || 'Error al eliminar documento');
      }
    } catch (err) {
      setError('Error inesperado al eliminar');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center gap-2 text-slate-400">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Cargando documentos...</span>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="text-center text-slate-400">
          <svg className="mx-auto h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No hay documentos en este expediente</p>
          <p className="text-sm mt-1">Usa el formulario de arriba para subir el primer documento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">
          Documentos ({documents.length})
        </h3>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-900/20 border border-red-700 rounded-md text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="divide-y divide-slate-700">
        {documents.map((doc) => (
          <div key={doc.id} className="p-6 hover:bg-slate-700/30 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-white font-medium truncate">
                    {doc.title}
                  </h4>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    doc.confidentiality_level === 'secreto' ? 'bg-red-900/30 text-red-300' :
                    doc.confidentiality_level === 'confidencial' ? 'bg-orange-900/30 text-orange-300' :
                    doc.confidentiality_level === 'interno' ? 'bg-blue-900/30 text-blue-300' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {CONFIDENTIALITY_LABELS[doc.confidentiality_level]}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-400 mb-3">
                  <div>
                    <span className="text-slate-500">Tipo:</span>{' '}
                    <span className="text-slate-300">{DOCUMENT_TYPE_LABELS[doc.document_type]}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Fecha:</span>{' '}
                    <span className="text-slate-300">{new Date(doc.document_date).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Archivo:</span>{' '}
                    <span className="text-slate-300 truncate">{doc.original_filename}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Tamaño:</span>{' '}
                    <span className="text-slate-300">{(doc.file_size / 1024).toFixed(2)} KB</span>
                  </div>
                  {doc.source && (
                    <div className="md:col-span-2">
                      <span className="text-slate-500">Procedencia:</span>{' '}
                      <span className="text-slate-300">{doc.source}</span>
                    </div>
                  )}
                  {doc.description && (
                    <div className="md:col-span-2">
                      <span className="text-slate-500">Descripción:</span>{' '}
                      <span className="text-slate-300">{doc.description}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>SHA-256:</span>
                  <code className="bg-slate-900 px-2 py-0.5 rounded font-mono">
                    {formatHash(doc.sha256, 32)}
                  </code>
                  <span className="text-slate-600">v{doc.current_version}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleDownload(doc)}
                  disabled={downloadingId === doc.id}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {downloadingId === doc.id ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Descargando...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Descargar
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDelete(doc)}
                  className="px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-red-300 text-sm font-medium rounded-md transition-colors flex items-center gap-1"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
