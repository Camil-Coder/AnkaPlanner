// src/services/topografoService.js
import axios from 'axios';

const API = 'http://192.168.1.11:3000/api/topografos';

export const obtenerTopografos = async () => {
  const res = await axios.get(API);
  return res.data;
};
