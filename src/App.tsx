import { useState } from 'react';
import { 
  auditFindings, 
  fileFixes, 
  deploymentSteps, 
  envChecklist, 
  deliveryReport 
} from './data/auditData';

type Tab = 'dashboard' | 'findings' | 'files' | 'deployment' | 'env' | 'report';

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    'VERIFICADO': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'CORREGIDO_SIN_VERIFICAR': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'CORREGIDO SIN VERIFICAR': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'BLOQUEADO': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status] || 'bg-slate-500/20 text-slate-300 border-slate-500/30'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    'critical': 'bg-red-500/20 text-red-300 border-red-500/30',
    'high': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    'medium': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    'low': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  };
  
  const labels: Record<string, string> = {
    'critical': 'Crítico',
    'high': 'Alto',
    'medium': 'Medio',
    'low': 'Bajo',
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[severity] || ''}`}>
      {labels[severity] || severity}
    </span>
  );
}

function Dashboard() {
  const verified = auditFindings.filter(f => f.status === 'VERIFICADO').length;
  const fixed = auditFindings.filter(f => f.status === 'CORREGIDO_SIN_VERIFICAR').length;
  const blocked = auditFindings.filter(f => f.status === 'BLOQUEADO').length;
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl">
            ⚖️
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">ARCHEION LEGAL OPS</h1>
            <p className="text-slate-400">Panel de Auditoría y Corrección Integral</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Repositorio</p>
            <p className="text-white font-mono text-sm mt-1">pergolessi9-star/archeion-legal-ops</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Despliegue</p>
            <p className="text-white font-mono text-sm mt-1">archeion-legal-ops.vercel.app</p>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-400 text-sm">Supabase</p>
            <p className="text-white font-mono text-sm mt-1">manuel-gago-web</p>
          </div>
        </div>
      </div>

      {/* Status overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-400">{verified}</p>
              <p className="text-slate-400 text-sm">Verificados</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-xl p-6 border border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-400">{fixed}</p>
              <p className="text-slate-400 text-sm">Corregidos sin verificar</p>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-400">{blocked}</p>
              <p className="text-slate-400 text-sm">Bloqueados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live status */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Estado en vivo de la aplicación</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot"></div>
              <span className="text-slate-300">Página pública (/)</span>
            </div>
            <span className="text-emerald-400 text-sm font-medium">Operativa</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot"></div>
              <span className="text-slate-300">Página de login (/login)</span>
            </div>
            <span className="text-emerald-400 text-sm font-medium">Operativa</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot"></div>
              <span className="text-slate-300">Middleware (protección rutas)</span>
            </div>
            <span className="text-emerald-400 text-sm font-medium">Funcionando</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-dot"></div>
              <span className="text-slate-300">Envío de magic link</span>
            </div>
            <span className="text-amber-400 text-sm font-medium">Requiere verificación</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse-dot"></div>
              <span className="text-slate-300">Callback de autenticación</span>
            </div>
            <span className="text-amber-400 text-sm font-medium">Requiere verificación</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse-dot"></div>
              <span className="text-slate-300">Acceso a expedientes</span>
            </div>
            <span className="text-purple-400 text-sm font-medium">Bloqueado (depende de auth)</span>
          </div>
        </div>
      </div>

      {/* Alert */}
      <div className="bg-purple-500/10 rounded-xl p-6 border border-purple-500/30">
        <div className="flex gap-3">
          <svg className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-purple-300 font-semibold">Intervención del propietario requerida</h4>
            <p className="text-purple-200/70 text-sm mt-1">
              El repositorio es privado y las variables de entorno no son accesibles desde este entorno. 
              Se requiere acceso al dashboard de Vercel y Supabase para completar la verificación.
              Los archivos corregidos y las instrucciones están disponibles en las pestañas correspondientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Findings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Hallazgos de la Auditoría</h2>
        <span className="text-slate-400 text-sm">{auditFindings.length} hallazgos</span>
      </div>
      
      <div className="space-y-4">
        {auditFindings.map((finding) => (
          <div key={finding.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-slate-500 font-mono text-xs">{finding.id}</span>
                  <SeverityBadge severity={finding.severity} />
                  <StatusBadge status={finding.status} />
                </div>
                <h3 className="text-white font-semibold text-lg">{finding.title}</h3>
                <p className="text-slate-400 mt-2 text-sm leading-relaxed">{finding.description}</p>
                
                <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Evidencia</p>
                  <p className="text-slate-300 text-sm">{finding.evidence}</p>
                </div>
                
                {finding.fix && (
                  <div className="mt-3 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                    <p className="text-xs text-emerald-500 uppercase tracking-wide mb-1">Acción requerida</p>
                    <p className="text-emerald-200 text-sm">{finding.fix}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={handleCopy}
          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 transition-colors"
        >
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className="code-block bg-slate-950 rounded-lg p-4 overflow-x-auto border border-slate-700 text-slate-300">
        <code>{code}</code>
      </pre>
      <div className="absolute bottom-2 left-3">
        <span className="text-xs text-slate-600">{language}</span>
      </div>
    </div>
  );
}

function Files() {
  const [activeFile, setActiveFile] = useState(0);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Archivos Corregidos</h2>
        <span className="text-slate-400 text-sm">{fileFixes.length} archivos</span>
      </div>
      
      <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
        <p className="text-amber-200 text-sm">
          <strong>Instrucciones:</strong> Copia cada archivo y reemplaza su contenido en el repositorio. 
          Los archivos están organizados por orden de prioridad. Después de aplicar todos, ejecuta <code className="bg-slate-800 px-1 rounded">npm install && npm run build</code>.
        </p>
      </div>

      {/* File tabs */}
      <div className="flex flex-wrap gap-2">
        {fileFixes.map((file, idx) => (
          <button
            key={file.path}
            onClick={() => setActiveFile(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              idx === activeFile 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
            }`}
          >
            {file.path.split('/').pop()}
          </button>
        ))}
      </div>

      {/* Active file */}
      <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <code className="text-amber-300 font-mono text-sm">{fileFixes[activeFile].path}</code>
          </div>
          <p className="text-slate-400 text-sm mt-2">{fileFixes[activeFile].description}</p>
        </div>
        <div className="p-4">
          <CodeBlock code={fileFixes[activeFile].code} language={fileFixes[activeFile].language} />
        </div>
      </div>
    </div>
  );
}

