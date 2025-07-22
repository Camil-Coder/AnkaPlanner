// src/models/proyectoModel.js
import { db } from '../config/db.js';


// Obtener todos los proyectos, incluyendo nombre del topógrafo y de la empresa
export const obtenerProyectos = async () => {
  const [rows] = await db.query(`
    SELECT 
      p.ID_PROYECTO,
      p.NOMBRE_PROYECTO,
      p.FECHA_CREACION,
      p.RUTA_PROYECTO,
      p.RADIO_BUSQUEDA,
      p.ESTADO_RED,
      p.ESTADO_GEO,
      t.NOMBRE_TOPOGRAFO,
      e.NOMBRE_EMPRESA
    FROM PROYECTO p
    JOIN TOPOGRAFO t ON p._ID_TOPOGRAFO = t.ID_TOPOGRAFO
    JOIN EMPRESA e ON p._ID_EMPRESA = e.ID_EMPRESA
  `);
  return rows;
};

/* // Crear un proyecto nuevo con ruta y estados generados por backend
export const crearProyecto = async (proyecto) => {
    const {
      nombre,
      fecha,
      ruta, // ← generada por el script Python
      radio,
      id_topografo,
      id_empresa
    } = proyecto;
  
    const estado_red = 'En Proceso';
    const estado_geo = 'En Proceso';
  
    const [result] = await db.query(`
      INSERT INTO PROYECTO
        (NOMBRE_PROYECTO, FECHA_CREACION, RUTA_PROYECTO, RADIO_BUSQUEDA, ESTADO_RED, ESTADO_GEO, _ID_TOPOGRAFO, _ID_EMPRESA)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [nombre, fecha, ruta, radio, estado_red, estado_geo, id_topografo, id_empresa]);
  
    return result.insertId;
  };
  



/* // 

// Crear un nuevo proyecto
export const crearProyecto = async (proyecto) => {
  const {
    nombre,
    fecha,
    ruta,
    radio,
    estado_red,
    estado_geo,
    id_topografo,
    id_empresa
  } = proyecto;

  const [result] = await db.query(`
    INSERT INTO PROYECTO (
      NOMBRE_PROYECTO,
      FECHA_CREACION,
      RUTA_PROYECTO,
      RADIO_BUSQUEDA,
      ESTADO_RED,
      ESTADO_GEO,
      _ID_TOPOGRAFO,
      _ID_EMPRESA
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [nombre, fecha, ruta, radio, estado_red, estado_geo, id_topografo, id_empresa]);

  return result.insertId;
};

// Actualizar un proyecto con campos dinámicos
export const actualizarProyecto = async (id, datos) => {
  const campos = [];  // Lista de campos a actualizar
  const valores = []; // Valores correspondientes

  if (datos.nombre) {
    campos.push('NOMBRE_PROYECTO = ?');
    valores.push(datos.nombre);
  }

  if (datos.fecha) {
    campos.push('FECHA_CREACION = ?');
    valores.push(datos.fecha);
  }

  if (datos.ruta) {
    campos.push('RUTA_PROYECTO = ?');
    valores.push(datos.ruta);
  }

  if (datos.radio) {
    campos.push('RADIO_BUSQUEDA = ?');
    valores.push(datos.radio);
  }

  if (datos.estado_red) {
    campos.push('ESTADO_RED = ?');
    valores.push(datos.estado_red);
  }

  if (datos.estado_geo) {
    campos.push('ESTADO_GEO = ?');
    valores.push(datos.estado_geo);
  }

  // Si no se recibe ningún campo, no hacemos nada
  if (campos.length === 0) {
    return 0;
  }

  // El ID se agrega al final para el WHERE
  valores.push(id);

  const [result] = await db.query(
    `UPDATE PROYECTO SET ${campos.join(', ')} WHERE ID_PROYECTO = ?`,
    valores
  );

  return result.affectedRows;
};

// Eliminar un proyecto
export const eliminarProyecto = async (id) => {
  const [result] = await db.query('DELETE FROM PROYECTO WHERE ID_PROYECTO = ?', [id]);
  return result.affectedRows;
};
 */ 