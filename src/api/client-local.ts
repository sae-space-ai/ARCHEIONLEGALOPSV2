// Cliente API para ARCHEION LEGAL OPS — MODO PÚBLICO CON ALMACENAMIENTO LOCAL

import type { Case, CaseEvent, ApiResponse } from '../types';

// Almacenamiento local para modo sin base de datos
const STORAGE_KEY = 'archeion_cases';
const EVENTS_KEY = 'archeion_events';

// Funciones helper para localStorage
function getCasesFromStorage(): Case[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveCasesToStorage(cases: Case[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

function getEventsFromStorage(): CaseEvent[] {
  const data = localStorage.getItem(EVENTS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveEventsToStorage(events: CaseEvent[]): void {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

// Generar UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Expedientes (acceso público con almacenamiento local)
export const casesApi = {
  list: async (filters?: { categoria?: string; estado?: string; search?: string }): Promise<ApiResponse<Case[]>> => {
    try {
      let cases = getCasesFromStorage();
      
      // Aplicar filtros
      if (filters?.categoria) {
        cases = cases.filter(c => c.categoria === filters.categoria);
      }
      if (filters?.estado) {
        cases = cases.filter(c => c.estado === filters.estado);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        cases = cases.filter(c => 
          c.referencia.toLowerCase().includes(searchLower) ||
          c.titulo.toLowerCase().includes(searchLower) ||
          c.descripcion.toLowerCase().includes(searchLower)
        );
      }
      
      // Ordenar por fecha de creación (más reciente primero)
      cases.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return { success: true, data: cases };
    } catch (error) {
      console.error('Error al listar expedientes:', error);
      return { success: false, error: 'Error al cargar expedientes' };
    }
  },
  
  get: async (id: string): Promise<ApiResponse<Case>> => {
    try {
      const cases = getCasesFromStorage();
      const caseData = cases.find(c => c.id === id);
      
      if (!caseData) {
        return { success: false, error: 'Expediente no encontrado' };
      }
      
      return { success: true, data: caseData };
    } catch (error) {
      console.error('Error al obtener expediente:', error);
      return { success: false, error: 'Error al cargar expediente' };
    }
  },
  
  create: async (data: { 
    referencia: string; 
    titulo: string; 
    descripcion: string; 
    categoria: string; 
  }): Promise<ApiResponse<Case>> => {
    try {
      const cases = getCasesFromStorage();
      
      // Verificar que la referencia es única
      if (cases.some(c => c.referencia === data.referencia)) {
        return { success: false, error: 'Ya existe un expediente con esa referencia' };
      }
      
      // Crear nuevo expediente
      const newCase: Case = {
        id: generateUUID(),
        user_id: '00000000-0000-0000-0000-000000000000',
        referencia: data.referencia,
        titulo: data.titulo,
        descripcion: data.descripcion,
        categoria: data.categoria as any,
        estado: 'abierto',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      cases.push(newCase);
      saveCasesToStorage(cases);
      
      return { success: true, data: newCase };
    } catch (error) {
      console.error('Error al crear expediente:', error);
      return { success: false, error: 'Error al crear expediente' };
    }
  },
};

// Actuaciones (acceso público con almacenamiento local)
export const eventsApi = {
  list: async (caseId: string): Promise<ApiResponse<CaseEvent[]>> => {
    try {
      const events = getEventsFromStorage();
      const caseEvents = events
        .filter(e => e.case_id === caseId)
        .sort((a, b) => new Date(b.fecha_actuacion).getTime() - new Date(a.fecha_actuacion).getTime());
      
      return { success: true, data: caseEvents };
    } catch (error) {
      console.error('Error al listar actuaciones:', error);
      return { success: false, error: 'Error al cargar actuaciones' };
    }
  },
  
  create: async (caseId: string, data: { 
    fecha_actuacion: string; 
    tipo: string; 
    descripcion: string; 
  }): Promise<ApiResponse<CaseEvent>> => {
    try {
      const events = getEventsFromStorage();
      
      // Verificar que el expediente existe
      const cases = getCasesFromStorage();
      const caseExists = cases.some(c => c.id === caseId);
      
      if (!caseExists) {
        return { success: false, error: 'Expediente no encontrado' };
      }
      
      // Crear nueva actuación
      const newEvent: CaseEvent = {
        id: generateUUID(),
        case_id: caseId,
        user_id: '00000000-0000-0000-0000-000000000000',
        fecha_actuacion: data.fecha_actuacion,
        tipo: data.tipo as any,
        descripcion: data.descripcion,
        created_at: new Date().toISOString(),
      };
      
      events.push(newEvent);
      saveEventsToStorage(events);
      
      return { success: true, data: newEvent };
    } catch (error) {
      console.error('Error al crear actuación:', error);
      return { success: false, error: 'Error al crear actuación' };
    }
  },
};
