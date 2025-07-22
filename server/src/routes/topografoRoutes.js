// Importamos Router de express para crear rutas individuales
import { Router } from 'express';

// Importamos las funciones del controlador que creamos
import {getTopografo,postTopografo,putTopografo,deleteTopografo} from '../controllers/topografoController.js';

// Creamos una instancia de router (mini servidor)
const router = Router();

/* 
  Definimos las rutas para el recurso EMPRESA:

  GET     /api/topografo        → obtener todas las topografo
  POST    /api/topografo        → crear nueva empresa
  PUT     /api/topografo/:id    → actualizar empresa por ID
  DELETE  /api/topografo/:id    → eliminar empresa por ID
*/

// Ruta para obtener todas los Topografo
router.get('/', getTopografo);

// Ruta para crear un nuevo Topografo
router.post('/', postTopografo);

// Ruta para actualizar un Topografo por ID
router.put('/:id', putTopografo);

// Ruta para eliminar un Topografo por ID
router.delete('/:id', deleteTopografo);

// Exportamos este router para que sea usado en routes/index.js
export default router;
