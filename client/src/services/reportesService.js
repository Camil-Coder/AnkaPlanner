// C:\BotAuto-Full\client\src\services\reportesService.js
import axios from 'axios';

const API_URL = 'http://192.168.1.11:3000/api/reportes';


// -------------------------------------------------------------
// Consultar diferencias por id_dia_rastreo
// -------------------------------------------------------------
export const consultarDiferencias = async (id_dia_rastreo) => {
  try {
    const response = await axios.get(`${API_URL}/${id_dia_rastreo}`, {
      responseType: 'blob', // ⚠️ importante: para manejar archivos binarios (CSV, XLSX, etc.)
    });

    // Si el backend responde con JSON vacío { data: null }
    // lo tratamos como "sin archivo"
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('application/json')) {
      const text = await response.data.text();
      const json = JSON.parse(text);
      return json.data; // null
    }

    // Si es un archivo, devolvemos el blob para que el front decida descargarlo
    return response.data;
  } catch (error) {
    console.error('Error al consultar diferencias:', error);
    throw error;
  }
};



// -------------------------------------------------------------
// Guardar reportes (envío de archivos)
// -------------------------------------------------------------
export const guardarReportes = async (formData) => {
  try {
    const response = await axios.post(API_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Error al guardar reportes:', error);
    throw error;
  }
};