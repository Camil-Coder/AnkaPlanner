// C:\BotAuto-Full\client\src\utils\compareNavFix.js

/**
 * NAV: [{ gps, fecha: Date, x, y, z }]
 * FIX: [{ gps, x, y, z }]
 * Devuelve:
 *  - rows: solo GPS que existen en AMBOS archivos (sin "Sin par")
 *  - omitted: listado de gps que quedaron sin par (para resumen)
 */
export function compareNavFix(navRows, fixRows, threshold = 10) {
    // Tomar la última medición NAV por GPS (por fecha)
    const navMap = new Map();
    for (const r of navRows) {
      const key = r.gps;
      const prev = navMap.get(key);
      if (!prev || (r.fecha instanceof Date && prev.fecha instanceof Date && r.fecha > prev.fecha)) {
        navMap.set(key, r);
      }
    }
  
    // Un FIX por GPS (si hay duplicados, nos quedamos con el primero)
    const fixMap = new Map();
    for (const r of fixRows) {
      if (!fixMap.has(r.gps)) fixMap.set(r.gps, r);
    }
  
    // Intersección de GPS (solo pares)
    const rows = [];
    const omitted = [];
    const allGps = new Set([...navMap.keys(), ...fixMap.keys()]);
  
    for (const gps of allGps) {
      const n = navMap.get(gps);
      const f = fixMap.get(gps);
  
      if (!n || !f) {
        omitted.push(gps); // sin par → se omite de la tabla
        continue;
      }
  
      const dx = Number(n.x) - Number(f.x);
      const dy = Number(n.y) - Number(f.y);
      const dz = Number(n.z) - Number(f.z);
  
      const over =
        Math.abs(dx) > threshold ||
        Math.abs(dy) > threshold ||
        Math.abs(dz) > threshold;
  
      rows.push({
        gps,
        dx, dy, dz,
        status: over ? 'Sobre umbral' : 'OK',
      });
    }
  
    rows.sort((a, b) => (a.gps > b.gps ? 1 : a.gps < b.gps ? -1 : 0));
    return { rows, omitted };
  }
  