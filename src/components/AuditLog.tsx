// Componente de log de auditoría
import { useState, useEffect } from 'react';
import { documentsApi } from '../api/documents';
import type { AuditEvent } from '../types';

interface AuditLogProps {
  entityType?: AuditEvent['entity_type'];
  entityId?: string;
}

const ACTION_LABELS: Record<AuditEvent['action'], string> = {
  create: 'Creación',
  read: 'Lectura',
  update: 'Actualización',
  delete: 'Eliminación',
  upload: 'Subida',
  download: 'Descarga',
  link: 'Vinculación',
  unlink: 'Desvinculación',
  export: 'Exportación',
  login: 'Inicio de sesión',
  logout: 'Cierre de sesión',
  failed_login: 'Intento de acceso fallido',
};

const ACTION_COLORS: Record<AuditEvent['action'], string> = {
  create: 'bg-green-900/30 text-green-300',
  read: 'bg-blue-900/30 text-blue-300',
  update: 'bg-yellow-900/30 text-yellow-300',
  delete: 'bg-red-900/30 text-red-300',
  upload: 'bg-green-900/30 text-green-300',
  download: 'bg-blue-900/30 text-blue-300',
  link: 'bg-purple-900/30 text-purple-300',
  unlink: 'bg-orange-900/30 text-orange-300',
  export: 'bg-indigo-900/30 text-indigo-300',
  login: 'bg-green-900/30 text-green-300',
  logout: 'bg-slate-700 text-slate-300',
  failed_login: 'bg-red-900/30 text-red-300',
};

export function AuditLog({ entityType, entityId }: AuditLogProps) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, [entityType, entityId]);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await documentsApi.getAuditLog(entityType, entityId);
      if (result.success && result.data) {
        setEvents(result.data);
      } else {
        setError(result.error || 'Error al cargar log de auditoría');
      }
    } catch (err) {
      setError('Error inesperado al cargar auditoría');
      console.error(err);
    } finally {
      setLoading(false);
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
          <span>Cargando log de auditoría...</span>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="text-center text-slate-400">
          <svg className="mx-auto h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No hay eventos de auditoría registrados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">
          Log de Auditoría ({events.length} eventos)
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Los registros de auditoría permiten reconstruir las operaciones realizadas.
          No constituyen garantía automática de inmutabilidad.
        </p>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-900/20 border border-red-700 rounded-md text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="divide-y divide-slate-700 max-h-96 overflow-y-auto">
        {events.map((event) => (
          <div key={event.id} className="p-4 hover:bg-slate-700/30 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${ACTION_COLORS[event.action]}`}>
                    {ACTION_LABELS[event.action]}
                  </span>
                  <span className="text-xs text-slate-500">
                    {event.entity_type} · {event.entity_id.substring(0, 8)}...
                  </span>
                </div>
                
                {Object.keys(event.metadata).length > 0 && (
                  <div className="text-xs text-slate-400 mt-2 space-y-1">
                    {Object.entries(event.metadata).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-slate-500">{key}:</span>
                        <span className="text-slate-300 font-mono truncate">
                          {typeof value === 'string' && value.length > 50 
                            ? value.substring(0, 50) + '...' 
                            : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-500 whitespace-nowrap">
                {new Date(event.timestamp).toLocaleString('es-ES')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
