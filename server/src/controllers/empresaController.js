// 1. Importamos las funciones del modelo de empresa
// Estas funciones son las que realmente interactúan con la base de datos
import { obtenerEmpresas, crearEmpresa, actualizarEmpresa, eliminarEmpresa, } from '../models/empresaModel.js';


// 2. Controlador para obtener todas las empresas (GET /api/empresas)
export const getEmpresas = async (req, res) => {
    try {
        // Llama a la función que hace el SELECT * FROM EMPRESA
        const empresas = await obtenerEmpresas();

        // Devuelve las empresas como respuesta en formato JSON
        res.json(empresas);
    } catch (error) {
        // Si hay un error en la base de datos u otra parte, lo atrapamos aquí
        res.status(500).json({ error: 'Error al obtener las empresas' });
    }
};


// 3. Controlador para crear una nueva empresa (POST /api/empresas)
export const postEmpresa = async (req, res) => {
    try {
        // Obtenemos el nombre enviado por el cliente en el cuerpo del request
        const { nombre } = req.body;

        // Llamamos a la función que hace el INSERT INTO EMPRESA
        const id = await crearEmpresa(nombre);

        // Respondemos con el nuevo ID y nombre creado
        res.status(201).json({ id, nombre });
    } catch (error) {
        // Capturamos y respondemos cualquier error
        res.status(500).json({ error: 'Error al crear la empresa' });
    }
};


// 4. Controlador para actualizar una empresa existente (PUT /api/empresas/:id)
export const putEmpresa = async (req, res) => {
    try {
        // Tomamos el ID de la URL, por ejemplo /api/empresas/3 → id = 3
        const { id } = req.params;

        // Tomamos el nuevo nombre del cuerpo del request
        const { nombre } = req.body;

        // Llamamos a la función que hace el UPDATE
        const resultado = await actualizarEmpresa(id, nombre);

        // Si no se modificó ninguna fila, es porque no se encontró la empresa
        if (resultado === 0) {
            res.status(404).json({ error: 'Empresa no encontrada' });
        } else {
            // Respondemos con los datos actualizados
            res.json({ id, nombre });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la empresa' });
    }
};


// 5. Controlador para eliminar una empresa (DELETE /api/empresas/:id)
export const deleteEmpresa = async (req, res) => {
    try {
        // Tomamos el ID desde los parámetros de la URL
        const { id } = req.params;

        // Llamamos al modelo para eliminar la empresa
        const resultado = await eliminarEmpresa(id);

        // Si no se eliminó nada, es porque no se encontró la empresa
        if (resultado === 0) {
            res.status(404).json({ error: 'Empresa no encontrada' });
        } else {
            // Si fue exitoso, devolvemos un mensaje de confirmación
            res.json({ mensaje: 'Empresa eliminada correctamente' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la empresa' });
    }
};
