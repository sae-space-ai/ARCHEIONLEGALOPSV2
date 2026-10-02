// Layout principal con header y navegación

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚖️</span>
              <div>
                <h1 className="text-white font-bold text-lg">ARCHEION LEGAL OPS</h1>
                <p className="text-slate-400 text-xs">Gestión privada de expedientes</p>
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
              <span className="text-slate-400 text-sm">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
              >
                Cerrar sesión
              </button>
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
