// C:\BotAuto-Full\server\src\controllers\reportesController.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runGuardarReportesEnRastreo } from '../utils_python/runners/run_guardar_reportes_en_rastreo.js';

// Importación de modelos
import { crearReporte, consultarDiferencias } from '../models/reportesModel.js';
import { buscarRutaBaseGeo } from '../models/diaRastreoModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const postReportes = async (req, res) => {
  let carpetaTemp = null;

  try {
    const { id_dia_rastreo, id_proyecto } = req.body || {};

    // Validar que vengan datos obligatorios
    if (!id_dia_rastreo || !id_proyecto) {
      return res.status(400).json({ mensaje: 'Faltan id_dia_rastreo o id_proyecto.' });
    }

    // Traemos la ruta base de reportes
    const ruta_base = await buscarRutaBaseGeo(id_dia_rastreo);
    // ejemplo de la ruta que retorna:
    // F:\OPTIMA\0825-SURIA\Procesamiento\1. Topografia\Reportes\120825 

    console.log('rutabase: ', ruta_base);

    // ✅ Validación extra de ruta_base
    if (!ruta_base || typeof ruta_base !== 'string' || ruta_base.trim() === '') {
      return res.status(500).json({ mensaje: 'No se pudo determinar la ruta base de reportes.' });
    }

    // Archivos cargados desde el front
    const { archivo_navegado, archivo_fix, archivo_difer } = req.files || {};
    if (!archivo_navegado || !archivo_fix || !archivo_difer) {
      return res.status(400).json({ mensaje: 'Faltan los 3 archivos: navegado, fix y difer.' });
    }

    // ------------------------------------------------------------
    // Carpeta temporal para guardar archivos recibidos
    // ------------------------------------------------------------
    carpetaTemp = path.join(__dirname, '..', '..', 'temp', 'reportes');
    if (!fs.existsSync(carpetaTemp)) fs.mkdirSync(carpetaTemp, { recursive: true });

    // Definir rutas temporales
    const rutaTempNav = path.join(carpetaTemp, archivo_navegado.name);
    const rutaTempFix = path.join(carpetaTemp, archivo_fix.name);
    const rutaTempDifer = path.join(carpetaTemp, archivo_difer.name);

    // Mover archivos a carpeta temporal
    await archivo_navegado.mv(rutaTempNav);
    await archivo_fix.mv(rutaTempFix);
    await archivo_difer.mv(rutaTempDifer);

    // Verificar que se guardaron
    if (!fs.existsSync(rutaTempNav) || !fs.existsSync(rutaTempFix) || !fs.existsSync(rutaTempDifer)) {
      console.error('❌ Archivos no se guardaron correctamente');
      return res.status(500).json({ mensaje: 'Error al guardar archivos temporalmente' });
    }

    console.log('✅ Archivos guardados temporalmente:');
    console.log('- Navegado:', rutaTempNav);
    console.log('- Fix:', rutaTempFix);
    console.log('- Difer:', rutaTempDifer);

    // ------------------------------------------------------------
    // Ejecutar el runner Python
    // ------------------------------------------------------------
    console.log('🟨 Ejecutando runner...');
    const resultado = await runGuardarReportesEnRastreo(ruta_base, rutaTempNav, rutaTempFix, rutaTempDifer);
    console.log('🟩 Resultado del runner:', resultado);

    if (!resultado || !resultado.rutaNavFinal || !resultado.rutaFixFinal || !resultado.rutaDiferFinal) {
      return res.status(500).json({ mensaje: 'Error al guardar reportes en la carpeta final' });
    }

    // ------------------------------------------------------------
    // Guardar en BD con el modelo crearReporte
    // ------------------------------------------------------------
    const { rutaNavFinal, rutaFixFinal, rutaDiferFinal } = resultado;
    const dbResult = await crearReporte({
      ruta_navegado: rutaNavFinal,
      ruta_fix: rutaFixFinal,
      ruta_difer: rutaDiferFinal,
      id_dia_rastreo,
      id_proyecto,
    });

    if (!dbResult) {
      return res.status(500).json({ mensaje: 'Error al guardar los reportes en la base de datos.' });
    }

    // ------------------------------------------------------------
    // Respuesta final
    // ------------------------------------------------------------
    return res.status(201).json({
      mensaje: '✅ Reportes guardados correctamente.',
    });

  } catch (error) {
    console.error('❌ Error en postReportes:', error);
    return res.status(500).json({ mensaje: 'Error interno', error: error.message });

  } finally {
    // 🧹 Limpiar archivos temporales después de usar el runner
    if (carpetaTemp && fs.existsSync(carpetaTemp)) {
      for (const f of fs.readdirSync(carpetaTemp)) {
        try {
          fs.unlinkSync(path.join(carpetaTemp, f));
        } catch (err) {
          console.warn(`⚠️ No se pudo eliminar temporal: ${f}`, err.message);
        }
      }
    }
  }
};



export const getDiferenciasPorDia = async (req, res) => {
  try {
    const id_dia_rastreo = req.params.id

    if (!id_dia_rastreo) {
      return res.status(400).json({ mensaje: 'Falta id_dia_rastreo.' });
    }

    const rutaDif = await consultarDiferencias(id_dia_rastreo);

    // Si el modelo no encontró nada, responder vacío
    if (!rutaDif) {
      return res.status(200).json({ data: null });
    }

    // Validar que el archivo exista
    if (!fs.existsSync(rutaDif)) {
      return res.status(404).json({ mensaje: 'Archivo de diferencias no encontrado en ruta.', ruta: rutaDif });
    }

    // Enviar el archivo al front (forzando descarga)
    const nombreArchivo = path.basename(rutaDif);
    return res.download(rutaDif, nombreArchivo);

  } catch (error) {
    console.error('❌ Error en getDiferenciasPorDia:', error);
    return res.status(500).json({ mensaje: 'Error interno', error: error.message });
  }
};