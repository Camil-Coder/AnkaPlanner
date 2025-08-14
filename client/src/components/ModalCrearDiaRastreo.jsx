import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { crearDiaRastreo } from '../services/diasRastreosService';

const ModalCrearDiaRastreo = ({ show, handleClose, id_proyecto, refrescarDias }) => {
  const [nombreDia, setNombreDia] = useState('');
  const [enviando, setEnviando] = useState(false);

  const limpiarFormulario = () => {
    setNombreDia('');
    setEnviando(false);
  };

  useEffect(() => {
    if (!show) limpiarFormulario();
  }, [show]);

  const validarFormato = (texto) => /^[0-9]{6}$/.test(texto);

  const handleCrear = async () => {
    if (!validarFormato(nombreDia)) {
      Swal.fire({
        icon: 'warning',
        title: 'Formato inválido',
        text: 'El nombre debe tener el formato ddmmaaa. Ejemplo: 050825',
      });
      return;
    }

    try {
      setEnviando(true);
      await crearDiaRastreo({ id_proyecto, nombre: nombreDia });

      setTimeout(() => {
        refrescarDias();
        Swal.fire({
          icon: 'success',
          title: 'Día de rastreo creado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        handleClose();
        limpiarFormulario();
      }, 1000); // ⏱️ Tiempo para mostrar la animación
    } catch (err) {
      console.error(err);
      const mensaje = err.response?.data?.mensaje || 'Error al crear el día de rastreo.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: mensaje
      });
      setEnviando(false);
    }
  };

  return (
    <Modal show={show} onHide={() => { limpiarFormulario(); handleClose(); }} centered>
      <Modal.Header closeButton>
        <Modal.Title>Crear Día de Rastreo</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {enviando ? (
          <div className="d-flex flex-column align-items-center justify-content-center text-center">
            <DotLottieReact
              src="https://lottie.host/d9b46d70-8e00-4356-9307-6152c917c64b/iMuNvyZS6n.lottie"
              autoplay
              loop
              style={{ height: 200, width: 200 }}
            />
            <p className="mt-3">Creando día de rastreo... 🛰️</p>
          </div>
        ) : (
          <Form>
            <Form.Group>
              <Form.Label>Nombre del Día de Rastreo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ejemplo: 050825"
                value={nombreDia}
                onChange={(e) => setNombreDia(e.target.value)}
                maxLength={6}
              />
              <Form.Text className="text-muted">
                Usa el formato <strong>ddmmaaa</strong>. Ejemplo: 050825 para 5 de agosto de 2025.
              </Form.Text>
            </Form.Group>
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="danger"
          onClick={() => { limpiarFormulario(); handleClose(); }}
          disabled={enviando}
        >
          Cancelar
        </Button>
        <Button
          className='boton-crear'
          onClick={handleCrear}
          disabled={enviando}
        >
          Crear
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalCrearDiaRastreo;
