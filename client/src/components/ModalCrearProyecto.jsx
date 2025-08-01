// 🔹 1. IMPORTACIONES
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { obtenerTopografos } from '../services/topografosService';
import { obtenerEmpresas } from '../services/empresasService';
import { crearProyecto } from '../services/proyectoService';

// 🔹 2. COMPONENTE PRINCIPAL
const ModalCrearProyecto = ({ show, handleClose, refrescarProyectos }) => {
    const [nombre, setNombre] = useState('');
    const [radio, setRadio] = useState('');
    const [topografos, setTopografos] = useState([]);
    const [empresas, setEmpresas] = useState([]);
    const [topografoId, setTopografoId] = useState('');
    const [empresaId, setEmpresaId] = useState('');
    const [error, setError] = useState('');
    const [enviado, setEnviado] = useState(false);

    const fechaHoy = new Date().toISOString().split('T')[0];

    // 🔹 Cargar topógrafos y empresas al abrir el modal
    useEffect(() => {
        if (!show) return;
        const cargar = async () => {
            try {
                const t = await obtenerTopografos();
                const e = await obtenerEmpresas();
                setTopografos(t);
                setEmpresas(e);
            } catch (err) {
                console.error('Error al cargar datos:', err);
            }
        };
        cargar();
    }, [show]);

    // 🔹 Enviar el formulario
    const handleSubmit = async () => {
        setError('');

        if (!nombre || !radio || !topografoId || !empresaId) {
            setError('Por favor completa todos los campos');
            return;
        }

        if (radio < 80 || radio > 250) {
            setError('El radio debe estar entre 80 y 250');
            return;
        }

        const body = {
            nombre_proyecto: nombre,
            fecha_creacion: fechaHoy,
            radio_busqueda: parseInt(radio),
            _id_topografo: parseInt(topografoId),
            _id_empresa: parseInt(empresaId)
        };

        try {
            await crearProyecto(body);
            await refrescarProyectos(); // ✅ Refresca la tabla inmediatamente

            setEnviado(true);
            setTimeout(() => {
                setEnviado(false);
                reiniciarFormulario();
                handleClose();
            }, 800); // ⏱️ menos espera, más fluidez
        } catch (err) {
            console.error(err);
            setError('Error al crear el proyecto');
        }
    };

    const reiniciarFormulario = () => {
        setNombre('');
        setRadio('');
        setTopografoId('');
        setEmpresaId('');
        setError('');
        setEnviado(false);
    };

    return (
        <Modal show={show} onHide={() => { reiniciarFormulario(); handleClose(); }}>
            <Modal.Header closeButton>
                <Modal.Title>Crear Proyecto</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {enviado && <Alert variant="success">Proyecto creado con éxito</Alert>}

                <Form>
                    <Form.Group>
                        <Form.Label>Nombre del Proyecto</Form.Label>
                        <Form.Control
                            type="text"
                            value={nombre}
                            placeholder='Ej: 2507-ZONA'
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </Form.Group>

                    <Form.Group className="mt-2">
                        <Form.Label>Radio de Búsqueda (80-250)</Form.Label>
                        <Form.Control
                            type="number"
                            value={radio}
                            onChange={(e) => setRadio(e.target.value)}
                            min="80"
                            max="250"
                        />
                    </Form.Group>

                    <Form.Group className="mt-2">
                        <Form.Label>Topógrafo</Form.Label>
                        <Form.Select value={topografoId} onChange={(e) => setTopografoId(e.target.value)}>
                            <option value="">Seleccione</option>
                            {topografos.map(t => (
                                <option key={t.ID_TOPOGRAFO} value={t.ID_TOPOGRAFO}>
                                    {t.NOMBRE_TOPOGRAFO}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mt-2">
                        <Form.Label>Empresa</Form.Label>
                        <Form.Select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)}>
                            <option value="">Seleccione</option>
                            {empresas.map(e => (
                                <option key={e.ID_EMPRESA} value={e.ID_EMPRESA}>
                                    {e.NOMBRE_EMPRESA}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="danger" onClick={() => { reiniciarFormulario(); handleClose(); }}>
                    Cancelar
                </Button>
                <Button style={{ backgroundColor: '#F47C27', border: 'none' }} onClick={handleSubmit}>
                    Crear Proyecto
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalCrearProyecto;
