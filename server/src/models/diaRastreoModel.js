// Importamos la conexión a la base de datos desde el archivo db.js
import { db } from '../config/db.js';



// Esta función valida si un día de rastreo ya existe para un proyecto dado
export const validarDiaRastreoUnico = async (nombre_dia, id_proyecto) => {
  try {
    const [resultado] = await db.query(
      `SELECT COUNT(*) AS cantidad FROM DIA_RASTREO 
         WHERE NOMBRE_DIA_RASTREO = ? AND _ID_PROYECTO = ?`,
      [nombre_dia, id_proyecto]
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



// Esta función almacena la información en la tabla DIA_RASTREO
export const crearDiaRastreo = async (datosDiaRastreo) => {
  const { nombre_dia, ruta_dia_rastreo_red, ruta_dia_rastreo_geo, id_proyecto } = datosDiaRastreo;
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
      INSERT INTO DIA_RASTREO (
        NOMBRE_DIA_RASTREO,
        RUTA_DIA_RASTREO_RED,
        RUTA_DIA_RASTREO_GEO,
        _ID_PROYECTO,
        _ID_TOPOGRAFO,
        _ID_EMPRESA
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre_dia, ruta_dia_rastreo_red, ruta_dia_rastreo_geo, id_proyecto, id_topografo, id_empresa]
    );

    return { id: resultado.insertId };

  } catch (error) {
    console.error('❌ Error al insertar día de rastreo:', error.message);
    return null;
  }
};



/* ---------------------------------------------
  Busqueda de la ruta guardada de un proyecto
  ---------------------------------------------*/
export const buscarRutaBaseRed = async (id_diaRastreo) => {
  const [rows] = await db.query('SELECT RUTA_DIA_RASTREO_RED FROM DIA_RASTREO WHERE ID_DIA_RASTREO = ?', [id_diaRastreo]);
  // Si no lo encuentra retornamos null
  if (rows.length === 0) {
    return null;
  }
  return rows[0].RUTA_DIA_RASTREO_RED;
};


/* ---------------------------------------------
  Busqueda de la ruta guardada de un proyecto
  ---------------------------------------------*/
export const buscarRutaBaseGeo = async (id_diaRastreo) => {
  console.log('id_dia rastreo: ', id_diaRastreo )
  const [rows] = await db.query('SELECT RUTA_DIA_RASTREO_GEO FROM DIA_RASTREO WHERE ID_DIA_RASTREO = ?', [id_diaRastreo]);
  // Si no lo encuentra retornamos null
  if (rows.length === 0) {
    return null;
  }
  return rows[0].RUTA_DIA_RASTREO_GEO;
};


/* ---------------------------------------------
  Busqueda de los nombres dia rastro por id proyecto
  ---------------------------------------------*/
export const BuscarNombresDias = async (id_proyecto) => {
  const [rows] = await db.query('SELECT * FROM DIA_RASTREO WHERE _ID_PROYECTO = ?', [id_proyecto]);
  return rows
};