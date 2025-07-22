// src/routes/proyectoRoutes.js
import express from 'express';
import { getProyectos } from '../controllers/proyectoController.js';

const router = express.Router();

// Ruta: GET /proyectos
router.get('/', getProyectos);

export default router;














/* // src/routes/proyectoRoutes.js

// Importamos Router de Express
import { Router } from 'express';

// Importamos las funciones del controlador de proyecto
import {
  getProyectos,
  postProyecto
  // Puedes agregar luego putProyecto, deleteProyecto si los implementas
} from '../controllers/proyectoController.js';

// Creamos una instancia del enrutador
const router = Router();

/*
  Rutas disponibles:

  GET    /api/proyectos       → obtener todos los proyectos
  POST   /api/proyectos       → crear un nuevo proyecto
*/
/*
// Ruta para obtener todos los proyectos
router.get('/', getProyectos);

// Ruta para crear un nuevo proyecto
router.post('/', postProyecto);

// Exportamos el router para conectarlo en index.js
export default router;
*/