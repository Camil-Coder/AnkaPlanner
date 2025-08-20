// Importamos Express y el router
import express from 'express';

// Importamos los controladores para manejar las peticiones
import { postReportes, getDiferenciasPorDia } from '../controllers/reportesController.js';

// Inicializamos el router de Express
const router = express.Router();

/*  Ruta POST /api/reportes */
router.post('/', postReportes); 

/*  Ruta GET /api/reportes */
router.get('/:id', getDiferenciasPorDia); 

// Exportamos el router para usarlo en el archivo principal de rutas
export default router;

