// ModalGestionTopografos.js
import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Table, Button, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import {
  obtenerTopografos,
  crearTopografo,
  actualizarTopografo,
  eliminarTopografo
} from '../services/topografosService';

const ModalGestionTopografos = ({ show, onHide, refrescarProyectos }) => {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Crear
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [creando, setCreando] = useState(false);

  // Editar
  const [editandoId, setEditandoId] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [guardandoId, setGuardandoId] = useState(null);

  // Eliminar (borrado lógico)
  const [eliminandoId, setEliminandoId] = useState(null);

  // Cualquier acción en proceso -> muestra animación
  const procesando = useMemo(
    () => cargando || creando || guardandoId !== null || eliminandoId !== null,
    [cargando, creando, guardandoId, eliminandoId]
  );

  const cargar = async () => {
    try {
      setCargando(true);
      setError('');
      const data = await obtenerTopografos();
      const activos = (data || []).filter(
        (t) => !String(t.NOMBRE_TOPOGRAFO || '').toLowerCase().endsWith('-eliminado')
      );
      setLista(activos);
    } catch (e) {
      setError('No se pudo cargar la lista.');
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar',
        text: 'No se pudo cargar la lista de topógrafos.'
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (show) cargar();
  }, [show]);

  const resetEstados = () => {
    setNuevoNombre('');
    setEditandoId(null);
    setEditNombre('');
    setGuardandoId(null);
    setEliminandoId(null);
    setError('');
  };

  const cerrar = () => {
    resetEstados();
    onHide?.();
    refrescarProyectos?.();
  };

  const onCrear = async () => {
    const nombre = nuevoNombre.trim();
    if (!nombre) {
      Swal.fire({
        icon: 'warning',
        title: 'Nombre requerido',
        text: 'Escribe el nombre del topógrafo.'
      });
      return;
    }
    try {
      setCreando(true);
      await crearTopografo(nombre);
      setNuevoNombre('');
      await cargar();
      setTimeout(() => {
        Swal.fire({
          icon: 'success',
          title: 'Topógrafo creado',
          showConfirmButton: false,
          timer: 1200
        });
        setCreando(false);
      }, 800); // breve pausa para lucir la animación
    } catch {
      setCreando(false);
      setError('No se pudo crear el topógrafo.');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el topógrafo.'
      });
    }
  };

  const iniciarEdicion = (t) => {
    setEditandoId(t.ID_TOPOGRAFO);
    setEditNombre(t.NOMBRE_TOPOGRAFO);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditNombre('');
  };

  const guardarEdicion = async (id) => {
    const nombre = editNombre.trim();
    if (!nombre) {
      Swal.fire({
        icon: 'warning',
        title: 'Nombre requerido',
        text: 'El nombre no puede estar vacío.'
      });
      return;
    }
    try {
      setGuardandoId(id);
      await actualizarTopografo(id, nombre);
      setEditandoId(null);
      setEditNombre('');
      await cargar();
      setTimeout(() => {
        Swal.fire({
          icon: 'success',
          title: 'Cambios guardados',
          showConfirmButton: false,
          timer: 1200
        });
        setGuardandoId(null);
      }, 600);
    } catch {
      setGuardandoId(null);
      setError('No se pudo actualizar el topógrafo.');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el topógrafo.'
      });
    }
  };

  const onEliminar = async (t) => {
    const { isConfirmed } = await Swal.fire({
      icon: 'question',
      title: '¿Marcar como eliminado?',
      text: `Se marcará como eliminado a "${t.NOMBRE_TOPOGRAFO}".`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!isConfirmed) return;

    try {
      setEliminandoId(t.ID_TOPOGRAFO);
      await eliminarTopografo(t.ID_TOPOGRAFO); // backend renombra con "-eliminado"
      await cargar();
      setTimeout(() => {
        Swal.fire({
          icon: 'success',
          title: 'Topógrafo eliminado',
          showConfirmButton: false,
          timer: 1200
        });
        setEliminandoId(null);
      }, 600);
    } catch {
      setEliminandoId(null);
      setError('No se pudo eliminar (marcar) el topógrafo.');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar (marcar) el topógrafo.'
      });
    }
  };

  return (
    <Modal show={show} onHide={cerrar} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>Gestión de topógrafos</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

        {procesando ? (
          <div className="d-flex flex-column align-items-center justify-content-center text-center py-3">
            <DotLottieReact
              src="https://lottie.host/d9b46d70-8e00-4356-9307-6152c917c64b/iMuNvyZS6n.lottie"
              autoplay
              loop
              style={{ height: 180, width: 180 }}
            />
            <p className="mt-3">
              {cargando && 'Cargando topógrafos...'}
              {creando && 'Creando topógrafo...'}
              {guardandoId !== null && 'Guardando cambios...'}
              {eliminandoId !== null && 'Eliminando topógrafo...'}
            </p>
          </div>
        ) : (
          <>
            {/* Crear nuevo */}
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Nombre del topógrafo"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                disabled={creando}
              />
              <Button style={{ backgroundColor: '#F47C27', border: 'none' }} onClick={onCrear} disabled={creando}>
                {creando ? <Spinner animation="border" size="sm" /> : 'Crear topógrafo'}
              </Button>
            </InputGroup>

            {/* Tabla */}
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Nombre topógrafo</th>
                  <th style={{ width: 150, textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {lista.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center">Sin registros</td>
                  </tr>
                ) : (
                  lista.map((t) => (
                    <tr key={t.ID_TOPOGRAFO}>
                      <td>
                        {editandoId === t.ID_TOPOGRAFO ? (
                          <Form.Control
                            value={editNombre}
                            onChange={(e) => setEditNombre(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          t.NOMBRE_TOPOGRAFO
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {editandoId === t.ID_TOPOGRAFO ? (
                          <>
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="me-2"
                              title="Guardar"
                              onClick={() => guardarEdicion(t.ID_TOPOGRAFO)}
                              disabled={guardandoId === t.ID_TOPOGRAFO}
                            >
                              {guardandoId === t.ID_TOPOGRAFO ? <Spinner animation="border" size="sm" /> : '💾'}
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              title="Cancelar"
                              onClick={cancelarEdicion}
                            >
                              ↩️
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              title="Actualizar"
                              onClick={() => iniciarEdicion(t)}
                            >
                              ✏️
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              title="Eliminar"
                              onClick={() => onEliminar(t)}
                              disabled={eliminandoId === t.ID_TOPOGRAFO}
                            >
                              {eliminandoId === t.ID_TOPOGRAFO ? <Spinner animation="border" size="sm" /> : '🗑️'}
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="danger" onClick={cerrar} disabled={procesando}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalGestionTopografos;
