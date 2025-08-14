import axios from 'axios';

const API = 'http://192.168.1.11:3000/api/diaRastreo';

export const obtenerDiasRastreos = async (id) => {
  const res = await axios.get(`${API}/${id}`); // ← aquí se concatena el id
  return res.data;
};


// Función para crear un nuevo día de rastreo
export const crearDiaRastreo = async ({ nombre, id_proyecto }) => {
  try {
    const response = await axios.post(API, {
      nombre_dia: nombre,
      id_proyecto: id_proyecto
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear día de rastreo:', error);
    throw error;
  }
};