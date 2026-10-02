// Página de detalle de expediente con cronología, documentos y auditoría

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { casesApi, eventsApi } from '../api/client-local';
import { DocumentUpload } from '../components/DocumentUpload';
import { DocumentList } from '../components/DocumentList';
import { ExportButton } from '../components/ExportButton';
import { AuditLog } from '../components/AuditLog';
import type { Case, CaseEvent, Document } from '../types';

type TabId = 'resumen' | 'cronologia' | 'documentos' | 'auditoria';

export function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [events, setEvents] = useState<CaseEvent[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('resumen');
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    fecha_actuacion: new Date().toISOString().split('T')[0],
    tipo: 'hecho',
    descripcion: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [caseRes, eventsRes] = await Promise.all([
        casesApi.get(id),
        eventsApi.list(id),
      ]);
      if (caseRes.data) setCaseData(caseRes.data);
      if (eventsRes.data) setEvents(eventsRes.data);
    } catch (error) {
      console.error('Error al cargar expediente:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    if (!id) return;
    // Los documentos se cargan en el componente DocumentList
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await eventsApi.create(id, newEvent);
      setNewEvent({
        fecha_actuacion: new Date().toISOString().split('T')[0],
        tipo: 'hecho',
        descripcion: '',
      });
      setShowEventForm(false);
      loadData();
    } catch (error) {
      console.error('Error al crear actuación:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDocumentUploaded = () => {
    // Recargar lista de documentos
    loadDocuments();
  };

  const eventTypeLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      hecho: 'Hecho',
      registro: 'Registro',
      comunicacion: 'Comunicación',
      plazo: 'Plazo',
      fundamento: 'Fundamento',
      peticion: 'Petición',
      prl: 'PRL',
    };
    return labels[tipo] || tipo;
  };

  const categoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      administrativo: 'Administrativo',
      juridico: 'Jurídico',
      prl: 'PRL',
    };
    return labels[cat] || cat;
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-slate-400 py-8 text-center">Cargando expediente...</div>
      </Layout>
    );
  }

  if (!caseData) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-slate-400 text-lg">Expediente no encontrado</p>
          <Link to="/expedientes" className="mt-4 inline-block text-amber-400 hover:text-amber-300">
            Volver a expedientes
          </Link>
        </div>
      </Layout>
    );
  }

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'resumen', label: 'Resumen', icon: '📋' },
    { id: 'cronologia', label: 'Cronología', icon: '📅' },
    { id: 'documentos', label: 'Documentos', icon: '📄' },
    { id: 'auditoria', label: 'Auditoría', icon: '🔍' },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link to="/expedientes" className="text-slate-400 hover:text-white">
            Expedientes
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-amber-400">{caseData.referencia}</span>
        </div>

        {/* Cabecera del expediente */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-amber-400 font-mono text-sm">{caseData.referencia}</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-xs border border-emerald-500/30">
                  {caseData.estado}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">{caseData.titulo}</h1>
              <p className="text-slate-400 text-sm mt-1">{categoryLabel(caseData.categoria)}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-slate-300 text-sm">{caseData.descripcion}</p>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
            <span>Creado: {new Date(caseData.created_at).toLocaleDateString('es-ES')}</span>
            <span>Actualizado: {new Date(caseData.updated_at).toLocaleDateString('es-ES')}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-500'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido de tabs */}
        {activeTab === 'resumen' && (
          <div className="space-y-6">
            <ExportButton caseData={caseData} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm">Total actuaciones</p>
                <p className="text-2xl font-bold text-white mt-1">{events.length}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm">Documentos</p>
                <p className="text-2xl font-bold text-white mt-1">{documents.length}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <p className="text-slate-400 text-sm">Última actuación</p>
                <p className="text-sm text-white mt-1">
                  {events.length > 0
                    ? new Date(events[0].fecha_actuacion).toLocaleDateString('es-ES')
                    : 'Sin actuaciones'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cronologia' && (
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Cronología de actuaciones</h2>
              <button
                onClick={() => setShowEventForm(!showEventForm)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-medium rounded-lg transition-colors"
              >
                {showEventForm ? 'Cancelar' : '+ Nueva actuación'}
              </button>
            </div>

            {showEventForm && (
              <form onSubmit={handleCreateEvent} className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Fecha</label>
                    <input
                      type="date"
                      value={newEvent.fecha_actuacion}
                      onChange={(e) => setNewEvent({ ...newEvent, fecha_actuacion: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Tipo</label>
                    <select
                      value={newEvent.tipo}
                      onChange={(e) => setNewEvent({ ...newEvent, tipo: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="hecho">Hecho</option>
                      <option value="registro">Registro</option>
                      <option value="comunicacion">Comunicación</option>
                      <option value="plazo">Plazo</option>
                      <option value="fundamento">Fundamento</option>
                      <option value="peticion">Petición</option>
                      <option value="prl">PRL</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs text-slate-400 mb-1">Descripción</label>
                  <textarea
                    value={newEvent.descripcion}
                    onChange={(e) => setNewEvent({ ...newEvent, descripcion: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Descripción de la actuación..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar actuación'}
                </button>
              </form>
            )}

            {events.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">No hay actuaciones registradas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs border border-blue-500/30">
                            {eventTypeLabel(event.tipo)}
                          </span>
                          <span className="text-slate-500 text-xs">
                            {new Date(event.fecha_actuacion).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm">{event.descripcion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documentos' && (
          <div className="space-y-6">
            <DocumentUpload caseId={caseData.id} onUploadSuccess={handleDocumentUploaded} />
            <DocumentList caseId={caseData.id} onDocumentDeleted={loadDocuments} />
          </div>
        )}

        {activeTab === 'auditoria' && (
          <AuditLog entityType="case" entityId={caseData.id} />
        )}
      </div>
    </Layout>
  );
}
