// C:\BotAuto-Full\client\src\utils\parseFix.js
// npm i papaparse
import Papa from 'papaparse';

/** Convierte a número: maneja coma decimal, separadores de miles y espacios. */
function toNumberSafe(v) {
  if (v == null) return NaN;
  let s = String(v).trim().replace(/\u00A0/g, ''); // quita NBSP
  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');
  if (lastDot !== -1 && lastComma !== -1) {
    const decimalChar = lastDot > lastComma ? '.' : ',';
    s = s.replace(/[.,\s](?=.*[.,]\d{1,}$)/g, ''); // quita miles
    s = s.replace(decimalChar, '.');               // deja decimal como '.'
  } else {
    if (lastComma !== -1 && lastDot === -1) s = s.replace(/,/g, '.');
    s = s.replace(/\s+/g, '');
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

/** Normaliza encabezado para comparar sin tildes/caso/espacios. */
function normHeader(h) {
  return String(h || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parseo y validación del FIX (.csv) — REQUERE ENCABEZADO
 * Debe incluir las columnas: "Station ID", "X (m)", "Y (m)", "Z (m)" (aceptamos variantes comunes).
 * Si no hay encabezado o faltan columnas → error.
 *
 * Retorna: { ok, rows:[{gps,x,y,z}], errors:[...], preview:[...], usedColumns:{...} }
 */
export async function parseFixFile(file) {
  if (!file) return { ok: false, rows: [], errors: ['No se recibió archivo.'], preview: [] };

  try {
    const text = await file.text();
    const parsed = Papa.parse(text, { delimiter: ',', skipEmptyLines: true });
    if (parsed.errors?.length) {
      return { ok: false, rows: [], errors: ['Error al leer CSV: ' + parsed.errors[0]?.message], preview: [] };
    }

    const matrix = parsed.data;
    if (!Array.isArray(matrix) || matrix.length < 2) {
      return { ok: false, rows: [], errors: ['El archivo FIX debe tener encabezado y datos.'], preview: [] };
    }

    const headerRaw = matrix[0] || [];
    const header = headerRaw.map(normHeader);

    const findIdx = (cands) => {
      for (const c of cands) {
        const idx = header.findIndex(h => h.includes(c));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const gpsIdx = findIdx(['station id', 'station', 'id', 'gps']);
    const xIdx   = findIdx(['x (m)', 'x m', 'x']);
    const yIdx   = findIdx(['y (m)', 'y m', 'y']);
    const zIdx   = findIdx(['z (m)', 'z m', 'z']);

    if (gpsIdx === -1 || xIdx === -1 || yIdx === -1 || zIdx === -1) {
      return {
        ok: false,
        rows: [],
        errors: [
          'El archivo FIX debe tener encabezado y las columnas:',
          'Station ID, X (m), Y (m), Z (m).',
        ],
        preview: [],
      };
    }

    const data = matrix.slice(1); // quitar encabezado
    const errors = [];
    const rows = [];

    data.forEach((row, idx) => {
      const gpsRaw = row[gpsIdx];
      const xRaw = row[xIdx];
      const yRaw = row[yIdx];
      const zRaw = row[zIdx];

      const gps = String(gpsRaw ?? '').trim();
      const x = toNumberSafe(xRaw);
      const y = toNumberSafe(yRaw);
      const z = toNumberSafe(zRaw);

      // Filas vacías: saltar
      if (!gps && (xRaw==null||xRaw==='') && (yRaw==null||yRaw==='') && (zRaw==null||zRaw==='')) return;

      if (!gps) errors.push(`Fila ${idx + 1}: GPS vacío.`);
      if (!Number.isFinite(x)) errors.push(`Fila ${idx + 1}: X no es numérico.`);
      if (!Number.isFinite(y)) errors.push(`Fila ${idx + 1}: Y no es numérico.`);
      if (!Number.isFinite(z)) errors.push(`Fila ${idx + 1}: Z no es numérico.`);

      rows.push({ gps: gps.toUpperCase(), x, y, z });
    });

    if (rows.length === 0) errors.push('No se encontraron filas válidas.');

    const ok = errors.length === 0;
    const preview = rows.slice(0, 50);

    return { ok, rows, errors, preview, usedColumns: { gpsIdx, xIdx, yIdx, zIdx } };
  } catch (e) {
    return { ok: false, rows: [], errors: ['Excepción leyendo archivo: ' + (e?.message || e)], preview: [] };
  }
}
