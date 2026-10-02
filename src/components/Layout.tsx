// Layout principal con header y navegación — MODO PRIVADO

import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚖️</span>
              <div>
                <h1 className="text-white font-bold text-lg">ARCHEION LEGAL OPS</h1>
                <p className="text-slate-400 text-xs">Gestión de expedientes (acceso libre)</p>
              </div>
            </div>

            <nav className="flex items-center gap-6">
              <Link to="/dashboard" className="text-slate-300 hover:text-white text-sm transition-colors">
                Panel
              </Link>
              <Link to="/expedientes" className="text-slate-300 hover:text-white text-sm transition-colors">
                Expedientes
              </Link>
              <Link to="/expedientes/nuevo" className="text-slate-300 hover:text-white text-sm transition-colors">
                Nuevo
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs rounded-full border border-amber-500/30">
                Modo público
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
