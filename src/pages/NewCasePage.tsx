// Página de creación de nuevo expediente

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { casesApi } from '../api/client';

export function NewCasePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    referencia: '',
    titulo: '',
    descripcion: '',
    categoria: 'administrativo',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await casesApi.create(form);
      if (result.data) {
        navigate(`/expedientes/${result.data.id}`);
      } else {
        setError(result.error || 'Error al crear el expediente');
      }
    } catch (err) {
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Nuevo expediente</h1>
          <p className="text-slate-400 mt-1">Crear un nuevo expediente administrativo, jurídico o PRL</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-6">
          <div>
            <label htmlFor="referencia" className="block text-sm font-medium text-slate-300 mb-2">
              Referencia única
            </label>
            <input
              id="referencia"
              type="text"
              required
              value={form.referencia}
              onChange={(e) => setForm({ ...form, referencia: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="EXP-2026-001"
            />
            <p className="text-xs text-slate-500 mt-1">Identificador único del expediente</p>
          </div>

          <div>
            <label htmlFor="titulo" className="block text-sm font-medium text-slate-300 mb-2">
              Título
            </label>
            <input
              id="titulo"
              type="text"
              required
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Título descriptivo del expediente"
            />
          </div>

          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-slate-300 mb-2">
              Categoría
            </label>
            <select
              id="categoria"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="administrativo">Administrativo</option>
              <option value="juridico">Jurídico</option>
              <option value="prl">Prevención de Riesgos Laborales</option>
            </select>
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-slate-300 mb-2">
              Descripción
            </label>
            <textarea
              id="descripcion"
              required
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows={5}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Descripción detallada del expediente..."
            />
          </div>

          {error && (
            <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear expediente'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/expedientes')}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
