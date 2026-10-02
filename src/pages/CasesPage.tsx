// Página de listado de expedientes con búsqueda y filtros

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { casesApi } from '../api/client-local';
import type { Case } from '../types';

export function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [estado, setEstado] = useState('');

  useEffect(() => {
    loadCases();
  }, [categoria, estado]);

  const loadCases = async () => {
    setLoading(true);
    try {
      const { data } = await casesApi.list({
        categoria: categoria || undefined,
        estado: estado || undefined,
        search: search || undefined,
      });
      if (data) {
        setCases(data);
      }
    } catch (error) {
      console.error('Error al cargar expedientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCases();
  };

  const categoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      administrativo: 'Administrativo',
      juridico: 'Jurídico',
      prl: 'PRL',
    };
    return labels[cat] || cat;
  };

  const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
      abierto: 'Abierto',
      en_curso: 'En curso',
      cerrado: 'Cerrado',
      archivado: 'Archivado',
    };
    return labels[status] || status;
  };

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      abierto: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      en_curso: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      cerrado: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      archivado: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    };
    return colors[status] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Expedientes</h1>
            <p className="text-slate-400 mt-1">
              {cases.length} expediente{cases.length !== 1 ? 's' : ''} encontrado{cases.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            to="/expedientes/nuevo"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium rounded-lg transition-colors"
          >
            + Nuevo expediente
          </Link>
        </div>

        {/* Filtros */}
        <form onSubmit={handleSearch} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Buscar</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Referencia o título..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Categoría</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Todas</option>
                <option value="administrativo">Administrativo</option>
                <option value="juridico">Jurídico</option>
                <option value="prl">PRL</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Estado</label>
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Todos</option>
                <option value="abierto">Abierto</option>
                <option value="en_curso">En curso</option>
                <option value="cerrado">Cerrado</option>
                <option value="archivado">Archivado</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
              >
                Buscar
              </button>
            </div>
          </div>
        </form>

        {/* Lista de expedientes */}
        {loading ? (
          <div className="text-slate-400 py-8 text-center">Cargando expedientes...</div>
        ) : cases.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
            <div className="text-4xl mb-4">📁</div>
            <p className="text-slate-400 text-lg">No hay expedientes todavía</p>
            <Link
              to="/expedientes/nuevo"
              className="mt-4 inline-block px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium rounded-lg transition-colors"
            >
              Crear primer expediente
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {cases.map((caseItem) => (
              <Link
                key={caseItem.id}
                to={`/expedientes/${caseItem.id}`}
                className="block bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-amber-500/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-amber-400 font-mono text-sm">{caseItem.referencia}</span>
                      <span className={`px-2 py-0.5 rounded text-xs border ${statusColor(caseItem.estado)}`}>
                        {statusLabel(caseItem.estado)}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-lg">{caseItem.titulo}</h3>
                    <p className="text-slate-400 text-sm mt-1 line-clamp-2">{caseItem.descripcion}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-slate-500 text-xs">
                        {categoryLabel(caseItem.categoria)}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {new Date(caseItem.created_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
