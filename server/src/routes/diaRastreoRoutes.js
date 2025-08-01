// Importamos Router de express para crear rutas individuales
import { Router } from 'express';

// Importamos las funciones del controlador que creamos
import { postDiaRastreo, getDiaRastreo } from '../controllers/diaRastreoController.js';

// Creamos una instancia de router (mini servidor)
const router = Router();

/* 
  Definimos las rutas para el recurso DIA_RASTREO:
  POST    /api/dias-rastreo     → crear nuevo día de rastreo
*/

// Ruta para crear un nuevo día de rastreo
router.post('/', postDiaRastreo);


// Ruta para obtene los dias ratreos referente aun proyecto
router.get('/:id', getDiaRastreo)


// Exportamos este router para que sea usado en routes/index.js
export default router;
