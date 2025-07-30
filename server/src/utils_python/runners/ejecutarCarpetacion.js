// Importa el módulo 'child_process' para ejecutar scripts externos desde Node.js
import { spawn } from 'child_process';

// Importa el módulo 'path' para manejar rutas de archivos de forma segura
import path from 'path';

/**
 * Ejecuta el script Python que crea la estructura de carpetas de un nuevo proyecto.
 * Este script genera una carpeta por empresa y proyecto, y devuelve su ruta.
 *
 * @param {string} empresa - Nombre de la empresa (ej: 'DISAIN')
 * @param {string} proyecto - Nombre del proyecto (ej: 'ALTAMIRA-0725')
 * @returns {Promise<string>} Ruta completa donde se creó el proyecto (ej: 'F:/DISAIN/ALTAMIRA-0725')
 */
export const generarCarpetacion = (empresa, proyecto) => {
  return new Promise((resolve, reject) => {
    // Construye la ruta absoluta del script Python que se va a ejecutar
    const scriptPath = path.resolve('src/utils_python/generar_carpetacion_inicial.py');

    // Lanza el proceso de Python pasando los dos argumentos necesarios
    const proceso = spawn('python', [scriptPath, empresa, proyecto]);

    let output = '';       // Captura la salida estándar (stdout) del script
    let errorOutput = '';  // Captura los errores (stderr), si los hay

    // Cuando el script emite datos en consola (stdout), los acumulamos en output
    proceso.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Si hay errores durante la ejecución, se almacenan en errorOutput
    proceso.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Cuando el proceso finaliza:
    proceso.on('close', (code) => {
      if (code === 0) {
        // Si terminó correctamente (exit code 0), limpiamos y extraemos la última línea (la ruta generada)
        const rutaLimpia = output.trim().split('\n').pop();
        resolve(rutaLimpia); // Resolvemos la promesa con la ruta del proyecto
      } else {
        // Si hubo un error, rechazamos la promesa con el mensaje de error capturado
        reject(new Error(`Error al ejecutar script Python:\n${errorOutput}`));
      }
    });
  });
};
