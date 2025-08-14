// src/services/topografoService.js
import axios from 'axios';

// Mejor manejar la URL base con variable de entorno si se despliega en otro lado
const API = 'http://192.168.1.11:3000/api/topografos';

/**
 * Obtener la lista de topógrafos
 * @returns {Promise<Array>} Lista de topógrafos [{ID_TOPOGRAFO, NOMBRE_TOPOGRAFO}, ...]
 */
export const obtenerTopografos = async () => {
  try {
    const res = await axios.get(API);
    return res.data;
  } catch (error) {
    console.error('Error al obtener topógrafos:', error);
    throw error;
  }
};

/**
 * Crear un nuevo topógrafo
 * @param {string} nombre - Nombre del topógrafo
 * @returns {Promise<Object>} Topógrafo creado
 */
export const crearTopografo = async (nombre) => {
  try {
    const res = await axios.post(API, { nombre });
    return res.data;
  } catch (error) {
    console.error('Error al crear topógrafo:', error);
    throw error;
  }
};

/**
 * Actualizar un topógrafo existente
 * @param {number|string} id - ID del topógrafo
 * @param {string} nombre - Nuevo nombre
 * @returns {Promise<Object>} Topógrafo actualizado
 */
export const actualizarTopografo = async (id, nombre) => {
  try {
    const res = await axios.put(`${API}/${id}`, { nombre });
    return res.data;
  } catch (error) {
    console.error('Error al actualizar topógrafo:', error);
    throw error;
  }
};

/**
 * Marcar un topógrafo como eliminado (renombrar con -eliminado)
 * @param {number|string} id - ID del topógrafo
 * @returns {Promise<Object>} Respuesta del backend
 */
export const eliminarTopografo = async (id) => {
  try {
    const res = await axios.delete(`${API}/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error al eliminar topógrafo:', error);
    throw error;
  }
};
