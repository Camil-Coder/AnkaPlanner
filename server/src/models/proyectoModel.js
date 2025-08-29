// src\models\proyectoModel.js

// Importamos la conexión a la base de datos configurada previamente
import { db } from '../config/db.js';


/* ---------------------------------------------
  Busqueda de la ruta guardada de un proyecto
  ---------------------------------------------*/
export const buscarRutaProyecto = async (id_proyecto) =>{
  const [rows] = await db.query('SELECT RUTA_PROYECTO FROM PROYECTO WHERE ID_PROYECTO = ?', [id_proyecto]);
  // Si no lo encuentra retornamos null
  if (rows.length === 0){
    return null;
  } 
  return rows[0].RUTA_PROYECTO;
};


/* ---------------------------------------------
  Busqueda de coicidencias aun nombre de proyecto
  ---------------------------------------------*/
export const buscarNombreProyecto = async (nombre_proyect) => {
  const [rows] = await db.query('SELECT COUNT(*) AS coincidencias FROM  proyecto WHERE NOMBRE_PROYECTO = ?', [nombre_proyect])
  // Si no se encuentra, devolvemos null
  if (rows.length === 0) return null;
  
  return rows[0].coincidencias;
}

/* ---------------------------------------------
  Obtener todos los proyectos registrados
  ---------------------------------------------

 * Recupera todos los proyectos desde la base de datos, incluyendo
 * el nombre del topógrafo y el nombre de la empresa asociados a cada uno. */

export const obtenerProyectosRed = async () => {
  const [rows] = await db.query(`
    SELECT 
      p.ID_PROYECTO,           -- ID único del proyecto
      p.NOMBRE_PROYECTO,       -- Nombre asignado al proyecto (ej. ALTAMIRA-0725)
      p.FECHA_CREACION,        -- Fecha en que fue creado el proyecto
      p.RUTA_PROYECTO,         -- Ruta absoluta en disco donde se aloja el proyecto
      p.RADIO_BUSQUEDA,        -- Rango de búsqueda en km para estaciones GNSS
      p.ESTADO_RED,            -- Estado del proceso de red (En Proceso / Completo)
      p.ESTADO_GEO,            -- Estado del proceso GEOEPOCA (En Proceso / Completo)
      t.NOMBRE_TOPOGRAFO,      -- Nombre del topógrafo que creó el proyecto
      e.NOMBRE_EMPRESA         -- Nombre de la empresa a la que pertenece el proyecto
    FROM PROYECTO p
    JOIN TOPOGRAFO t ON p._ID_TOPOGRAFO = t.ID_TOPOGRAFO  -- Unión con la tabla TOPOGRAFO
    JOIN EMPRESA e ON p._ID_EMPRESA = e.ID_EMPRESA        -- Unión con la tabla EMPRESA
  `);

  return rows; // Retorna el listado de proyectos con topógrafo y empresa
};


/* ---------------------------------------------
  Obtener todos los proyectos registrados FRONT
  ---------------------------------------------

 * Recupera todos los proyectos desde la base de datos, incluyendo
 * el nombre del topógrafo y el nombre de la empresa asociados a cada uno. */

  export const obtenerProyectos = async () => {
    const [rows] = await db.query(`
        SELECT 
          p.ID_PROYECTO,           -- ID único del proyecto
          p.NOMBRE_PROYECTO,       -- Nombre asignado al proyecto (ej. ALTAMIRA-0725)
          p.FECHA_CREACION,        -- Fecha en que fue creado el proyecto
          p.RUTA_PROYECTO,         -- Ruta absoluta en disco donde se aloja el proyecto
          p.RADIO_BUSQUEDA,        -- Rango de búsqueda en km para estaciones GNSS
          p.ESTADO_RED,            -- Estado del proceso de red (En Proceso / Completo / Finalizado)
          p.ESTADO_GEO,            -- Estado del proceso GEOEPOCA (En Proceso / Completo / Finalizado)
          t.NOMBRE_TOPOGRAFO,      -- Nombre del topógrafo que creó el proyecto
          e.NOMBRE_EMPRESA         -- Nombre de la empresa a la que pertenece el proyecto
        FROM PROYECTO p
        JOIN TOPOGRAFO t ON p._ID_TOPOGRAFO = t.ID_TOPOGRAFO  -- Unión con la tabla TOPOGRAFO
        JOIN EMPRESA e ON p._ID_EMPRESA = e.ID_EMPRESA        -- Unión con la tabla EMPRESA
        WHERE p.ESTADO_RED NOT LIKE '%Finalizado%'
          AND p.ESTADO_GEO NOT LIKE '%Finalizado%'
      `);
  
    return rows; // Retorna el listado de proyectos con topógrafo y empresa, excluyendo los finalizados
  };


