// Librería de exportación de expedientes en formato ZIP
// Genera paquetes descargables con documentos, cronología y manifiesto

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Case, CaseEvent, Document, AuditEvent } from '../types';
import { DOCUMENT_TYPE_LABELS, CONFIDENTIALITY_LABELS } from '../types';

interface ExportData {
  caseData: Case;
  events: CaseEvent[];
  documents: Document[];
  auditLog: AuditEvent[];
  fileBlobs: Map<string, Blob>; // storageKey -> Blob
}

/**
 * Genera el índice documental en formato texto
 */
function generateDocumentIndex(data: ExportData): string {
  const { caseData, documents } = data;
  
  let index = `═══════════════════════════════════════════════════════════\n`;
  index += `ÍNDICE DOCUMENTAL\n`;
  index += `═══════════════════════════════════════════════════════════\n\n`;
  index += `Expediente: ${caseData.referencia}\n`;
  index += `Título: ${caseData.titulo}\n`;
  index += `Categoría: ${caseData.categoria}\n`;
  index += `Estado: ${caseData.estado}\n`;
  index += `Fecha de exportación: ${new Date().toLocaleString('es-ES')}\n\n`;
  index += `Total de documentos: ${documents.length}\n\n`;
  index += `───────────────────────────────────────────────────────────\n`;
  index += `LISTADO DE DOCUMENTOS\n`;
  index += `───────────────────────────────────────────────────────────\n\n`;
  
  documents.forEach((doc, idx) => {
    index += `${idx + 1}. ${doc.title}\n`;
    index += `   Tipo: ${DOCUMENT_TYPE_LABELS[doc.document_type]}\n`;
    index += `   Archivo: ${doc.original_filename}\n`;
    index += `   Fecha del documento: ${new Date(doc.document_date).toLocaleDateString('es-ES')}\n`;
    index += `   Incorporado: ${new Date(doc.uploaded_at).toLocaleString('es-ES')}\n`;
    index += `   Confidencialidad: ${CONFIDENTIALITY_LABELS[doc.confidentiality_level]}\n`;
    index += `   SHA-256: ${doc.sha256}\n`;
    index += `   Versión: ${doc.current_version}\n\n`;
  });
  
  return index;
}

/**
 * Genera la cronología de actuaciones en formato texto
 */
function generateTimeline(data: ExportData): string {
  const { caseData, events } = data;
  
  let timeline = `═══════════════════════════════════════════════════════════\n`;
  timeline += `CRONOLOGÍA DE ACTUACIONES\n`;
  timeline += `═══════════════════════════════════════════════════════════\n\n`;
  timeline += `Expediente: ${caseData.referencia}\n`;
  timeline += `Total de actuaciones: ${events.length}\n\n`;
  timeline += `───────────────────────────────────────────────────────────\n\n`;
  
  events.forEach((event, idx) => {
    timeline += `[${idx + 1}] ${new Date(event.fecha_actuacion).toLocaleDateString('es-ES')} - ${event.tipo.toUpperCase()}\n`;
    timeline += `${event.descripcion}\n`;
    timeline += `Registrado: ${new Date(event.created_at).toLocaleString('es-ES')}\n\n`;
  });
  
  return timeline;
}

/**
 * Genera el manifiesto de integridad con hashes SHA-256
 */
function generateManifest(data: ExportData): string {
  const { caseData, documents } = data;
  
  let manifest = `═══════════════════════════════════════════════════════════\n`;
  manifest += `MANIFIESTO DE INTEGRIDAD\n`;
  manifest += `═══════════════════════════════════════════════════════════\n\n`;
  manifest += `Expediente: ${caseData.referencia}\n`;
  manifest += `Fecha de exportación: ${new Date().toISOString()}\n`;
  manifest += `Herramienta: ARCHEION LEGAL OPS V3.0\n\n`;
  manifest += `───────────────────────────────────────────────────────────\n`;
  manifest += `HUELLAS DIGITALES SHA-256\n`;
  manifest += `───────────────────────────────────────────────────────────\n\n`;
  manifest += `NOTA: Las huellas digitales permiten verificar la integridad\n`;
  manifest += `de los archivos, pero no constituyen firma electrónica\n`;
  manifest += `cualificada ni garantía automática de autenticidad jurídica.\n\n`;
  
  documents.forEach((doc) => {
    manifest += `Archivo: ${doc.original_filename}\n`;
    manifest += `Documento: ${doc.title}\n`;
    manifest += `SHA-256: ${doc.sha256}\n`;
    manifest += `Tamaño: ${doc.file_size} bytes\n`;
    manifest += `Versión: ${doc.current_version}\n\n`;
  });
  
  // Hash del manifiesto completo (se calculará después)
  manifest += `───────────────────────────────────────────────────────────\n`;
  manifest += `VERIFICACIÓN\n`;
  manifest += `───────────────────────────────────────────────────────────\n\n`;
  manifest += `Para verificar la integridad de un archivo:\n`;
  manifest += `sha256sum <archivo> | grep <hash_esperado>\n\n`;
  
  return manifest;
}

