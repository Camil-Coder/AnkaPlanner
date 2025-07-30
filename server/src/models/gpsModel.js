// Importamos la conexión a la base de datos
import { db } from '../config/db.js';

/**
 * Inserta un nuevo GPS en la tabla GPS_BASE
 * 
 * @param {Object} datosGps - Datos del GPS a insertar
 * @param {string} datosGps.nombre_gps - Nombre del GPS
 * @param {string} datosGps.ruta_nav - Ruta del archivo navegado
 * @param {string} datosGps.ruta_obs - Ruta del archivo observado
 * @param {number} datosGps.id_dia_rastreo - ID del día de rastreo
 * @param {number} datosGps.id_proyecto - ID del proyecto
 * @param {number} datosGps.id_topografo - ID del topógrafo
 * @param {number} datosGps.id_empresa - ID de la empresa
 * @returns {Promise<{id: number} | null>} - Retorna el ID insertado o null si falla
 */

export const crearGpsBase = async (datosGps) => {
  const { nombre_gps, ruta_nav, ruta_obs, id_dia_rastreo, id_proyecto, id_topografo, id_empresa } = datosGps;

  try {
    const [resultado] = await db.query(`
      INSERT INTO GPS_BASE ( NOMBRE_GPS_BASE, RUTA_NAV_GPS_BASE, RUTA_OBS_GPS_BASE, _ID_DIA_RASTREO, _ID_PROYECTO, _ID_TOPOGRAFO, _ID_EMPRESA ) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
      [ nombre_gps, ruta_nav, ruta_obs, id_dia_rastreo, id_proyecto, id_topografo, id_empresa ]);

    return { id: resultado.insertId };

  } catch (error) { console.error('❌ Error al insertar GPS_BASE:', error.message); return null; }
};
