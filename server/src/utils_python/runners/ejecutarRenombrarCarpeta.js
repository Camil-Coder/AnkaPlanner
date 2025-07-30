// Importamos 'spawn' para lanzar procesos externos
import { spawn } from 'child_process';
// Importamos 'path' para construir rutas absolutas
import path from 'path';

/**
 * Ejecuta el script Python que renombra una carpeta de proyecto existente.
 *
 * @param {string} empresa - Nombre de la empresa (ej: 'DISAIN')
 * @param {string} nombreAntiguo - Nombre actual del proyecto (ej: 'ALTAMIRA-0725')
 * @param {string} nombreNuevo - Nuevo nombre del proyecto (ej: 'ALTAMIRA-0726')
 * @returns {Promise<string>} Nueva ruta completa del proyecto tras renombrarse
 */
export const renombrarCarpetaProyecto = (empresa, nombreAntiguo, nombreNuevo) => {
  return new Promise((resolve, reject) => {
    // Ruta absoluta al script Python
    const scriptPath = path.resolve('src/utils_python/renombrar_carpeta_proyecto.py');

    // Ejecutamos el script con los tres argumentos necesarios
    const proceso = spawn('python', [scriptPath, empresa, nombreAntiguo, nombreNuevo]);

    let output = '';
    let errorOutput = '';

    proceso.stdout.on('data', (data) => {
      output += data.toString();
    });

    proceso.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    proceso.on('close', (code) => {
      if (code === 0) {
        const rutaFinal = output.trim().split('\n').pop();
        resolve(rutaFinal);  // Resolvemos la promesa con la nueva ruta
      } else {
        reject(new Error(`Error al ejecutar el script de renombramiento:\n${errorOutput}`));
      }
    });
  });
};
