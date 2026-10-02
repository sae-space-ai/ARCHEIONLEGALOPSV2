// Panel principal (Dashboard)

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { casesApi } from '../api/client';
import type { Case } from '../types';

export function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    abiertos: 0,
    enCurso: 0,
    cerrados: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: cases } = await casesApi.list();
      if (cases) {
        setStats({
          total: cases.length,
          abiertos: cases.filter(c => c.estado === 'abierto').length,
          enCurso: cases.filter(c => c.estado === 'en_curso').length,
          cerrados: cases.filter(c => c.estado === 'cerrado' || c.estado === 'archivado').length,
        });
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Panel de Control</h1>
          <p className="text-slate-400 mt-1">Resumen de expedientes y actuaciones</p>
        </div>

        {loading ? (
          <div className="text-slate-400">Cargando estadísticas...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <p className="text-slate-400 text-sm">Total expedientes</p>
              <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-emerald-500/20">
              <p className="text-emerald-400 text-sm">Abiertos</p>
              <p className="text-3xl font-bold text-emerald-300 mt-2">{stats.abiertos}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-amber-500/20">
              <p className="text-amber-400 text-sm">En curso</p>
              <p className="text-3xl font-bold text-amber-300 mt-2">{stats.enCurso}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-500/20">
              <p className="text-slate-400 text-sm">Cerrados</p>
              <p className="text-3xl font-bold text-slate-300 mt-2">{stats.cerrados}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/expedientes"
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-amber-500/50 transition-colors"
          >
            <div className="text-3xl mb-3">📁</div>
            <h3 className="text-white font-semibold text-lg">Ver expedientes</h3>
            <p className="text-slate-400 text-sm mt-1">
              Lista completa de expedientes administrativos, jurídicos y PRL
            </p>
          </Link>

          <Link
            to="/expedientes/nuevo"
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-amber-500/50 transition-colors"
          >
            <div className="text-3xl mb-3">➕</div>
            <h3 className="text-white font-semibold text-lg">Nuevo expediente</h3>
            <p className="text-slate-400 text-sm mt-1">
              Crear un nuevo expediente con referencia, categoría y descripción
            </p>
          </Link>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-white font-semibold text-lg">Seguridad</h3>
            <p className="text-slate-400 text-sm mt-1">
              Acceso privado con sesión segura. Expedientes protegidos por RLS.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
