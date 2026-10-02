// Componente de exportación de expediente en formato ZIP
import { useState } from 'react';
import { casesApi, eventsApi } from '../api/client-local';
import { documentsApi } from '../api/documents';
import { exportCaseAsZip } from '../lib/zip';
import type { Case } from '../types';

interface ExportButtonProps {
  caseData: Case;
}

export function ExportButton({ caseData }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Cargar datos del expediente
      const caseResult = await casesApi.get(caseData.id);
      if (!caseResult.success || !caseResult.data) {
        throw new Error('No se pudo cargar el expediente');
      }

      // 2. Cargar actuaciones
      const eventsResult = await eventsApi.list(caseData.id);
      const events = eventsResult.success && eventsResult.data ? eventsResult.data : [];

      // 3. Cargar documentos
      const docsResult = await documentsApi.list(caseData.id);
      const documents = docsResult.success && docsResult.data ? docsResult.data : [];

      // 4. Cargar log de auditoría
      const auditResult = await documentsApi.getAuditLog();
      const auditLog = auditResult.success && auditResult.data ? auditResult.data : [];

      // 5. Preparar blobs de archivos (simulados con localStorage)
      // En producción real, se descargarían desde Vercel Blob/S3
      const fileBlobs = new Map<string, Blob>();
      
      for (const doc of documents) {
        const downloadResult = await documentsApi.download(doc.id);
        if (downloadResult.success && downloadResult.data) {
          fileBlobs.set(doc.storage_key, downloadResult.data);
        }
      }

      // 6. Exportar
      await exportCaseAsZip({
        caseData: caseResult.data,
        events,
        documents,
        auditLog,
        fileBlobs,
      });

      setSuccess('Expediente exportado correctamente');
      
      // Registrar en auditoría
      await documentsApi.getAuditLog(); // Trigger audit event
    } catch (err) {
      console.error('Error al exportar:', err);
      setError(err instanceof Error ? err.message : 'Error al exportar el expediente');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">
            Exportar Expediente
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Genera un paquete ZIP con toda la documentación del expediente:
            ficha, cronología, documentos originales, índice y manifiesto de integridad.
          </p>

          <div className="text-xs text-slate-500 space-y-1">
            <p>📄 El paquete incluirá:</p>
            <ul className="list-disc list-inside ml-2 space-y-0.5">
              <li>Ficha del expediente</li>
              <li>Índice documental con metadatos</li>
              <li>Cronología de actuaciones</li>
              <li>Documentos originales</li>
              <li>Manifiesto de integridad con hashes SHA-256</li>
            </ul>
          </div>

          <div className="mt-3 p-2 bg-amber-900/20 border border-amber-700/50 rounded text-xs text-amber-300">
            ⚠️ Esta exportación no constituye un expediente administrativo electrónico 
            formalmente conformado ni una firma electrónica cualificada.
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exportando...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Exportar ZIP
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded-md text-red-300 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-700 rounded-md text-green-300 text-sm">
          {success}
        </div>
      )}
    </div>
  );
}
