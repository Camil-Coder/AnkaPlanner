// ModalGestionEmpresas.js
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Modal, Table, Button, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { obtenerEmpresas, crearEmpresa } from '../services/empresasService';


const normalizar = (s) =>
  (s ?? '')
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();

const ModalGestionEmpresas = ({ show, onHide, refrescarProyectos }) => {
  // Estado: lista y flags de proceso
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Estado: creación
  const [nuevoNombre, setNuevoNombre] = useState(''); // siempre almacenaremos MAYÚSCULAS
  const [creando, setCreando] = useState(false);

  // Cualquier acción en curso -> muestra animación
  const procesando = useMemo(() => cargando || creando, [cargando, creando]);

  // Carga de empresas desde el servicio
  const cargar = useCallback(async () => {
    try {
      setError('');
      setCargando(true);
      const data = await obtenerEmpresas(); // retorna [{ID_EMPRESA, NOMBRE_EMPRESA}, ...]
      setLista(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('No se pudo cargar la lista de empresas.');
      Swal.fire({
        icon: 'error',
        title: 'Error al cargar',
        text: 'No se pudo cargar la lista de empresas.',
      });
    } finally {
      setCargando(false);
    }
  }, []);

  // Cuando el modal se abre, cargamos
  useEffect(() => {
    if (show) cargar();
  }, [show, cargar]);

  // Limpiar estados y cerrar
  const resetEstados = () => {
    setNuevoNombre('');
    setError('');
  };

  const cerrar = () => {
    resetEstados();
    onHide?.();
    refrescarProyectos?.(); // si quieres refrescar la tabla principal
  };

  // Verificación de duplicados (case/espacios/acentos-insensitive)
  const existeNombre = (nombrePlano) => {
    const target = normalizar(nombrePlano);
    return lista.some((e) => normalizar(e.NOMBRE_EMPRESA) === target);
  };

  // Crear empresa
  const onCrear = async () => {
    // Normalizamos a MAYÚSCULAS
    const nombreNormalizado = normalizar(nuevoNombre);

    // Validación: obligatorio
    if (!nombreNormalizado) {
      Swal.fire({
        icon: 'warning',
        title: 'Nombre requerido',
        text: 'Escribe el nombre de la empresa.',
      });
      return;
    }

    // Validación: duplicado
    if (existeNombre(nombreNormalizado)) {
      Swal.fire({
        icon: 'info',
        title: 'Nombre duplicado',
        text: `La empresa "${nombreNormalizado}" ya está registrada.`,
      });
      return;
    }

    try {
      setCreando(true);
      // Enviamos al backend en MAYÚSCULA
      await crearEmpresa(nombreNormalizado);
      // Recargamos la lista por si hay lógica en el backend
      await cargar();

      // Mensaje de éxito y cierre del modal
      setTimeout(() => {
        Swal.fire({
          icon: 'success',
          title: 'Empresa creada',
          text: `"${nombreNormalizado}" se creó correctamente.`,
          showConfirmButton: false,
          timer: 1200,
        });
        setCreando(false);
        cerrar(); // 👈 cerrar automáticamente
      }, 500);
    } catch (e) {
      setCreando(false);
      setError('No se pudo crear la empresa.');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e?.response?.data?.message ?? 'No se pudo crear la empresa.',
      });
    }
  };

  // Enter para crear
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !creando && nuevoNombre.trim()) {
      onCrear();
    }
  };

  return (
    <Modal show={show} onHide={cerrar} centered size="md" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Gestión de empresas</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Errores de carga u operación */}
        {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

        {/* Vista de procesamiento con Lottie */}
        {procesando ? (
          <div className="d-flex flex-column align-items-center justify-content-center text-center py-3">
            <DotLottieReact
              src="https://lottie.host/d9b46d70-8e00-4356-9307-6152c917c64b/iMuNvyZS6n.lottie"
              autoplay
              loop
              style={{ height: 180, width: 180 }}
            />
            <p className="mt-3">
              {cargando && 'Cargando empresas...'}
              {creando && 'Creando empresa...'}
            </p>
          </div>
        ) : (
          <>
            {/* Crear nueva empresa */}
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Nombre de la empresa"
                value={nuevoNombre}
                // Forzamos MAYÚSCULAS mientras escribe
                onChange={(e) => setNuevoNombre(normalizar(e.target.value))}
                onKeyDown={handleKeyDown}
                disabled={creando}
              />
              <Button
                // Si usas un tema propio, cambia este estilo por una clase/variant
                style={{ backgroundColor: '#F47C27', border: 'none' }}
                onClick={onCrear}
                disabled={creando || !nuevoNombre.trim()}
              >
                {creando ? <Spinner animation="border" size="sm" /> : 'Crear empresa'}
              </Button>
            </InputGroup>

            {/* Tabla de empresas */}
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th style={{ width: 80 }}>#</th>
                  <th>Nombre empresa</th>
                </tr>
              </thead>
              <tbody>
                {lista.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center">Sin registros</td>
                  </tr>
                ) : (
                  lista
                    // Orden opcional alfabético por nombre
                    .slice()
                    .sort((a, b) => normalizar(a.NOMBRE_EMPRESA).localeCompare(normalizar(b.NOMBRE_EMPRESA)))
                    .map((e, idx) => (
                      <tr key={e.ID_EMPRESA}>
                        <td>{idx + 1}</td>
                        <td>{e.NOMBRE_EMPRESA ?? '-'}</td>
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
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalGestionEmpresas;
