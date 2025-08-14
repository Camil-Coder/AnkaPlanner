// 1. Importamos las funciones del modelo de Topografo
// Estas funciones son las que realmente interactúan con la base de datos
import { obtenerTopografo, crearTopografo, actualizarTopografo, eliminarTopografo, } from '../models/topografoModel.js';


// 2. Controlador para obtener todas los Topografos (GET /api/Topografo)
export const getTopografo = async (req, res) => {
    try {
        // Llama a la función que hace el SELECT * FROM Topografo
        const Topografo = await obtenerTopografo();

        // Devuelve las Topografo como respuesta en formato JSON
        res.json(Topografo);
    } catch (error) {
        // Si hay un error en la base de datos u otra parte, lo atrapamos aquí
        res.status(500).json({ error: 'Error al obtener el Topografo' });
    }
};


// 3. Controlador para crear una nuevo Topografo (POST /api/Topografo)
export const postTopografo = async (req, res) => {
    try {
        // Obtenemos el nombre enviado por el cliente en el cuerpo del request
        const { nombre } = req.body;

        // Llamamos a la función que hace el INSERT INTO Topografo
        const id = await crearTopografo(nombre);

        // Respondemos con el nuevo ID y nombre creado
        res.status(201).json({ id, nombre });
    } catch (error) {
        // Capturamos y respondemos cualquier error
        res.status(500).json({ error: 'Error al crear el Topografo' });
    }
};


// 4. Controlador para actualizar un Topografo existente (PUT /api/Topografo/:id)
export const putTopografo = async (req, res) => {
    try {
        // Tomamos el ID de la URL, por ejemplo /api/Topografo/3 → id = 3
        const { id } = req.params;

        // Tomamos el nuevo nombre del cuerpo del request
        const { nombre } = req.body;

        // Llamamos a la función que hace el UPDATE
        const resultado = await actualizarTopografo(id, nombre);

        // Si no se modificó ninguna fila, es porque no se encontró la Topografo
        if (resultado === 0) {
            res.status(404).json({ error: 'Topografo no encontrado' });
        } else {
            // Respondemos con los datos actualizados
            res.json({ id, nombre });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el Topografo' });
    }
};


// Controlador: “elimina” renombrando
export const deleteTopografo = async (req, res) => {
    try {
      const { id } = req.params;
      const resultado = await eliminarTopografo(id);
  
      if (resultado === 0) {
        return res.status(404).json({ error: 'Topógrafo no encontrado' });
      }
      res.json({ mensaje: 'Topógrafo marcado como eliminado' });
    } catch (error) {
      res.status(500).json({ error: 'Error al marcar como eliminado al topógrafo' });
    }
  };
  