// 🔹 Importaciones principales
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { actualizarProyecto } from '../services/proyectoService';
import { crearGpsBase } from '../services/gpsServise';

// 🔹 Componente del Modal para crear un nuevo GPS base
const ModalCrearGps = ({ show, handleClose, id_dia_rastreo, id_proyecto, refrescarGps, radio_busqueda, estado_geo, cargarPro, refrescar }) => {
  // Estados para el formulario
  const [nombreGps, setNombreGps] = useState('');
  const [archivoNav, setArchivoNav] = useState(null);
  const [archivoObs, setArchivoObs] = useState(null);
  const [enviando, setEnviando] = useState(false); // Controla si se está enviando el formulario

  // 🔸 useEffect: limpia el formulario cuando se cierra el modal
  useEffect(() => {
    if (!show) {
      setNombreGps('');
      setArchivoNav(null);
      setArchivoObs(null);
      setEnviando(false);
    }
  }, [show]);

  // 🔸 Funciones de validación
  const validarPeso = (archivo) => archivo && archivo.size > 1024; // mínimo 1 KB
  const validarExtensionNav = (nombre) => /\.(nav|24n|25n)$/i.test(nombre); // extensiones válidas NAV
  const validarExtensionObs = (nombre) => /\.(obs|24o|25o)$/i.test(nombre); // extensiones válidas OBS


  // funcion actualizar resumen
  const refrescarResumen = async () => {
    refrescar()
  }

  // funcion para actalizar el estado de redgeoscan
  const actualizar_estado = async () => {
    try {
      // marca el proyecto como "En Proceso" en RedGeoScan
      const proyecto = { radio_busqueda: radio_busqueda, estado_red: 'En Proceso', estado_geo: estado_geo }
      const respuesta = await actualizarProyecto(id_proyecto, proyecto);
      cargarPro()
      refrescarResumen()
    } catch (error) {
      // Si ocurre un error lo mostramos
      const mensaje = error.response?.data?.mensaje || 'Hubo un problema al crear el GPS.';
      Swal.fire('Error', mensaje, 'error');
    }
  }


  // 🔸 Función principal para crear el GPS
  const handleCrear = async () => {
    // Validar que el nombre no esté vacío
    if (!nombreGps.trim()) {
      Swal.fire('Error', 'Debes ingresar el nombre del GPS', 'error');
      return;
    }

    // Validar archivo NAV (navegado)
    if (!archivoNav || !validarExtensionNav(archivoNav.name) || !validarPeso(archivoNav)) {
      Swal.fire(
        'Error',
        'Archivo navegado inválido. Asegúrate que tenga extensión .nav, .24N o .25N y pese más de 1 KB.',
        'error'
      );
      return;
    }

    // Validar archivo OBS (observado)
    if (!archivoObs || !validarExtensionObs(archivoObs.name) || !validarPeso(archivoObs)) {
      Swal.fire(
        'Error',
        'Archivo observado inválido. Asegúrate que tenga extensión .obs, .24O o .25O y pese más de 1 KB.',
        'error'
      );
      return;
    }

    try {
      // Activamos animación de envío
      setEnviando(true);

      // Creamos el objeto FormData con todos los campos
      const formData = new FormData();
      formData.append('nombre_gps', nombreGps);
      formData.append('id_dia_rastreo', id_dia_rastreo);
      formData.append('id_proyecto', id_proyecto);
      formData.append('archivo_navegado', archivoNav);
      formData.append('archivo_observado', archivoObs);

      // Enviamos al backend
      const respuesta = await crearGpsBase(formData);

      // Mostramos mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'GPS creado correctamente',
        text: respuesta?.mensaje || 'Los archivos fueron cargados con éxito.',
        showConfirmButton: false,
        timer: 1500,
      });
      actualizar_estado()
      refrescarGps(); // Actualizamos la tabla
      handleClose();  // Cerramos el modal
    } catch (error) {
      // Si ocurre un error lo mostramos
      const mensaje = error.response?.data?.mensaje || 'Hubo un problema al crear el GPS.';
      Swal.fire('Error', mensaje, 'error');
    } finally {
      setEnviando(false); // Apagamos la animación sin importar si falló o no
    }
  };

  // 🔸 Render del modal
  return (
    <Modal show={show} onHide={handleClose} centered>
      {/* Cabecera */}
      <Modal.Header closeButton>
        <Modal.Title>Crear GPS Base</Modal.Title>
      </Modal.Header>

      {/* Cuerpo */}
      <Modal.Body>
        {/* Si está enviando, mostrar animación */}
        {enviando ? (
          <div className="d-flex flex-column align-items-center justify-content-center text-center">
            <DotLottieReact
              src="https://lottie.host/d9b46d70-8e00-4356-9307-6152c917c64b/iMuNvyZS6n.lottie"
              loop
              autoplay
              style={{ height: 200, width: 200 }}
            />
            <p className="mt-3">Creando GPS base... 🛩️</p>
          </div>
        ) : (
          // Formulario
          <Form>
            {/* Nombre del GPS */}
            <Form.Group className="mb-3">
              <Form.Label>Nombre del GPS Base</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el nombre de su base o GPS (ej: BASE1)"
                value={nombreGps}
                onChange={(e) => {
                  const valor = e.target.value.toUpperCase().replace(/\s+/g, '');
                  setNombreGps(valor);
                }}
                disabled={enviando}
              />
            </Form.Group>

            {/* Archivo navegado */}
            <Form.Group className="mb-3">
              <Form.Label>Seleccione el archivo navegado (.nav, .24N, .25N)</Form.Label>
              <Form.Control
                type="file"
                accept=".nav,.24N,.25N"
                onChange={(e) => setArchivoNav(e.target.files[0])}
                disabled={enviando}
              />
            </Form.Group>

            {/* Archivo observado */}
            <Form.Group>
              <Form.Label>Seleccione el archivo observado (.obs, .24O, .25O)</Form.Label>
              <Form.Control
                type="file"
                accept=".obs,.24O,.25O"
                onChange={(e) => setArchivoObs(e.target.files[0])}
                disabled={enviando}
              />
            </Form.Group>
          </Form>
        )}
      </Modal.Body>

      {/* Pie del modal */}
      <Modal.Footer>
        {/* Botón cancelar */}
        <Button variant="secondary" onClick={handleClose} disabled={enviando}>
          Cancelar
        </Button>

        {/* Botón crear */}
        <Button variant="primary" onClick={handleCrear} disabled={enviando}>
          Crear
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// 🔸 Exportación del componente
export default ModalCrearGps;
