// Importamos Express para crear el servidor
import express from 'express';

// Importamos CORS para permitir peticiones desde otros orígenes (como desde un frontend)
import cors from 'cors';

// Importamos dotenv para leer las variables del archivo .env
import dotenv from 'dotenv';

// Importamos la conexión a la base de datos (aunque aún no la usamos activamente aquí)
import { db } from './config/db.js';

// Importamos el enrutador principal (donde estarán nuestras rutas)
import router from './routes/index.js';

// Cargamos las variables de entorno desde el archivo .env
dotenv.config();

// Creamos una instancia de Express
const app = express();

// Activamos CORS como middleware para que se puedan hacer peticiones desde otros dominios
app.use(cors());

// Middleware para que el servidor pueda leer JSON en los cuerpos de las solicitudes
app.use(express.json());

// Registramos las rutas que comienzan por /api
app.use('/api', router);

// Definimos el puerto del servidor (puede venir del .env o usar 3000 por defecto)
const PORT = process.env.PORT || 3000;

// Encendemos el servidor en el puerto definido y mostramos un mensaje en consola
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/api`);
});
