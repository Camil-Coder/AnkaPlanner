// 🔹 Importaciones necesarias para el funcionamiento del modal
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Swal from 'sweetalert2'; // Librería para mostrar alertas elegantes
import { DotLottieReact } from '@lottiefiles/dotlottie-react'; // Animación de carga mientras se guarda

// Servicios del backend para cargar topógrafos, empresas y guardar el proyecto
import { obtenerTopografos } from '../services/topografosService';
import { obtenerEmpresas } from '../services/empresasService';
import { crearProyecto } from '../services/proyectoService';

// Componente principal
const ModalCrearProyecto = ({ show, handleClose, refrescarProyectos }) => {
  // Campos para construir el nombre del proyecto
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');
  const [nombrePersonalizado, setNombrePersonalizado] = useState('');
  const [nombreFinal, setNombreFinal] = useState('');

  // Otros campos del proyecto
  const [radio, setRadio] = useState('');
  const [topografos, setTopografos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [topografoId, setTopografoId] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Obtener la fecha actual (formato ISO YYYY-MM-DD)
  const fechaHoy = new Date().toISOString().split('T')[0];

  // Actualiza automáticamente el nombre final del proyecto cuando cambian los valores
  useEffect(() => {
    if (mes && anio && nombrePersonalizado.trim()) {
      const mm = mes.toString().padStart(2, '0'); // Asegura 2 dígitos
      const yy = anio.toString().slice(-2); // Extrae los últimos 2 dígitos del año
      setNombreFinal(`${mm}${yy}-${nombrePersonalizado.toUpperCase()}`);
    } else {
      setNombreFinal('');
    }
  }, [mes, anio, nombrePersonalizado]);

  // Cargar topógrafos y empresas al abrir el modal
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
        Swal.fire('Error', 'No se pudieron cargar topógrafos o empresas.', 'error');
      }
    };
    cargar();
  }, [show]);

  // Envío del formulario al backend
  const handleSubmit = async () => {
    if (!nombreFinal || !radio || !topografoId || !empresaId) {
      Swal.fire('Campos incompletos', 'Por favor completa todos los campos', 'warning');
      return;
    }
    if (radio < 80 || radio > 250) {
      Swal.fire('Radio inválido', 'El radio debe estar entre 80 y 250', 'warning');
      return;
    }

    const body = {
      nombre_proyecto: nombreFinal,
      fecha_creacion: fechaHoy,
      radio_busqueda: parseInt(radio),
      _id_topografo: parseInt(topografoId),
      _id_empresa: parseInt(empresaId)
    };

    try {
      setEnviando(true);
      await crearProyecto(body);
      await refrescarProyectos();

      setTimeout(() => {
        setEnviando(false);
        Swal.fire({ icon: 'success', title: 'Proyecto creado con éxito', showConfirmButton: false, timer: 1500 });
        reiniciarFormulario();
        handleClose();
      }, 1000);
    } catch (err) {
      console.error(err);
      setEnviando(false);
      const mensaje = err.response?.data?.mensaje || 'Error al crear el proyecto.';
      Swal.fire('Error', mensaje, 'error');
    }
  };

  // Reiniciar todos los campos del formulario
  const reiniciarFormulario = () => {
    setMes('');
    setAnio('');
    setNombrePersonalizado('');
    setNombreFinal('');
    setRadio('');
    setTopografoId('');
    setEmpresaId('');
    setEnviando(false);
  };

  return (
    <Modal show={show} centered size="md" backdrop="static" onHide={() => { reiniciarFormulario(); handleClose(); }}>
      <Modal.Header closeButton>
        <Modal.Title>Crear Proyecto</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {enviando ? (
          // Mostrar animación de carga
          <div className="d-flex flex-column align-items-center justify-content-center text-center">
            <DotLottieReact
              src="https://lottie.host/d9b46d70-8e00-4356-9307-6152c917c64b/iMuNvyZS6n.lottie"
              autoplay
              loop
              style={{ height: 200, width: 200 }}
            />
            <p className="mt-3">Creando proyecto... 🚧</p>
          </div>
        ) : (
          // Mostrar formulario si no está enviando
          <Form>
            {/* Campos para construir el nombre */}
            <Form.Group>
              <Form.Label>Construir Nombre del Proyecto</Form.Label>
              <Row>
                <Col xs={4}>
                  <Form.Control type="number" placeholder="Mes (1-12)" value={mes} onChange={(e) => setMes(e.target.value)} min="1" max="12" />
                </Col>
                <Col xs={4}>
                  <Form.Control type="number" placeholder="Año (ej. 2025)" value={anio} onChange={(e) => setAnio(e.target.value)} />
                </Col>
                <Col xs={4}>
                  <Form.Control type="text" placeholder="Nombre" value={nombrePersonalizado} onChange={(e) => setNombrePersonalizado(e.target.value)} />
                </Col>
              </Row>
              <Form.Text className="text-muted">
                Se generará automáticamente como <code>MMYY-NOMBRE</code>
              </Form.Text>
            </Form.Group>

            {/* Campo de solo lectura para mostrar el nombre generado */}
            {nombreFinal && (
              <Form.Group className="mt-2">
                <Form.Label>Nombre Final del Proyecto</Form.Label>
                <Form.Control type="text" value={nombreFinal} readOnly />
              </Form.Group>
            )}

            {/* Campo: Radio */}
            <Form.Group className="mt-2">
              <Form.Label>Radio de Búsqueda (80-250)</Form.Label>
              <Form.Control type="number" value={radio} onChange={(e) => setRadio(e.target.value)} min="80" max="250" />
            </Form.Group>

            {/* Campo: Topógrafo */}
            <Form.Group className="mt-2">
              <Form.Label>Topógrafo</Form.Label>
              <Form.Select value={topografoId} onChange={(e) => setTopografoId(e.target.value)}>
                <option value="">Seleccione</option>
                {topografos
                  .filter(t => !t.NOMBRE_TOPOGRAFO?.toLowerCase().endsWith('-eliminado'))
                  .map(t => (
                    <option key={t.ID_TOPOGRAFO} value={t.ID_TOPOGRAFO}>
                      {t.NOMBRE_TOPOGRAFO}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            {/* Campo: Empresa */}
            <Form.Group className="mt-2">
              <Form.Label>Empresa</Form.Label>
              <Form.Select value={empresaId} onChange={(e) => setEmpresaId(e.target.value)}>
                <option value="">Seleccione</option>
                {empresas.map(e => (
                  <option key={e.ID_EMPRESA} value={e.ID_EMPRESA}>{e.NOMBRE_EMPRESA}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        )}
      </Modal.Body>

      {/* Botones del modal */}
      <Modal.Footer>
        <Button variant="danger" onClick={() => { reiniciarFormulario(); handleClose(); }} disabled={enviando}>
          Cancelar
        </Button>
        <Button style={{ backgroundColor: '#F47C27', border: 'none' }} onClick={handleSubmit} disabled={enviando}>
          Crear Proyecto
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Exportar componente para uso externo
export default ModalCrearProyecto;