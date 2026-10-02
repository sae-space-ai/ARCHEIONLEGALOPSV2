// Validación de datos con Zod

import { z } from 'zod';

// Esquema de login
export const loginSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(128),
});

// Esquema de creación de expediente
export const createCaseSchema = z.object({
  referencia: z.string().min(1, 'Referencia obligatoria').max(100),
  titulo: z.string().min(1, 'Título obligatorio').max(255),
  descripcion: z.string().min(1, 'Descripción obligatoria').max(10000),
  categoria: z.enum(['administrativo', 'juridico', 'prl']),
});

// Esquema de creación de actuación
export const createEventSchema = z.object({
  fecha_actuacion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  tipo: z.enum(['hecho', 'registro', 'comunicacion', 'plazo', 'fundamento', 'peticion', 'prl']),
  descripcion: z.string().min(1, 'Descripción obligatoria').max(10000),
});

// Tipos inferidos
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;

// Función helper para validar
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.issues[0];
  return { success: false, error: firstError?.message || 'Datos inválidos' };
}
