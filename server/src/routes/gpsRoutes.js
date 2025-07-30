// src\routes\gpsRoutes.js

// Importamos Router de express para crear rutas individuales
import { Router } from 'express';

// Importamos las funciones del controlador que creamos
import { postGpsBase } from '../controllers/gpsController.js';

// Creamos una instancia de router (mini servidor)
const router = Router();

/* --------------------------------------------------------------
  Definimos las rutas para el recurso GPS:

  GET     /api/empresas        → obtener todas las empresas
  POST    /api/empresas        → crear nueva empresa
  PUT     /api/empresas/:id    → actualizar empresa por ID
  DELETE  /api/empresas/:id    → eliminar empresa por ID
-----------------------------------------------------------------*/

// Ruta para crear una nueva empresa
router.post('/', postGpsBase);


// Exportamos este router para que sea usado en routes/index.js
export default router;
