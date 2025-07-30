// src\controllers\proyectoController.js

// Importamos las funciones del modelo
import { buscarNombreProyecto, obtenerProyectos, crearProyecto, actualizarProyecto, ocultarProyecto} from '../models/proyectoModel.js';
import { obtenerNombreEmpresaPorId } from '../models/empresaModel.js';

// Importamos la función que ejecuta el script Python para generar carpetación
import { generarCarpetacion } from '../utils_python/runners/ejecutarCarpetacion.js';
import { renombrarCarpetaProyecto } from '../utils_python/runners/ejecutarRenombrarCarpeta.js';


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


/* ---------------------------------------------
  Controlador PUT /api/proyectos/:id
  ---------------------------------------------
  Permite actualizar un proyecto existente.

  - Si el nombre del proyecto cambia, se renombra la carpeta y se actualiza la ruta.
  - No permite cambiar la empresa, la fecha de creación ni el ID del proyecto.
--------------------------------------------- */
export const putProyecto = async (req, res) => {
  try {
    const id_proyecto = req.params.id;
    const { nombre_antiguo, nombre_nuevo, radio_busqueda, estado_red, estado_geo, _id_empresa } = req.body;
    let ruta_proyecto_actual = null;
    let empresa_nombre = null;
    
    // Verificar si se desea cambiar el nombre del proyecto
    if(nombre_nuevo){
      
      //********************************************************************************************************************************** */
      try { // Funcion poara validar si el nuevo nombre del proyecto ya existe
        
        const yaExiste = await buscarNombreProyecto(nombre_nuevo) 
        if (yaExiste >= 1) return res.status(409).json({ mensaje: `Ya existe un proyecto con el nombre '${nombre_nuevo}'` }); 
        
        
      } catch (error) { return res.status(500).json({ mensaje: `Error interno al verificar el nombre del proyecto` })}// en caso de error
      
      //********************************************************************************************************************************** */
      try { // Funcion para obtener el nombre de una empresa por su ID
        
        empresa_nombre = await obtenerNombreEmpresaPorId(_id_empresa)
        if (!empresa_nombre) return res.status(409).json({ mensaje: `No se encontro el ID de este proyecto` })
          
        } catch (error) { return res.status(500).json({ mensaje: `Error interno al obtener el nombre de la empresa`, errores: {error} })}// en caso de error
        
        //********************************************************************************************************************************** */
        
        try { // Funcion para ejecutar el Runner que corre el Script en PYTHON para renombrar una carpeta
          
          ruta_proyecto_actual = await renombrarCarpetaProyecto(empresa_nombre, nombre_antiguo, nombre_nuevo);
          if (!ruta_proyecto_actual) return res.status(409).json({ mensaje: `Error interno el proyecto no existe en el Disco`})
            
          } catch (error) { return res.status(500).json({ mensaje: `Error interno al renombrar el proyecto` }) }
          
          //**********************************************************************************************************************************
    }
    
    // Actualizamos el proyecto en base de datos
    const resultado = await actualizarProyecto(id_proyecto, {
      nuevo_nombre_proyecto: nombre_nuevo,
      ruta_nueva: ruta_proyecto_actual,
      radio_busqueda,
      estado_red,
      estado_geo
    });
    
    // Respondemos con éxito
    res.status(200).json({ mensaje: '✅ Proyecto actualizado correctamente.', ruta_nueva: ruta_proyecto_actual, resultado });
    
  } catch (error) {
    console.error('❌ Error al actualizar proyecto:', error);
    res.status(500).json({ mensaje: 'Error interno al actualizar el proyecto.' });
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
    const resultado = await ocultarProyecto(id);

    if (!resultado) return res.status(404).json({ mensaje: 'No se encontró el proyecto con ese ID' });

    return res.status(200).json({ mensaje: 'Proyecto marcado como finalizado correctamente' });

  } catch (error) { return res.status(500).json({mensaje: 'Error interno al intentar ocultar el proyecto', error: error.message}); }
};