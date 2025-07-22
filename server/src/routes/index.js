// Importamos el método Router de Express para crear un mini-servidor de rutas
import { Router } from 'express';

// Importamos las routes
import empresaRoutes from './empresaRoutes.js';
import topografoRoutes from './topografoRoutes.js';
import proyectoRoutes from './proyectoRoutes.js';


// Creamos una instancia del enrutador
const router = Router();

// Definimos una ruta GET en la raíz ('/') del grupo /api
// Cuando alguien acceda a http://localhost:3000/api/ va a ver este mensaje
router.get('/', (req, res) => {
  res.send('API funcionando correctamente 🚀'); // Respuesta simple para verificar que la API funciona
});

// Conectamos todas las rutas de empresa bajo /api/empresas
router.use('/empresas', empresaRoutes);

// Conectamos todas las rutas de empresa bajo /api/topografo
router.use('/topografos', topografoRoutes);

// Conectamos todas las rutas de empresa bajo /api/proyectos
router.use('/proyectos', proyectoRoutes);

// Exportamos el enrutador para que pueda ser usado en app.js
export default router;