/**
 * Genera la ficha del expediente en formato texto
 */
function generateCaseSheet(data: ExportData): string {
  const { caseData } = data;
  
  let sheet = `═══════════════════════════════════════════════════════════\n`;
  sheet += `FICHA DEL EXPEDIENTE\n`;
  sheet += `═══════════════════════════════════════════════════════════\n\n`;
  sheet += `Referencia: ${caseData.referencia}\n`;
  sheet += `Título: ${caseData.titulo}\n`;
  sheet += `Categoría: ${caseData.categoria}\n`;
  sheet += `Estado: ${caseData.estado}\n`;
  sheet += `Creado: ${new Date(caseData.created_at).toLocaleString('es-ES')}\n`;
  sheet += `Actualizado: ${new Date(caseData.updated_at).toLocaleString('es-ES')}\n\n`;
  sheet += `───────────────────────────────────────────────────────────\n`;
  sheet += `DESCRIPCIÓN\n`;
  sheet += `───────────────────────────────────────────────────────────\n\n`;
  sheet += `${caseData.descripcion}\n\n`;
  
  return sheet;
}

/**
 * Exporta un expediente completo en formato ZIP
 * @param data - Datos del expediente a exportar
 * @param filename - Nombre del archivo ZIP (sin extensión)
 */
export async function exportCaseAsZip(data: ExportData, filename?: string): Promise<void> {
  const zip = new JSZip();
  
  const folderName = data.caseData.referencia.replace(/[^a-zA-Z0-9-_]/g, '_');
  const folder = zip.folder(folderName);
  
  if (!folder) {
    throw new Error('No se pudo crear la carpeta del expediente');
  }
  
  // 1. Ficha del expediente
  folder.file('01_FICHA_EXPEDIENTE.txt', generateCaseSheet(data));
  
  // 2. Índice documental
  folder.file('02_INDICE_DOCUMENTAL.txt', generateDocumentIndex(data));
  
  // 3. Cronología
  folder.file('03_CRONOLOGIA.txt', generateTimeline(data));
  
  // 4. Carpeta de documentos
  const docsFolder = folder.folder('DOCUMENTOS');
  if (docsFolder) {
    for (const doc of data.documents) {
      const blob = data.fileBlobs.get(doc.storage_key);
      if (blob) {
        // Añadir extensión si no la tiene
        const ext = doc.original_filename.split('.').pop();
        const safeName = `${doc.document_type}_${doc.title.replace(/[^a-zA-Z0-9-_]/g, '_')}.${ext}`;
        docsFolder.file(safeName, blob);
      }
    }
  }
  
  // 5. Manifiesto de integridad (se genera al final con hash)
  const manifestContent = generateManifest(data);
  folder.file('05_MANIFIESTO_INTEGRIDAD.txt', manifestContent);
  
  // 6. README con instrucciones
  const readme = [
    `═══════════════════════════════════════════════════════════`,
    `EXPEDIENTE EXPORTADO`,
    `═══════════════════════════════════════════════════════════`,
    ``,
    `Este paquete fue generado por ARCHEION LEGAL OPS V3.0`,
    `Fecha: ${new Date().toISOString()}`,
    ``,
    `CONTENIDO:`,
    `- 01_FICHA_EXPEDIENTE.txt: Datos generales del expediente`,
    `- 02_INDICE_DOCUMENTAL.txt: Listado de documentos con metadatos`,
    `- 03_CRONOLOGIA.txt: Actuaciones registradas`,
    `- DOCUMENTOS/: Archivos originales`,
    `- 05_MANIFIESTO_INTEGRIDAD.txt: Huellas SHA-256`,
    ``,
    `NOTA LEGAL:`,
    `Esta exportación no constituye un expediente administrativo`,
    `electrónico formalmente conformado. Las huellas SHA-256 permiten`,
    `verificar la integridad de los archivos pero no son firma`,
    `electrónica cualificada.`,
  ].join('\n');
  folder.file('00_LEEME.txt', readme);
  
  // Generar el ZIP
  const content = await zip.generateAsync({ 
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });
  
  // Descargar
  const exportFilename = filename || `expediente_${data.caseData.referencia}_${Date.now()}`;
  saveAs(content, `${exportFilename}.zip`);
}

/**
 * Exporta solo el manifiesto de integridad como archivo de texto
 */
export async function exportManifestOnly(data: ExportData): Promise<void> {
  const manifest = generateManifest(data);
  const blob = new Blob([manifest], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, `manifiesto_${data.caseData.referencia}.txt`);
}
