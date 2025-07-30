// C:\BotAuto-Full\server\src\controllers\gpsController.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runCrearGpsEnRastreo } from '../utils_python/runners/run_crear_gps_en_rastreo.js';
import { crearGpsBase } from '../models/gpsModel.js';
import { buscarRutaBaseRed } from '../models/diaRastreoModel.js';

// Resolver __dirname en ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const postGpsBase = async (req, res) => {
  // Definir variable fuera del try para usarla en finally
  let carpetaTemp = null;

  try {
    const { nombre_gps, id_dia_rastreo, id_proyecto, id_topografo, id_empresa } = req.body;

    if (!nombre_gps || !id_dia_rastreo || !id_proyecto || !id_topografo || !id_empresa || !req.files) {
      return res.status(400).json({ mensaje: 'Faltan datos obligatorios o archivos' });
    }

    const ruta_base = await buscarRutaBaseRed(id_dia_rastreo);
    console.log("--------------------");
    console.log(ruta_base);
    console.log("--------------------");

    const { archivo_navegado, archivo_observado } = req.files;
    console.log('🟨 Recibe archivos');

    // Carpeta temporal para los archivos cargados
    carpetaTemp = path.join(__dirname, '..', '..', 'temp', 'gps');
    if (!fs.existsSync(carpetaTemp)) fs.mkdirSync(carpetaTemp, { recursive: true });

    const rutaTempNav = path.join(carpetaTemp, archivo_navegado.name);
    const rutaTempObs = path.join(carpetaTemp, archivo_observado.name);
    console.log("Ruta temporal:", rutaTempNav);
    console.log("Ruta temporal:", rutaTempObs);

    await archivo_navegado.mv(rutaTempNav);
    await archivo_observado.mv(rutaTempObs);

    // Verificamos que se guardaron
    if (!fs.existsSync(rutaTempNav) || !fs.existsSync(rutaTempObs)) {
      console.error('❌ Archivos no se guardaron correctamente');
      return res.status(500).json({ mensaje: 'Error al guardar archivos temporalmente' });
    }

    console.log('✅ Archivos guardados temporalmente:');
    console.log('- Navegado:', rutaTempNav);
    console.log('- Observado:', rutaTempObs);

    // Ejecutar el runner Python
    console.log('🟨 Ejecutando runner...');
    const resultado = await runCrearGpsEnRastreo(ruta_base, nombre_gps, rutaTempNav, rutaTempObs);
    console.log('🟩 Resultado del runner:', resultado);

    if (!resultado || !resultado.rutaNavFinal || !resultado.rutaObsFinal) {
      return res.status(500).json({ mensaje: 'Error al crear carpeta GPS y guardar archivos' });
    }

    // Guardar en la base de datos
    const dbResult = await crearGpsBase({
      nombre_gps,
      ruta_nav: resultado.rutaNavFinal,
      ruta_obs: resultado.rutaObsFinal,
      id_dia_rastreo,
      id_proyecto,
      id_topografo,
      id_empresa,
    });

    if (!dbResult) {
      return res.status(500).json({ mensaje: 'Error al guardar el GPS en la base de datos' });
    }

    res.status(201).json({
      mensaje: '✅ GPS creado y archivos guardados correctamente',
      id_gps: dbResult.id,
      ruta_nav: resultado.rutaNavFinal,
      ruta_obs: resultado.rutaObsFinal
    });

  } catch (error) {
    console.error('❌ Error en postGpsBase:', error.message);
    res.status(500).json({ mensaje: 'Error interno al crear GPS', error: error.message });

  } finally {
    // 🧹 Limpiar archivos temporales
    if (carpetaTemp && fs.existsSync(carpetaTemp)) {
      fs.readdir(carpetaTemp, (err, files) => {
        if (err) {
          console.error('❌ Error al leer carpeta temporal:', err);
          return;
        }
        for (const file of files) {
          const filePath = path.join(carpetaTemp, file);
          fs.unlink(filePath, (err) => {
            if (err) console.error(`❌ Error al borrar archivo temporal ${file}:`, err);
            else console.log(`🧹 Archivo temporal eliminado: ${file}`);
          });
        }
      });
    }
  }
};
