// Importamos la conexión a la base de datos
import { db } from '../config/db.js';




export const crearGpsBase = async (datosGps) => {
  const { nombre_gps, ruta_nav, ruta_obs, id_dia_rastreo, id_proyecto } = datosGps;

  let id_topografo = null;
  let id_empresa = null;

  try {
    const [filas] = await db.query(
      'SELECT _ID_TOPOGRAFO, _ID_EMPRESA FROM PROYECTO WHERE ID_PROYECTO = ? LIMIT 1',
      [id_proyecto]
    );

    if (filas.length === 0) {
      console.error('❌ No se encontró ningún día de rastreo para ese proyecto');
      return null;
    }

    id_topografo = filas[0]._ID_TOPOGRAFO;
    id_empresa = filas[0]._ID_EMPRESA;

  } catch (error) {
    console.error('❌ Error al obtener topógrafo y empresa:', error.message);
    return null;
  }

  try {

    const [resultado] = await db.query(`
      INSERT INTO GPS_BASE ( NOMBRE_GPS_BASE, RUTA_NAV_GPS_BASE, RUTA_OBS_GPS_BASE, _ID_DIA_RASTREO, _ID_PROYECTO, _ID_TOPOGRAFO, _ID_EMPRESA ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre_gps, ruta_nav, ruta_obs, id_dia_rastreo, id_proyecto, id_topografo, id_empresa]);

    return { id: resultado.insertId };

  } catch (error) { console.error('❌ Error al insertar GPS_BASE:', error.message); return null; }
};



/* ---------------------------------------------
  Busqueda de los nombres delos gps por medio del id del dia rastreo
  ---------------------------------------------*/
export const buscarGps = async (id_diaRastreo) => {
  const [rows] = await db.query('SELECT NOMBRE_GPS_BASE, RUTA_NAV_GPS_BASE, RUTA_OBS_GPS_BASE FROM GPS_BASE WHERE _ID_DIA_RASTREO = ?', [id_diaRastreo]);
  return rows
};


/* ---------------------------------------------
  Búsqueda del número de GPS por medio del id del proyecto
  ---------------------------------------------*/
  export const contarGpsPorProyecto = async (id_proyecto) => {
    const [rows] = await db.query(
      'SELECT COUNT(*) AS numero_gps FROM GPS_BASE WHERE _ID_PROYECTO = ?', 
      [id_proyecto]
    );
    
    // Devolver el número de GPS
    return rows[0].numero_gps;
  };


// Esta función valida si un gps ya existe para un proyecto dado
export const validarGpsUnico = async (nombre_gps, id_dia_rastreo) => {
  try {
    const [resultado] = await db.query(
      `SELECT COUNT(*) AS cantidad FROM GPS_BASE 
         WHERE NOMBRE_GPS_BASE = ? AND _ID_DIA_RASTREO = ?`,
      [nombre_gps, id_dia_rastreo]
    );

    // Si la cantidad es mayor que 0, ya existe → retornar 0 (no es único)
    if (resultado[0].cantidad > 0) {
      return 0;
    }

    // Si no existe → retornar 1 (es único)
    return 1;

  } catch (error) {
    console.error('❌ Error al validar día de rastreo:', error.message);
    return 0; // Por seguridad retornamos 0 (como si ya existiera)
  }
};