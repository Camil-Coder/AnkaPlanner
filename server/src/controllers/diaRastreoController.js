// Importar modelos
import { crearDiaRastreo, validarDiaRastreoUnico } from '../models/diaRastreoModel.js';
import { buscarRutaProyecto } from '../models/proyectoModel.js';

// Importar runners
import { runCrearCarpetasDiaRastreo } from '../utils_python/runners/run_crear_carpetas_dia_rastreo.js';

/*------------------------------------
 * Controlador POST /api/dias-rastreo
 -------------------------------------*/
export const postDiaRastreo = async (req, res) => {
  try {
    const { nombre_dia, id_proyecto, id_topografo, id_empresa } = req.body;

    // Validación básica de datos obligatorios
    if (!nombre_dia || !id_proyecto || !id_topografo || !id_empresa) {
      return res.status(400).json({ mensaje: 'Faltan datos obligatorios para crear el día de rastreo' });
    }

    // variable global de la ruta
    let ruta_proyecto = null;

    //*************************************************************************************************************************
    // Validamos si ya existe ese día para ese proyecto
    try { 
        const existe = await validarDiaRastreoUnico(nombre_dia, id_proyecto);
        if (!existe) return res.status(409).json({ mensaje: `Ya existe un día de rastreo con el nombre '${nombre_dia}' en este proyecto.` });

    } catch (error) { return res.status(500).json({ mensaje: 'Error al validar si el día de rastreo ya existe', error: error.message });}
    
    //*************************************************************************************************************************
    // Intentamos obtener la ruta del proyecto desde la base de datos
    try {
      ruta_proyecto = await buscarRutaProyecto(id_proyecto);
      if (!ruta_proyecto) return res.status(404).json({ mensaje: `No se encontró la ruta del proyecto con ID ${id_proyecto}` });
      
    } catch (error) { return res.status(500).json({ mensaje: 'Error interno al obtener la ruta del proyecto', error: error.message });}

    //*************************************************************************************************************************
    // Ejecutamos el script Python para crear la estructura del día de rastreo
    const { rutaRastreo, rutaReportes } = await runCrearCarpetasDiaRastreo(ruta_proyecto, nombre_dia);

    // Guardamos en la base de datos
    const resultado = await crearDiaRastreo({
      nombre_dia,
      ruta_dia_rastreo_red: rutaRastreo,
      ruta_dia_rastreo_geo: rutaReportes,
      id_proyecto,
      id_topografo,
      id_empresa
    });

    if (!resultado) {
      return res.status(500).json({ mensaje: 'Error al guardar el día de rastreo en la base de datos' });
    }

    // Éxito
    res.status(201).json({
      mensaje: '✅ Día de rastreo creado exitosamente',
      id_dia_rastreo: resultado.id,
      rutaRastreo,
      rutaReportes
    });

  } catch (error) {
    console.error('❌ Error en postDiaRastreo:', error.message);
    res.status(500).json({ mensaje: 'Error interno al crear día de rastreo', error: error.message });
  }
};
