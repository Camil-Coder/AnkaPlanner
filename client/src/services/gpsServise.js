import axios from 'axios';

const API_URL = 'http://192.168.1.11:3000/api/gps';

export const obtenerGpsBase = async (idDiaRastreo) => {
  try {
    const response = await axios.get(`${API_URL}/${idDiaRastreo}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener GPS Base:', error);
    throw error;
  }
};

export const crearGpsBase = async (formData) => {
  try {
    const response = await axios.post(API_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al crear GPS base:', error);
    throw error;
  }
};
