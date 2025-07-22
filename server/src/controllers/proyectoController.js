// src/controllers/proyectoController.js
import { obtenerProyectos } from '../models/proyectoModel.js';

export const getProyectos = async (req, res) => {
  try {
    const proyectos = await obtenerProyectos();
    res.status(200).json(proyectos);
  } catch (error) {
    console.error('Error al obtener proyectos:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};





/* // src/controllers/proyectoController.js

import { crearProyecto, obtenerProyectos, actualizarProyecto, eliminarProyecto } from '../models/proyectoModel.js';
import { execFile } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const execFileAsync = promisify(execFile);

// Obtener todos los proyectos
export const getProyectos = async (req, res) => {
  try {
    const proyectos = await obtenerProyectos();
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los proyectos' });
  }
};

// Crear un nuevo proyecto
export const postProyecto = async (req, res) => {
    try {
      const { nombre, fecha, radio, id_topografo, id_empresa } = req.body;
  
      const rutaPython = './src/utils_python/generar_estructura.py'; // ← ruta ajustada
      const rutaBase = process.env.RUTA_DISCO_BASE;
  
      const { stdout } = await execFileAsync('python', [
        rutaPython,
        rutaBase,
        id_empresa.toString(),
        nombre
      ]);
  
      const rutaProyecto = stdout.trim();
  
      const nuevoId = await crearProyecto({
        nombre,
        fecha,
        ruta: rutaProyecto,
        radio,
        id_topografo,
        id_empresa
      });
  
      res.status(201).json({ id: nuevoId, nombre, ruta: rutaProyecto });
    } catch (error) {
      console.error('Error al crear proyecto:', error);
      res.status(500).json({ error: 'Error al crear el proyecto' });
    }
  }; */