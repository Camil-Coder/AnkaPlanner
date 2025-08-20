// src/services/proyectoService.js
import axios from 'axios';

const API = 'http://192.168.1.11:3000/api/proyectos';


// Solo ajustar esta función:
export const actualizarProyecto = async (id, data = {}) => {
  //id del proyecto
  // Acepta tanto snake_case como MAYÚSCULAS desde el front
  const fecha_creacion = data.fecha_creacion ?? data.FECHA_CREACION;
  const radio_busqueda = data.radio_busqueda ?? data.RADIO_BUSQUEDA;
  const estado_red     = data.estado_red     ?? data.ESTADO_RED;
  const estado_geo     = data.estado_geo     ?? data.ESTADO_GEO;

  const payload = {};
  if (fecha_creacion !== undefined) payload.fecha_creacion = fecha_creacion;
  if (radio_busqueda !== undefined) payload.radio_busqueda = radio_busqueda;
  if (estado_red !== undefined)     payload.estado_red     = estado_red;
  if (estado_geo !== undefined)     payload.estado_geo     = estado_geo;

  if (Object.keys(payload).length === 0) {
    throw new Error('Sin campos válidos: use radio_busqueda, estado_red, estado_geo.');
  }

  const res = await axios.put(`${API}/${id}`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
};


export const finalizarProyecto = async (id) => {
  const res = await axios.delete(`${API}/${id}`);
  return res.data;
}; 

export const crearProyecto = async (data) => {
  const res = await axios.post(API, data);
  return res.data;
};

export const obtenerProyectos = async () => {
  const res = await axios.get(API);
  return res.data;
};
