// Importamos la conexión a la base de datos desde el archivo db.js
import { db } from '../config/db.js';

// Esta función consulta TODAS los topografos registradas en la tabla topografo
export const obtenerTopografo = async () => {
  // db.query() devuelve un array: [rows, fields] → solo usamos rows
  const [rows] = await db.query('SELECT * FROM TOPOGRAFO');
  return rows; // Devolvemos las filas encontradas
};

// Esta función crea una nuEVO TOPOGRAFO en la tabla topografo
export const crearTopografo = async (nombre) => {
    // El signo de interrogación (?) es un marcador de posición que evita inyecciones SQL
    // Node.js reemplaza el ? por el valor de `nombre` de forma segura
    const [result] = await db.query(
      'INSERT INTO TOPOGRAFO (NOMBRE_TOPOGRAFO) VALUES (?)',
      [nombre] // Este valor reemplaza el ? en orden
    );
    return result.insertId; // Devuelve el ID autogenerado deL nuevo topografo
  };

// Esta función actualiza el nombre de TOPOGRAFO existente por su ID
export const actualizarTopografo = async (id, nombre) => {
    const [result] = await db.query(
      'UPDATE TOPOGRAFO SET NOMBRE_TOPOGRAFO = ? WHERE ID_TOPOGRAFO = ?',
      [nombre, id] // Reemplaza los dos ? en orden (primero nombre, luego id)
    );
    return result.affectedRows; // Devuelve cuántas filas fueron afectadas (0 o 1)
  };

// Esta función elimina un TOPOGRAFO por su ID
export const eliminarTopografo = async (id) => {
    const [result] = await db.query(
      'DELETE FROM TOPOGRAFO WHERE ID_TOPOGRAFO = ?',
      [id] // Reemplaza el ?
    );
    return result.affectedRows; // Devuelve cuántas filas fueron eliminadas (0 o 1)
  };
  