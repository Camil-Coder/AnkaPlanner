// src\routes\empresaRoutes.js

// Importamos Router de express para crear rutas individuales
import { Router } from 'express';

// Importamos las funciones del controlador que creamos
import { getOneEmpresa, getEmpresas, postEmpresa, putEmpresa, deleteEmpresa} from '../controllers/empresaController.js';

// Creamos una instancia de router (mini servidor)
const router = Router();

/* --------------------------------------------------------------
  Definimos las rutas para el recurso EMPRESA:

  GET     /api/empresas        → obtener todas las empresas
  POST    /api/empresas        → crear nueva empresa
  PUT     /api/empresas/:id    → actualizar empresa por ID
  DELETE  /api/empresas/:id    → eliminar empresa por ID
-----------------------------------------------------------------*/

// Ruta para obtene solo una sola emrpesa
router.get('/:id',getOneEmpresa)

// Ruta para obtener todas las empresas
router.get('/', getEmpresas);

// Ruta para crear una nueva empresa
router.post('/', postEmpresa);

// Ruta para actualizar una empresa por ID
router.put('/:id', putEmpresa);

// Ruta para eliminar una empresa por ID
router.delete('/:id', deleteEmpresa);

// Exportamos este router para que sea usado en routes/index.js
export default router;
