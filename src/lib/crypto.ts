// Librería de criptografía usando Web Crypto API (nativo del navegador)
// Calcula SHA-256 de archivos para trazabilidad documental

/**
 * Calcula el hash SHA-256 de un archivo o Blob
 * @param file - Archivo o Blob a procesar
 * @returns Promise con el hash SHA-256 en formato hexadecimal
 */
export async function calculateSHA256(file: Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Verifica la integridad de un archivo comparando su hash SHA-256
 * @param file - Archivo a verificar
 * @param expectedHash - Hash esperado
 * @returns true si el hash coincide, false en caso contrario
 */
export async function verifyIntegrity(file: Blob, expectedHash: string): Promise<boolean> {
  const actualHash = await calculateSHA256(file);
  return actualHash.toLowerCase() === expectedHash.toLowerCase();
}

/**
 * Genera un identificador único usando crypto.randomUUID()
 * @returns UUID v4
 */
export function generateUUID(): string {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback para navegadores antiguos
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Formatea un hash SHA-256 para visualización (truncado)
 * @param hash - Hash completo
 * @param length - Longitud a mostrar (default: 16)
 * @returns Hash truncado con ellipsis
 */
export function formatHash(hash: string, length: number = 16): string {
  if (hash.length <= length) return hash;
  return `${hash.substring(0, length)}...`;
}
