// C:\BotAuto-Full\server\src\models\reportesModel.js

// Importamos la conexión a la base de datos 
import { db } from '../config/db.js';

// Modelo para ingresar las rutas de los nuevos reportes
export const crearReporte = async (datos) => {
  const { ruta_navegado, ruta_fix, ruta_difer, id_dia_rastreo, id_proyecto, } = datos;

  try {
    // 2) Insertar en REPORTES
    const [resultado] = await db.query(`INSERT INTO REPORTES  (RUTA_NAV, RUTA_FIX, RUTA_DIF, _ID_DIA_RASTREO, _ID_PROYECTO) VALUES (?, ?, ?, ?, ?)`,
      [ruta_navegado, ruta_fix, ruta_difer, id_dia_rastreo, id_proyecto,]);

    return { id: resultado.insertId };
  } catch (err) {
    console.error('❌ Error al insertar en REPORTES:', err.message);
    return null;
  }
};


export const consultarDiferencias = async (id_dia_rastreo) => {

  try {
    const [rows] = await db.query(
      `SELECT RUTA_DIF FROM REPORTES WHERE _ID_DIA_RASTREO = ?`,
      [id_dia_rastreo]
    );

    if (rows.length > 0) {
      return rows[0].RUTA_DIF; // retorna la ruta encontrada
    }
    return null; // no encontró nada
  } catch (err) {
    console.error('❌ Error al consultar diferencias:', err.message);
    return null;
  }
};