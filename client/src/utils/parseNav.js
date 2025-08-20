// C:\BotAuto-Full\client\src\utils\parseNav.js
// Requiere tener instalados: papaparse y xlsx
// npm i papaparse xlsx

import Papa from 'papaparse';
import * as XLSX from 'xlsx';

/** Intenta parsear fechas comunes: DD/MM/YYYY, DD-MM-YYYY, DD/MM/YY, DDMMYY, etc. */
function parseDateFlexible(raw) {
  if (raw == null) return null;
  const s = String(raw).trim();

  // 1) Si viene como número Excel (fecha serial)
  if (typeof raw === 'number') {
    try {
      // XLSX.SSF.parse_date_code maneja números seriales Excel (1900-based)
      const d = XLSX.SSF.parse_date_code(raw);
      if (!d) return null;
      const date = new Date(d.y, d.m - 1, d.d);
      return Number.isNaN(date.getTime()) ? null : date;
    } catch {
      /* ignore */
    }
  }

  // 2) Formatos con separadores
  const sepMatch = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2}|\d{4})$/);
  if (sepMatch) {
    let dd = parseInt(sepMatch[1], 10);
    let mm = parseInt(sepMatch[2], 10) - 1;
    let yy = parseInt(sepMatch[3], 10);
    if (yy < 100) yy += 2000; // asume siglo 2000
    const date = new Date(yy, mm, dd);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // 3) Formato compacto DDMMYY o DDMMYYYY
  const compactMatch = s.match(/^(\d{2})(\d{2})(\d{2}|\d{4})$/);
  if (compactMatch) {
    const dd = parseInt(compactMatch[1], 10);
    const mm = parseInt(compactMatch[2], 10) - 1;
    let yy = parseInt(compactMatch[3], 10);
    if (yy < 100) yy += 2000;
    const date = new Date(yy, mm, dd);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // 4) Último intento: Date.parse (ISO u otros)
  const t = Date.parse(s);
  if (!Number.isNaN(t)) return new Date(t);

  return null;
}

/** Convierte a número seguro (admite coma decimal) */
function toNumberSafe(v) {
  if (v == null) return NaN;
  const s = String(v).replace(',', '.').trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Lee archivo NAV (csv o xlsx) y valida:
 *  - 5 columnas
 *  - col 2 fecha válida
 *  - col 3-5 numéricas
 * Devuelve:
 *  { ok, rows, errors, preview }
 *  rows normalizados: { gps, fecha (Date), x, y, z }
 */
export async function parseNavFile(file) {
  if (!file) return { ok: false, rows: [], errors: ['No se recibió archivo.'], preview: [] };

  const name = file.name?.toLowerCase() || '';
  try {
    let matrix = [];

    if (name.endsWith('.csv')) {
      // CSV
      const text = await file.text();
      const parsed = Papa.parse(text, { delimiter: ',', skipEmptyLines: true });
      if (parsed.errors?.length) {
        return { ok: false, rows: [], errors: ['Error al leer CSV: ' + parsed.errors[0]?.message], preview: [] };
      }
      matrix = parsed.data;
    } else if (name.endsWith('.xlsx')) {
      // XLSX (tomamos la primera hoja)
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      matrix = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: '' });
    } else {
      return { ok: false, rows: [], errors: ['Formato no soportado. Usa .csv o .xlsx'], preview: [] };
    }

    // Validación por filas
    const errors = [];
    const rows = [];

    matrix.forEach((row, idx) => {
      // Esperamos 5 columnas.
      if (!row || row.length < 5) {
        // Permitimos filas vacías al final sin romper
        const allEmpty = (row || []).every((c) => String(c ?? '').trim() === '');
        if (!allEmpty) errors.push(`Fila ${idx + 1}: se esperaban 5 columnas.`);
        return;
      }
      const [c1, c2, c3, c4, c5] = row;

      const gps = String(c1 ?? '').trim();
      const fecha = parseDateFlexible(c2);
      const x = toNumberSafe(c3);
      const y = toNumberSafe(c4);
      const z = toNumberSafe(c5);

      // Saltar filas totalmente vacías
      if (!gps && !c2 && !c3 && !c4 && !c5) return;

      if (!gps) errors.push(`Fila ${idx + 1}: GPS vacío.`);
      if (!fecha) errors.push(`Fila ${idx + 1}: la columna 2 no es una fecha válida.`);
      if (!Number.isFinite(x)) errors.push(`Fila ${idx + 1}: X no es numérico.`);
      if (!Number.isFinite(y)) errors.push(`Fila ${idx + 1}: Y no es numérico.`);
      if (!Number.isFinite(z)) errors.push(`Fila ${idx + 1}: Z no es numérico.`);

      rows.push({ gps: gps.toUpperCase(), fecha, x, y, z });
    });

    if (rows.length === 0) errors.push('No se encontraron filas válidas.');

    const ok = errors.length === 0;
    const preview = rows.slice(0, 50); // evita render pesado

    return { ok, rows, errors, preview };
  } catch (e) {
    return { ok: false, rows: [], errors: ['Excepción leyendo archivo: ' + (e?.message || e)], preview: [] };
  }
}

/** Formatea fecha a YYYY-MM-DD para mostrar en tabla */
export function fmtDate(d) {
  if (!(d instanceof Date)) return '—';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
