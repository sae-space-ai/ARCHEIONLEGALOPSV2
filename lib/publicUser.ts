// Helper para obtener user_id público (modo sin autenticación)
// En modo público, todas las operaciones usan este user_id

export const PUBLIC_USER_ID = '00000000-0000-0000-0000-000000000000';

export function getPublicUserId(): string {
  return PUBLIC_USER_ID;
}
