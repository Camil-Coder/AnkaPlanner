import { spawn } from 'child_process'; // Para ejecutar scripts de Python
import path from 'path';               // Para manejar rutas

/**
 * Ejecuta el script Python que crea la carpeta del GPS
 * y copia los archivos .obs y .nav dentro.
 * 
 * @param {string} rutaBase - Ruta hasta la carpeta 'Base' del día de rastreo
 * @param {string} nombreGPS - Nombre del GPS (se usará como nombre de carpeta)
 * @param {string} rutaObs - Ruta absoluta del archivo observado (.obs)
 * @param {string} rutaNav - Ruta absoluta del archivo navegado (.nav)
 * @returns {Promise<{rutaObsFinal: string, rutaNavFinal: string}>}
 */
export function runCrearGpsEnRastreo(rutaBase, nombreGPS, rutaObs, rutaNav) {
  return new Promise((resolve, reject) => {
    try {
      const scriptPath = path.join(
        'src',
        'utils_python',
        'crear_gps_en_rastreo.py'
      );

      // Ejecutar el script con los 4 argumentos esperados
      const process = spawn('python', [scriptPath, rutaBase, nombreGPS, rutaObs, rutaNav]);

      let output = '';
      let errorOutput = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        if (code !== 0) {
          return reject(new Error(`Error al ejecutar el script: ${errorOutput}`));
        }

        const lineas = output.trim().split('\n');
        const rutaObsFinal = lineas[0]?.trim();
        const rutaNavFinal = lineas[1]?.trim();

        if (!rutaObsFinal || !rutaNavFinal) {
          return reject(new Error('No se recibieron rutas válidas del script.'));
        }

        resolve({
          rutaObsFinal,
          rutaNavFinal,
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}
