// src\controllers\proyectoController.js

// Importamos las funciones del modelo
import { buscarNombreProyecto, obtenerProyectos, obtenerProyectosRed, crearProyecto, actualizarProyecto, ocultarProyecto, eliminarProyecto} from '../models/proyectoModel.js';
import { obtenerNombreEmpresaPorId } from '../models/empresaModel.js';

// Importamos la función que ejecuta el script Python para generar carpetación
import { generarCarpetacion } from '../utils_python/runners/ejecutarCarpetacion.js';
import { renombrarCarpetaProyecto } from '../utils_python/runners/ejecutarRenombrarCarpeta.js';


/* ---------------------------------------------
  Controlador GET /api/proyectos
  ---------------------------------------------*/

export const getProyectosRed = async (req, res) => {
  try {
    const proyectos = await obtenerProyectosRed();
    res.status(200).json(proyectos);
  } catch (error) {
    console.error('❌ Error al obtener proyectos:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

/* ---------------------------------------------
  Controlador GET /api/proyectos
  ---------------------------------------------*/

export const getProyectos = async (req, res) => {
  try {
    const proyectos = await obtenerProyectos();
    res.status(200).json(proyectos);
  } catch (error) {
    console.error('❌ Error al obtener proyectos:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};



/* ---------------------------------------------
  Controlador POST /api/proyectos
  ---------------------------------------------*/

export const postProyecto = async (req, res) => {
  try {
    const { nombre_proyecto, fecha_creacion, radio_busqueda, _id_topografo, _id_empresa } = req.body; /* Datos que reciben desde el cuerpo de la solicitud */

    const validacionNombreProyecto = await buscarNombreProyecto(nombre_proyecto)

    // Validar si el nombre de ese proyecto ya se encuentra en la base de datos
    if (validacionNombreProyecto == 1){
      return res.status(409).json({ mensaje: `El  nombre de proyecto: '${nombre_proyecto}' ya existe` })
    }

    // Verificar campos obligatorios antes de proceder
    if (!nombre_proyecto || !fecha_creacion || !radio_busqueda || !_id_topografo || !_id_empresa) {
      return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
    }

    /* Modelo con el cual obtenmemos el nombre de la empresa mediante su ID */
    const nombre_empresa = await obtenerNombreEmpresaPorId(_id_empresa)

    // 🐍 Ejecutar script Python que crea las carpetas del proyecto
    const ruta_proyecto = await generarCarpetacion(nombre_empresa, nombre_proyecto);

    // 🧱 Insertar el proyecto en la base de datos
    const resultado = await crearProyecto({ nombre_proyecto, fecha_creacion, ruta_proyecto, radio_busqueda, _id_topografo, _id_empresa });


    // ✅ Respuesta exitosa
    res.status(201).json({ mensaje: '✅ Proyecto creado exitosamente', id: resultado.id, ruta_proyecto});

  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar el proyecto' });
  }
};


// PUT /api/proyectos/:id
export const putProyecto = async (req, res) => {
  try {
    const id_proyecto = req.params.id;

    // Acepta snake_case y MAYÚSCULAS del front
    const radio_body       = req.body.radio_busqueda   ?? req.body.RADIO_BUSQUEDA;
    const estado_red_body  = req.body.estado_red       ?? req.body.ESTADO_RED;
    const estado_geo_body  = req.body.estado_geo       ?? req.body.ESTADO_GEO;
    const fecha_body       = req.body.fecha_creacion   ?? req.body.FECHA_CREACION; // 'YYYY-MM-DD'

    const datos = {};

    // Validación: radio en rango
    if (radio_body !== undefined) {
      const num = Number(radio_body);
      if (Number.isNaN(num) || num < 80 || num > 250) {
        return res.status(400).json({ mensaje: 'radio_busqueda debe estar entre 80 y 250.' });
      }
      datos.radio_busqueda = num;
    }

    // Estados (sin validación de contenido)
    if (estado_red_body !== undefined) datos.estado_red = String(estado_red_body);
    if (estado_geo_body !== undefined) datos.estado_geo = String(estado_geo_body);

    // Fecha creación (YYYY-MM-DD -> YYYY-MM-DD 00:00:00)
    if (fecha_body !== undefined) {
      const s = String(fecha_body).trim();
      const re = /^\d{4}-\d{2}-\d{2}$/; // 2025-08-14
      if (!re.test(s)) {
        return res.status(400).json({ mensaje: 'fecha_creacion debe tener formato YYYY-MM-DD.' });
      }
      datos.fecha_creacion = `${s} 00:00:00`;
    }

    if (Object.keys(datos).length === 0) {
      return res.status(400).json({
        mensaje: 'Nada que actualizar. Solo se permite: radio_busqueda, estado_red, estado_geo, fecha_creacion.'
      });
    }

    const resultado = await actualizarProyecto(id_proyecto, datos);
    return res.status(200).json({ mensaje: 'Proyecto actualizado', resultado });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error interno al actualizar', error: err?.message });
  }
};






/* ---------------------------------------------
  Controlador DELETE /api/proyectos/:id
  ---------------------------------------------
  No Elimina el proyecto pero si cambia los estados de estado redGeoscan y estado Geoepoca.

  - El estado para amabs columnas cambia a ELiminado pero no lo saca de la base de datos
--------------------------------------------- */
export const deleteProyecto = async (req, res) => {
  try {
    const { id } = req.params;

    // Validación básica
    if (!id || isNaN(id)) return res.status(400).json({ mensaje: 'ID de proyecto inválido o no proporcionado' });

    // Intentar actualizar
    const resultado = await eliminarProyecto(id);

    if (!resultado) return res.status(404).json({ mensaje: 'No se encontró el proyecto con ese ID' });

    return res.status(200).json({ mensaje: 'Proyecto marcado como finalizado correctamente' });

  } catch (error) { return res.status(500).json({mensaje: 'Error interno al intentar ocultar el proyecto', error: error.message}); }
};