function Deployment() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Plan de Despliegue</h2>
        <span className="text-slate-400 text-sm">{deploymentSteps.length} pasos</span>
      </div>
      
      <div className="space-y-4">
        {deploymentSteps.map((step) => (
          <div key={step.step} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-start gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                step.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' :
                step.status === 'blocked' ? 'bg-purple-500/20 text-purple-400' :
                'bg-slate-700 text-slate-400'
              }`}>
                {step.step}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{step.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{step.description}</p>
                {step.command && (
                  <div className="mt-3">
                    <code className="inline-block px-3 py-1.5 bg-slate-950 rounded-lg text-emerald-300 text-sm font-mono border border-slate-700">
                      $ {step.command}
                    </code>
                  </div>
                )}
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                step.status === 'done' ? 'bg-emerald-500/20 text-emerald-300' :
                step.status === 'blocked' ? 'bg-purple-500/20 text-purple-300' :
                'bg-slate-700 text-slate-400'
              }`}>
                {step.status === 'done' ? '✓ Hecho' : step.status === 'blocked' ? '⊘ Bloqueado' : '○ Pendiente'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick commands */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Comandos rápidos de verificación</h3>
        <div className="space-y-3">
          <div>
            <p className="text-slate-400 text-xs mb-1">Verificar que @supabase/ssr está instalado:</p>
            <code className="block px-3 py-2 bg-slate-950 rounded-lg text-emerald-300 text-sm font-mono border border-slate-700">
              npm ls @supabase/ssr
            </code>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">TypeScript check:</p>
            <code className="block px-3 py-2 bg-slate-950 rounded-lg text-emerald-300 text-sm font-mono border border-slate-700">
              npx tsc --noEmit
            </code>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Build de producción:</p>
            <code className="block px-3 py-2 bg-slate-950 rounded-lg text-emerald-300 text-sm font-mono border border-slate-700">
              npm run build
            </code>
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">Verificar variables de entorno:</p>
            <code className="block px-3 py-2 bg-slate-950 rounded-lg text-emerald-300 text-sm font-mono border border-slate-700">
              npx env-cmd -- echo $NEXT_PUBLIC_SUPABASE_URL
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

function Environment() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Variables de Entorno</h2>
      </div>
      
      <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
        <p className="text-red-200 text-sm">
          <strong>⚠️ IMPORTANTE:</strong> Nunca incluyas service_role key en variables de entorno públicas. 
          La clave anon es pública y segura para el navegador. Las políticas RLS controlan el acceso.
        </p>
      </div>

      <div className="space-y-4">
        {envChecklist.map((env) => (
          <div key={env.name} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <code className="text-amber-300 font-mono font-bold">{env.name}</code>
              {env.required && (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded text-xs border border-red-500/30">
                  Obligatorio
                </span>
              )}
              <span className={`px-2 py-0.5 rounded text-xs border ${
                env.scope === 'public' 
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                  : 'bg-slate-700 text-slate-300 border-slate-600'
              }`}>
                {env.scope === 'public' ? 'Pública (NEXT_PUBLIC_)' : 'Privada'}
              </span>
            </div>
            
            <p className="text-slate-400 text-sm mb-3">{env.description}</p>
            
            <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Formato esperado:</p>
              <code className="text-emerald-300 text-sm font-mono">{env.value}</code>
            </div>
            
            <div className="mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-xs text-slate-500 mb-1">Configurar en:</p>
              <p className="text-slate-300 text-sm">{env.location}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Supabase config */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Configuración de Supabase</h3>
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">URLs de retorno autorizadas</p>
            <p className="text-slate-300 text-sm mb-2">En Supabase Dashboard → Authentication → URL Configuration:</p>
            <ul className="space-y-1 text-sm">
              <li className="text-emerald-300 font-mono">https://archeion-legal-ops.vercel.app/auth/callback</li>
              <li className="text-slate-400 font-mono">http://localhost:3000/auth/callback (desarrollo)</li>
            </ul>
          </div>
          
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Configuración de correo</p>
            <p className="text-slate-300 text-sm mb-2">Verificar en Authentication → Email Templates → Magic Link:</p>
            <ul className="space-y-1 text-sm text-slate-400">
              <li>• Confirmar que la plantilla usa el token correcto: {"{{ .ConfirmationURL }}"}</li>
              <li>• Límite del plan gratuito: 3 correos/hora para magic links</li>
              <li>• Si se excede, configurar SMTP personalizado en Authentication → Providers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Report() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Contrato de Entrega</h2>
      </div>
      
      {/* Project info */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Información del Proyecto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <p className="text-xs text-slate-500">Proyecto</p>
            <p className="text-white font-medium">{deliveryReport.project}</p>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <p className="text-xs text-slate-500">Repositorio</p>
            <p className="text-white font-mono text-sm">{deliveryReport.repo}</p>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <p className="text-xs text-slate-500">URL Desplegada</p>
            <p className="text-white font-mono text-sm">{deliveryReport.deployedUrl}</p>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <p className="text-xs text-slate-500">Proyecto Supabase</p>
            <p className="text-white font-mono text-sm">{deliveryReport.supabaseProject}</p>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <p className="text-xs text-slate-500">Usuario Autorizado</p>
            <p className="text-white font-mono text-sm">{deliveryReport.authorizedUser}</p>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <p className="text-xs text-slate-500">Stack</p>
            <p className="text-white text-sm">{deliveryReport.stack}</p>
          </div>
        </div>
      </div>

      {/* Delivery items */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Resultados de la Auditoría</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">#</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Elemento</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Estado</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {deliveryReport.findings.map((item) => (
                <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-3 px-4 text-slate-500">{item.id}</td>
                  <td className="py-3 px-4 text-white">{item.item}</td>
                  <td className="py-3 px-4"><StatusBadge status={item.result} /></td>
                  <td className="py-3 px-4 text-slate-400 max-w-md">{item.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blockers */}
      <div className="bg-purple-500/10 rounded-xl p-6 border border-purple-500/30">
        <h3 className="text-lg font-semibold text-purple-300 mb-4">⊘ Bloqueos que requieren intervención del propietario</h3>
        <div className="space-y-3">
          {deliveryReport.blockers.map((blocker, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900/30 rounded-lg">
              <span className="text-purple-400 font-bold text-sm">{idx + 1}.</span>
              <p className="text-purple-200 text-sm">{blocker}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions for owner */}
      <div className="bg-emerald-500/10 rounded-xl p-6 border border-emerald-500/30">
        <h3 className="text-lg font-semibold text-emerald-300 mb-4">✓ Instrucciones para el propietario</h3>
        <div className="space-y-4 text-sm text-emerald-200">
          <div className="p-4 bg-slate-900/30 rounded-lg">
            <p className="font-semibold text-emerald-300 mb-2">Paso 1: Corregir variables de entorno en Vercel</p>
            <p>Ir a Vercel Dashboard → Project Settings → Environment Variables y configurar:</p>
            <ul className="mt-2 space-y-1 text-slate-300">
              <li>• <code className="bg-slate-800 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> = URL completa del proyecto Supabase</li>
              <li>• <code className="bg-slate-800 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> = Clave anon pública</li>
            </ul>
          </div>
          
          <div className="p-4 bg-slate-900/30 rounded-lg">
            <p className="font-semibold text-emerald-300 mb-2">Paso 2: Configurar URLs de retorno en Supabase</p>
            <p>Ir a Supabase Dashboard → Authentication → URL Configuration → Redirect URLs y añadir:</p>
            <ul className="mt-2 space-y-1 text-slate-300">
              <li>• <code className="bg-slate-800 px-1 rounded">https://archeion-legal-ops.vercel.app/auth/callback</code></li>
            </ul>
          </div>
          
          <div className="p-4 bg-slate-900/30 rounded-lg">
            <p className="font-semibold text-emerald-300 mb-2">Paso 3: Aplicar los archivos corregidos</p>
            <p>Usar el contenido de la pestaña "Archivos" para reemplazar los archivos en el repositorio. Luego:</p>
            <code className="block mt-2 px-3 py-2 bg-slate-950 rounded text-emerald-300 font-mono">
              git add -A && git commit -m "fix: corregir autenticación y compatibilidad Next.js 15" && git push origin main
            </code>
          </div>
          
          <div className="p-4 bg-slate-900/30 rounded-lg">
            <p className="font-semibold text-emerald-300 mb-2">Paso 4: Verificar el flujo completo</p>
            <ol className="mt-2 space-y-1 text-slate-300 list-decimal list-inside">
              <li>Acceder a https://archeion-legal-ops.vercel.app/login</li>
              <li>Introducir el email y enviar el enlace</li>
              <li>Abrir el enlace del correo</li>
              <li>Verificar que redirige a /expedientes</li>
              <li>Recargar la página y verificar que la sesión persiste</li>
              <li>Verificar que se pueden ver los expedientes</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Final declaration */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-3">Declaración final</h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          No se afirma que el sistema funciona completamente porque no se ha podido comprobar el recorrido 
          completo desde el envío del correo hasta el acceso a un expediente. La causa raíz del fallo original 
          (variable de entorno incorrecta) ha sido identificada y documentada. Los archivos corregidos están 
          disponibles para su aplicación. La verificación final requiere intervención del propietario con 
          acceso a los dashboards de Vercel y Supabase.
        </p>
        <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
          <p className="text-slate-500 text-xs">
            Auditoría realizada el {new Date().toLocaleDateString('es-ES', { 
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'findings', label: 'Hallazgos', icon: '🔍' },
    { id: 'files', label: 'Archivos', icon: '📄' },
    { id: 'deployment', label: 'Despliegue', icon: '🚀' },
    { id: 'env', label: 'Entorno', icon: '⚙️' },
    { id: 'report', label: 'Entrega', icon: '📋' },
  ];
  
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚖️</span>
              <div>
                <h1 className="text-white font-bold text-sm sm:text-base">ARCHEION LEGAL OPS</h1>
                <p className="text-slate-500 text-xs hidden sm:block">Panel de Auditoría y Corrección</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-xs font-medium border border-amber-500/30">
                AUDITORÍA ACTIVA
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="sticky top-16 z-40 bg-slate-800/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'findings' && <Findings />}
        {activeTab === 'files' && <Files />}
        {activeTab === 'deployment' && <Deployment />}
        {activeTab === 'env' && <Environment />}
        {activeTab === 'report' && <Report />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-slate-500 text-sm">
            ARCHEION LEGAL OPS — Auditoría de seguridad y funcionalidad
          </p>
          <p className="text-slate-600 text-xs mt-1">
            Stack: Next.js 15 · React 19 · TypeScript · Supabase Auth · PostgreSQL · RLS · Vercel
          </p>
        </div>
      </footer>
    </div>
  );
}
