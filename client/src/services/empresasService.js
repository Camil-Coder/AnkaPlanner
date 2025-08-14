// src/services/empresaService.js
import axios from 'axios';

const API = 'http://192.168.1.11:3000/api/empresas/';

export const obtenerEmpresas = async () => {
  const res = await axios.get(API);
  return res.data;
};


export const crearEmpresa = async (nombre) => {
  try {
    const res = await axios.post(API, { nombre });
    return res.data;
  } catch (error) {
    console.error('Error al crear empresa:', error);
    throw error;
  }
};