// Tipos para las API routes de Vercel

import type { IncomingMessage, ServerResponse } from 'http';

export interface NextApiRequest extends IncomingMessage {
  body?: any;
  query: { [key: string]: string | string[] };
  cookies: { [key: string]: string };
  headers: { [key: string]: string | string[] | undefined };
}

export interface NextApiResponse extends Omit<ServerResponse, 'status' | 'json'> {
  status: (code: number) => NextApiResponse;
  json: (body: any) => void;
  setHeader: (name: string, value: string | string[]) => this;
  end: (body?: any) => this;
}

// Helper para crear respuesta JSON
export function sendJson(res: NextApiResponse, status: number, data: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

// Helper para errores
export function sendError(res: NextApiResponse, status: number, message: string) {
  sendJson(res, status, { success: false, error: message });
}

// Helper para éxito
export function sendSuccess<T>(res: NextApiResponse, data: T, status: number = 200) {
  sendJson(res, status, { success: true, data });
}