/* ---------------------------------------------
  Crear un nuevo proyecto
  --------------------------------------------- 

 * Inserta un nuevo proyecto en la base de datos.
 * Esta función es utilizada cuando un usuario crea un proyecto desde el frontend.*/

export const crearProyecto = async (datosProyecto) => {
  const {
    nombre_proyecto,      // Nombre del proyecto (ej. CAMPANO-0725)
    fecha_creacion,       // Fecha de creación (generada en el frontend o backend)
    ruta_proyecto,        // Ruta generada por el script Python
    radio_busqueda,       // Distancia de búsqueda en km (ej. 150)
    _id_topografo,        // ID del topógrafo que crea el proyecto 
    _id_empresa           // ID de la empresa que lo solicita
  } = datosProyecto;

  // Ejecutamos el INSERT con prepared statements (más seguro)
  const [resultado] = await db.query(`
    INSERT INTO PROYECTO ( NOMBRE_PROYECTO, FECHA_CREACION, RUTA_PROYECTO, RADIO_BUSQUEDA, ESTADO_RED, ESTADO_GEO, _ID_TOPOGRAFO, _ID_EMPRESA )
    VALUES (?, ?, ?, ?, 'Sin Dias Rastreos', 'Sin Dias Rastreos', ?, ?)`,
    [nombre_proyecto, fecha_creacion, ruta_proyecto, radio_busqueda, _id_topografo, _id_empresa]);

  //console.log(resultado)
  // Retorna el ID del nuevo proyecto creado
  return { id: resultado.insertId };
};

// modelo.js
export const actualizarProyecto = async (id_proyecto, nuevosDatos) => {
  const { radio_busqueda, estado_red, estado_geo, fecha_creacion } = nuevosDatos;

  const campos = [];
  const valores = [];

  if (radio_busqueda !== undefined) { campos.push('RADIO_BUSQUEDA = ?'); valores.push(radio_busqueda); }
  if (estado_red !== undefined)     { campos.push('ESTADO_RED = ?');     valores.push(estado_red); }
  if (estado_geo !== undefined)     { campos.push('ESTADO_GEO = ?');     valores.push(estado_geo); }
  if (fecha_creacion !== undefined) { campos.push('FECHA_CREACION = ?'); valores.push(fecha_creacion); } // DATETIME

  if (campos.length === 0) throw new Error('No se proporcionaron campos permitidos.');

  const sql = `UPDATE PROYECTO SET ${campos.join(', ')} WHERE ID_PROYECTO = ?`;
  valores.push(id_proyecto);

  const [resultado] = await db.query(sql, valores);
  return resultado; // affectedRows, etc.
};



  /* ---------------------------------------------
  eliminar un proyecto un proyecto existente
  ---------------------------------------------*/
  export const ocultarProyecto = async (id_proyecto) => {
    const estadoFinal = 'Finalizado';
    const [result] = await db.query('UPDATE PROYECTO SET ESTADO_RED = ?, ESTADO_GEO = ? WHERE ID_PROYECTO = ?',[estadoFinal, estadoFinal, id_proyecto]);
  
    if (result.affectedRows === 0) return null; // No se actualizó nada
  
    return true; // Actualización exitosa
  };



// Función para eliminar un proyecto
export const eliminarProyecto = async (id_proyecto) => {
  const connection = await db.getConnection();
  
  try {
    // Iniciar transacción
    await connection.beginTransaction();
    
    // 1. Eliminar los reportes ligados al proyecto
    await connection.query(
      'DELETE FROM reportes WHERE _ID_PROYECTO = ?',
      [id_proyecto]
    );
    
    // 2. Eliminar los GPS base ligados al proyecto
    await connection.query(
      'DELETE FROM gps_base WHERE _ID_PROYECTO = ?',
      [id_proyecto]
    );
    
    // 3. Eliminar los días de rastreo ligados al proyecto
    await connection.query(
      'DELETE FROM dia_rastreo WHERE _ID_PROYECTO = ?',
      [id_proyecto]
    );

    // 4. Eliminar el cambio de época del proyecto (si existe)
    await connection.query(
      'DELETE FROM excel_cambio_epoca WHERE _ID_PROYECTO = ?',
      [id_proyecto]
    );
    
    // 5. Finalmente, eliminar el proyecto
    const [result] = await connection.query(
      'DELETE FROM proyecto WHERE ID_PROYECTO = ?',
      [id_proyecto]
    );

    // Si no se eliminó nada, significa que el proyecto no existía
    if (result.affectedRows === 0) {
      await connection.rollback();
      return null;
    }
    
    // Confirmamos la transacción
    await connection.commit();
    return true; // Proyecto eliminado con éxito

  } catch (error) {
    // En caso de error, revertimos los cambios
    await connection.rollback();
    throw error; // Lanzamos el error para que pueda ser gestionado
  } finally {
    // Cerramos la conexión
    connection.release();
  }
};
