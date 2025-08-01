// src/services/empresaService.js
import axios from 'axios';

const API = 'http://192.168.1.11:3000/api/empresas/';

export const obtenerEmpresas = async () => {
  const res = await axios.get(API);
  return res.data;
};
