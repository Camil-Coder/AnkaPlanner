// src/utils_python/runners/run_crear_carpetas_dia_rastreo.js

import { spawn } from 'child_process';  // Permite ejecutar scripts de Python desde Node.js
import path from 'path';               // Manejo de rutas compatible con todos los sistemas operativos

// Función que ejecuta el script de Python para crear las carpetas de un día de rastreo
export function runCrearCarpetasDiaRastreo(rutaProyecto, nombreDia) {

  return new Promise((resolve, reject) => {
    try {
      // Ruta al script de Python que se va a ejecutar
      const scriptPath = path.join( 'src','utils_python','crear_carpetas_dia_rastreo.py' );

      // Ejecutamos el script pasando como argumentos:
      // 1. la ruta del proyecto y
      // 2. el nombre del día de rastreo (por ejemplo: 280725)
      const process = spawn('python', [scriptPath, rutaProyecto, nombreDia]);

      let output = '';        // Aquí se guardará la salida correcta del script
      let errorOutput = '';   // Aquí se guardarán posibles errores del script

      // Escuchamos la salida del script (stdout)
      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      // Escuchamos errores que el script pueda arrojar (stderr)
      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      // Cuando el script termina su ejecución
      process.on('close', (code) => {
        // Si el código de salida no es 0, significa que hubo un error
        if (code !== 0) {
          return reject(
            new Error(`Error al ejecutar el script: ${errorOutput}`)
          );
        }

        // El script imprime dos rutas (una por línea), las capturamos y separamos
        const lineas = output.trim().split('\n');
        console.log(lineas)
        const rutaRastreo = lineas[0]?.trim();   // Primera línea: ruta de rastreo
        const rutaReportes = lineas[6]?.trim();  // Segunda línea: ruta de reportes



        // Si alguna de las rutas no fue generada correctamente, lanzamos error
        if (!rutaRastreo || !rutaReportes) {
          return reject(new Error('No se recibieron rutas válidas del script.'));
        }

        // Si todo salió bien, devolvemos ambas rutas como resultado
        resolve({ rutaRastreo, rutaReportes,});
      });
    } catch (err) {
      // Si ocurre un error inesperado, lo capturamos aquí
      reject(err);
    }
  });
}
