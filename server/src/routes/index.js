// src/routes/index.js

// Importamos Router de Express para crear un agrupador de rutas
import { Router } from 'express';

// Importamos cada grupo de rutas por módulo
import empresaRoutes from './empresaRoutes.js';
import topografoRoutes from './topografoRoutes.js';
import proyectoRoutes from './proyectoRoutes.js';
import diaRastreoRoutes from './diaRastreoRoutes.js'
import gpsRoutes from './gpsRoutes.js'
import reportesRoutes from './reportesRoutes.js'

// Creamos una instancia del enrutador principal
const router = Router();

/* Ruta raíz: GET /api/ */
router.get('/', (req, res) => {
  res.send('API funcionando correctamente 🚀');
});

/* Ruta: /api/empresas */
router.use('/empresas', empresaRoutes);

/* Ruta: /api/topografos */
router.use('/topografos', topografoRoutes);

/* Ruta: /api/proyectos */
router.use('/proyectos', proyectoRoutes);

/* Ruta: /api/diaRastreos */
router.use('/diaRastreo', diaRastreoRoutes);

/* Ruta: /api/gps */
router.use('/gps', gpsRoutes);

/* Ruta: /api/reportes */
router.use('/reportes', reportesRoutes);

// Exportamos este router principal para usarlo en app.js
export default router;
