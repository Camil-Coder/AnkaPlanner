// ModalModificarProyecto.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Swal from 'sweetalert2';
import { actualizarProyecto } from '../services/proyectoService';

const ModalModificarProyecto = ({ show, onHide, proyecto, onActualizado }) => {
    const [radio, setRadio] = useState('');
    const [enviando, setEnviando] = useState(false);

    // selects condicionales para estados
    const [estadoRedSel, setEstadoRedSel] = useState('');
    const [estadoGeoSel, setEstadoGeoSel] = useState('');

    useEffect(() => {
        if (proyecto) {
            setRadio(proyecto.RADIO_BUSQUEDA ?? '');
            setEstadoRedSel(proyecto.ESTADO_RED ?? '');
            setEstadoGeoSel(proyecto.ESTADO_GEO ?? '');
        } else {
            setRadio('');
            setEstadoRedSel('');
            setEstadoGeoSel('');
        }
    }, [proyecto]);

    // Topógrafo sin el sufijo "-eliminado"
    const topografoMostrar = useMemo(() => {
        if (!proyecto?.NOMBRE_TOPOGRAFO) return '';
        const t = proyecto.NOMBRE_TOPOGRAFO;
        return t.toLowerCase().endsWith('-eliminado') ? t.slice(0, -10) : t;
    }, [proyecto]);

    const fechaYMD = useMemo(() => {
        if (!proyecto?.FECHA_CREACION) return '';
        return new Date(proyecto.FECHA_CREACION).toISOString().split('T')[0];
    }, [proyecto]);

    // reglas: bloquea edición si contiene estas frases (insensible a mayúsculas)
    const bloquea = (txt) => {
        const t = (txt ?? '').toLowerCase();
        return t.includes('sin dias rastreos') || t.includes('sin días rastreos') || t.includes('sin gps');
    };
    const redDisponible = !bloquea(proyecto?.ESTADO_RED);
    const geoDisponible = !bloquea(proyecto?.ESTADO_GEO);

    const handleGuardar = async () => {
        const valor = Number(radio);
        if (Number.isNaN(valor) || valor < 80 || valor > 250) {
            Swal.fire('Radio inválido', 'El radio debe estar entre 80 y 250.', 'warning');
            return;
        }

        // ⬇️ usar snake_case como espera el servicio/back
        const payload = { radio_busqueda: valor };

        // Solo incluir estados si son modificables y cambiaron
        if (redDisponible && estadoRedSel && estadoRedSel !== (proyecto.ESTADO_RED ?? '')) {
            payload.estado_red = estadoRedSel;
        }
        if (geoDisponible && estadoGeoSel && estadoGeoSel !== (proyecto.ESTADO_GEO ?? '')) {
            payload.estado_geo = estadoGeoSel;
        }

        try {
            setEnviando(true);
            await actualizarProyecto(proyecto.ID_PROYECTO, payload);
            Swal.fire('Éxito', 'Cambios guardados correctamente.', 'success');
            onHide?.();
            onActualizado?.();
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se pudo actualizar el proyecto.', 'error');
        } finally {
            setEnviando(false);
        }
    };

    const handleFinalizarProyecto = async () => {
        try {
            setEnviando(true);
            // ⬇️ finalizar en snake_case
            await actualizarProyecto(proyecto.ID_PROYECTO, {
                estado_red: 'Finalizado',
                estado_geo: 'Finalizado',
            });
            Swal.fire('Proyecto finalizado', 'Ambos estados se marcaron como Finalizado.', 'success');
            onHide?.();
            onActualizado?.();
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'No se pudo finalizar el proyecto.', 'error');
        } finally {
            setEnviando(false);
        }
    };

    if (!proyecto) return null;

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Modificar proyecto</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {enviando ? (
                    // Loader
                    <div className="d-flex flex-column align-items-center justify-content-center text-center">
                        <DotLottieReact
                            src="https://lottie.host/d9b46d70-8e00-4356-9307-6152c917c64b/iMuNvyZS6n.lottie"
                            autoplay
                            loop
                            style={{ height: 200, width: 200 }}
                        />
                        <p className="mt-3">Guardando... 🚧</p>
                    </div>
                ) : (
                    <>
                        {/* Info solo lectura */}
                        <Row className="mb-2">
                            <Col sm={6}>
                                <Form.Group>
                                    <Form.Label>Nombre proyecto</Form.Label>
                                    <Form.Control value={proyecto.NOMBRE_PROYECTO} disabled />
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group>
                                    <Form.Label>Empresa</Form.Label>
                                    <Form.Control value={proyecto.NOMBRE_EMPRESA} disabled />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-2">
                            <Col sm={6}>
                                <Form.Group>
                                    <Form.Label>Topógrafo</Form.Label>
                                    <Form.Control value={topografoMostrar} disabled />
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group>
                                    <Form.Label>Fecha de creación</Form.Label>
                                    <Form.Control value={fechaYMD} disabled />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Estados: visibles pero deshabilitados */}
                        <Row className="mb-2">
                            <Col sm={6}>
                                <Form.Group>
                                    <Form.Label>Estado RedGeoScan</Form.Label>
                                    <Form.Control value={proyecto.ESTADO_RED} disabled />
                                </Form.Group>
                            </Col>
                            <Col sm={6}>
                                <Form.Group>
                                    <Form.Label>Estado Cambio de Época</Form.Label>
                                    <Form.Control value={proyecto.ESTADO_GEO} disabled />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Selects SOLO si son modificables */}
                        {redDisponible && (
                            <Row className="mb-2">
                                <Col sm={12}>
                                    <Form.Group>
                                        <Form.Label>Cambiar Estado RedGeoScan</Form.Label>
                                        <Form.Select
                                            value={estadoRedSel}
                                            onChange={(e) => setEstadoRedSel(e.target.value)}
                                        >
                                            <option>En Proceso</option>
                                            <option>Completo</option>
                                            <option>Finalizado</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}

                        {geoDisponible && (
                            <Row className="mb-3">
                                <Col sm={12}>
                                    <Form.Group>
                                        <Form.Label>Cambiar Estado Cambio de Época</Form.Label>
                                        <Form.Select
                                            value={estadoGeoSel}
                                            onChange={(e) => setEstadoGeoSel(e.target.value)}
                                        >
                                            <option>En Proceso</option>
                                            <option>Completo</option>
                                            <option>Finalizado</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}

                        {/* Único campo editable permanente */}
                        <Form.Group className="mt-3">
                            <Form.Label>Radio de búsqueda (m)</Form.Label>
                            <Form.Control
                                type="number"
                                min={1}
                                step={1}
                                value={radio}
                                onChange={(e) => setRadio(e.target.value)}
                                placeholder="Ingresa el nuevo radio"
                            />
                            <Form.Text className="text-muted">
                                Solo puedes editar Radio. Los estados se ven grises hasta que cumplas los pasos: Días Rastreos + 1 GPS (RedGeoScan) y Cartera FIX + Cartera Navegada (Cambio de Época).
                            </Form.Text>
                        </Form.Group>
                    </>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="danger" onClick={onHide} disabled={enviando}>
                    Cancelar
                </Button>

                {/* Botón Finalizar proyecto SOLO si ambos se pueden modificar */}
                {redDisponible && geoDisponible && (
                    <Button variant="success" onClick={handleFinalizarProyecto} disabled={enviando}>
                        Finalizar proyecto
                    </Button>
                )}

                <Button
                    style={{ backgroundColor: '#F47C27', border: 'none' }}
                    onClick={handleGuardar}
                    disabled={enviando}
                >
                    Guardar cambios
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalModificarProyecto;
