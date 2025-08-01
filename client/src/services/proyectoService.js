// src/services/proyectoService.js
import axios from 'axios';

const API = 'http://192.168.1.11:3000/api/proyectos';

export const crearProyecto = async (data) => {
  const res = await axios.post(API, data);
  return res.data;
};

export const obtenerProyectos = async () => {
  const res = await axios.get(API);
  return res.data;
};