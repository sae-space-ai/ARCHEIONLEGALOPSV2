// Aplicación principal ARCHEION LEGAL OPS — MODO PÚBLICO

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { CasesPage } from './pages/CasesPage';
import { CaseDetailPage } from './pages/CaseDetailPage';
import { NewCasePage } from './pages/NewCasePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Todas las rutas son públicas */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/expedientes" element={<CasesPage />} />
        <Route path="/expedientes/nuevo" element={<NewCasePage />} />
        <Route path="/expedientes/:id" element={<CaseDetailPage />} />

        {/* Redirecciones */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
