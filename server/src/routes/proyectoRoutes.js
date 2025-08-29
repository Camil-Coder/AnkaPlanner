// Importamos Express y el router
import express from 'express';

// Importamos los controladores para manejar las peticiones
import { getProyectos, getProyectosRed, postProyecto, putProyecto, deleteProyecto } from '../controllers/proyectoController.js';

// Inicializamos el router de Express
const router = express.Router();


/*  Ruta GET /api/proyectos */
router.get('/', getProyectos);  /* Obtiene todos los proyectos con información de topógrafo y empresa. */


/*  Ruta GET /api/proyectos */
router.get('/red', getProyectosRed);  /* Obtiene todos los proyectos con información de topógrafo y empresa. */


/*  Ruta POST /api/proyectos */
router.post('/', postProyecto); /*  Crea un nuevo proyecto y genera su estructura de carpetas en el sistema.*/
/*  Requiere en el cuerpo de la solicitud: { nombre_proyecto, fecha_creacion, radio_busqueda, _id_topografo, _id_empresa, nombre_empresa } */


/*  Ruta PUT /api/proyectos */
router.put('/:id', putProyecto);  /* Modifica los datos del proyecto a excepcion de la empresa y la fehca de creación*/

// Exportamos el router para usarlo en el archivo principal de rutas
export default router;

/* Ruta DELETE /api/proyectos */
router.delete('/:id', deleteProyecto)