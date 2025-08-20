// run_guardar_reportes_en_rastreo.js
import { spawn } from 'child_process';
import path from 'path';

/**
 * Ejecuta el script Python que guarda los archivos en las carpetas del día de rastreo
 * y devuelve las rutas finales.
 *
 * @param {string} rutaReportes - Ruta a la carpeta del día (ejemplo: .../Reportes/120825)
 * @param {string} archivoNavegado - Ruta absoluta del archivo Navegado (CSV o Excel)
 * @param {string} archivoFix - Ruta absoluta del archivo Fix (CSV o Excel)
 * @param {string} archivoDifer - Ruta absoluta del archivo Difer (CSV o Excel)
 * @returns {Promise<{rutaNavFinal: string, rutaFixFinal: string, rutaDiferFinal: string}>}
 */
export function runGuardarReportesEnRastreo(rutaReportes, archivoNavegado, archivoFix, archivoDifer) {
  return new Promise((resolve, reject) => {
    try {
      const scriptPath = path.join( 'src', 'utils_python', 'guardar_reportes_en_rastreo.py' );

      const process = spawn('python', [ scriptPath, rutaReportes, archivoNavegado, archivoFix, archivoDifer, ]);

      let output = '';
      let errorOutput = '';

      process.stdout.on('data', (data) => { output += data.toString(); });

      process.stderr.on('data', (data) => { errorOutput += data.toString(); });

      process.on('close', (code) => { if (code !== 0) { return reject(new Error(`❌ Error al ejecutar el script: ${errorOutput}`)); }

        const lineas = output.trim().split('\n');
        const rutaNavFinal = lineas[0]?.trim();
        const rutaFixFinal = lineas[1]?.trim();
        const rutaDiferFinal = lineas[2]?.trim();

        if (!rutaNavFinal || !rutaFixFinal || !rutaDiferFinal) { return reject(new Error('No se recibieron las 3 rutas válidas del script.')); }

        resolve({ rutaNavFinal, rutaFixFinal, rutaDiferFinal, });
      });
    } catch (err) {
      reject(err);
    }
  });
}
