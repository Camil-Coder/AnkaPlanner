// Importamos la conexión a la base de datos desde el archivo db.js
import { db } from '../config/db.js';

// Esta función consulta el nombre de una empresa por su ID
export const obtenerNombreEmpresaPorId = async (idEmpresa) => {
  const [rows] = await db.query('SELECT NOMBRE_EMPRESA FROM EMPRESA WHERE ID_EMPRESA = ?',[idEmpresa]);

  // Si no se encuentra, devolvemos null
  if (rows.length === 0) return null;

  return rows[0].NOMBRE_EMPRESA;
};

// Esta función consulta TODAS las empresas registradas en la tabla EMPRESA
export const obtenerEmpresas = async () => {
  // db.query() devuelve un array: [rows, fields] → solo usamos rows
  const [rows] = await db.query('SELECT * FROM EMPRESA');
  return rows; // Devolvemos las filas encontradas
};

// Esta función crea una nueva empresa en la tabla EMPRESA
export const crearEmpresa = async (nombre) => {
    // El signo de interrogación (?) es un marcador de posición que evita inyecciones SQL
    // Node.js reemplaza el ? por el valor de `nombre` de forma segura
    const [result] = await db.query(
      'INSERT INTO EMPRESA (NOMBRE_EMPRESA) VALUES (?)',
      [nombre] // Este valor reemplaza el ? en orden
    );
    return result.insertId; // Devuelve el ID autogenerado de la nueva empresa
  };

// Esta función actualiza el nombre de una empresa existente por su ID
export const actualizarEmpresa = async (id, nombre) => {
    const [result] = await db.query(
      'UPDATE EMPRESA SET NOMBRE_EMPRESA = ? WHERE ID_EMPRESA = ?',
      [nombre, id] // Reemplaza los dos ? en orden (primero nombre, luego id)
    );
    return result.affectedRows; // Devuelve cuántas filas fueron afectadas (0 o 1)
  };

// Esta función elimina una empresa por su ID
export const eliminarEmpresa = async (id) => {
    const [result] = await db.query(
      'DELETE FROM EMPRESA WHERE ID_EMPRESA = ?',
      [id] // Reemplaza el ?
    );
    return result.affectedRows; // Devuelve cuántas filas fueron eliminadas (0 o 1)
  };
  