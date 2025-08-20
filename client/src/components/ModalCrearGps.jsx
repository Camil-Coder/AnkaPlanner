// 🔹 Importaciones principales
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { actualizarProyecto } from '../services/proyectoService';
import { crearGpsBase } from '../services/gpsServise';

// 🔹 Componente del Modal para crear un nuevo GPS base
const ModalCrearGps = ({ show, handleClose, id_dia_rastreo, id_proyecto, fecha_creacion, refrescarGps, radio_busqueda, estado_geo, cargarPro, refrescar }) => {
  // Estados para el formulario
  const [nombreGps, setNombreGps] = useState('');
  const [archivoNav, setArchivoNav] = useState(null);
  const [archivoObs, setArchivoObs] = useState(null);
  const [sinNavegado, setSinNavegado] = useState(false); // ⬅️ nuevo: check sin navegado
  const [archivoPos, setArchivoPos] = useState(null);    // ⬅️ nuevo: único archivo .pos
  const [enviando, setEnviando] = useState(false);       // Controla si se está enviando el formulario

  // 🔸 useEffect: limpia el formulario cuando se cierra el modal
  useEffect(() => {
    if (!show) {
      setNombreGps('');
      setArchivoNav(null);
      setArchivoObs(null);
      setArchivoPos(null);
      setSinNavegado(false);
      setEnviando(false);
    }
  }, [show]);

  // 🔸 Funciones de validación
  const validarPeso = (archivo) => archivo && archivo.size > 1024; // mínimo 1 KB
  const validarExtensionNav = (nombre) => /\.(nav|24n|25n)$/i.test(nombre); // extensiones válidas NAV
  const validarExtensionObs = (nombre) => /\.(obs|24o|25o)$/i.test(nombre); // extensiones válidas OBS
  const validarExtensionPos = (nombre) => /\.pos$/i.test(nombre);          // ⬅️ nuevo: extensión .pos

  // funcion actualizar resumen
  const refrescarResumen = async () => {
    refrescar();
  };

  // funcion para actalizar el estado de redgeoscan
  const actualizar_estado = async () => {
    try {
      // marca el proyecto como "En Proceso" en RedGeoScan
      const proyecto = { fecha_creacion: fecha_creacion, radio_busqueda: radio_busqueda, estado_red: 'En Proceso', estado_geo: estado_geo };
      await actualizarProyecto(id_proyecto, proyecto);
      cargarPro();
      refrescarResumen();
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'Hubo un problema al crear el GPS.';
      Swal.fire('Error', mensaje, 'error');
    }
  };

  // 🔸 Función principal para crear el GPS
  const handleCrear = async () => {
    // Validar que el nombre no esté vacío
    if (!nombreGps.trim()) {
      Swal.fire('Error', 'Debes ingresar el nombre del GPS', 'error');
      return;
    }

    // 🧠 Modo A: SIN navegado → solo .pos
    if (sinNavegado) {
      if (!archivoPos || !validarExtensionPos(archivoPos.name) || !validarPeso(archivoPos)) {
        Swal.fire(
          'Error',
          'Archivo .pos inválido. Asegúrate que tenga extensión .pos y pese más de 1 KB.',
          'error'
        );
        return;
      }
    } else {
      // 🧠 Modo B: Con navegado → .nav + .obs
      if (!archivoNav || !validarExtensionNav(archivoNav.name) || !validarPeso(archivoNav)) {
        Swal.fire(
          'Error',
          'Archivo navegado inválido. Asegúrate que tenga extensión .nav, .24N o .25N y pese más de 1 KB.',
          'error'
        );
        return;
      }
      if (!archivoObs || !validarExtensionObs(archivoObs.name) || !validarPeso(archivoObs)) {
        Swal.fire(
          'Error',
          'Archivo observado inválido. Asegúrate que tenga extensión .obs, .24O o .25O y pese más de 1 KB.',
          'error'
        );
        return;
      }
    }

    try {
      setEnviando(true);

      // Armado del FormData
      const formData = new FormData();
      formData.append('nombre_gps', nombreGps);
      formData.append('id_dia_rastreo', id_dia_rastreo);
      formData.append('id_proyecto', id_proyecto);

      if (sinNavegado) {
        // ✅ Convertir SOLO uno a .txt antes de enviar
        const baseName = archivoPos.name.replace(/\.[^.]+$/i, ''); // quita la extensión
        const posComoTxt = new File(
          [archivoPos],
          `${baseName}.txt`,
          { type: 'text/plain', lastModified: archivoPos.lastModified }
        );

        // Enviamos el .txt como "archivo_navegado" y el .pos original como "archivo_observado"
        formData.append('archivo_navegado', posComoTxt, posComoTxt.name);
        formData.append('archivo_observado', archivoPos, archivoPos.name);
      } else {
        formData.append('archivo_navegado', archivoNav);
        formData.append('archivo_observado', archivoObs);
      }


      // Enviar al backend
      const respuesta = await crearGpsBase(formData);

      Swal.fire({
        icon: 'success',
        title: 'GPS creado correctamente',
        text: respuesta?.mensaje || 'Los archivos fueron cargados con éxito.',
        showConfirmButton: false,
        timer: 1500,
      });

      actualizar_estado();
      refrescarGps();
      handleClose();
    } catch (error) {
      const mensaje = error.response?.data?.mensaje || 'Hubo un problema al crear el GPS.';
      Swal.fire('Error', mensaje, 'error');
    } finally {
      setEnviando(false);
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

            {/* Check: Sin navegado */}
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                id="check-sin-navegado"
                label="Este GPS no tiene archivo navegado (.nav/.24N/.25N)"
                checked={sinNavegado}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSinNavegado(checked);
                  // limpiar archivos al cambiar modo
                  setArchivoNav(null);
                  setArchivoObs(null);
                  setArchivoPos(null);
                }}
                disabled={enviando}
              />
            </Form.Group>

            {/* Inputs condicionales */}
            {sinNavegado ? (
              // ➤ Solo un único .pos
              <Form.Group className="mb-3">
                <Form.Label>Seleccione el archivo único (.pos)</Form.Label>
                <Form.Control
                  type="file"
                  accept=".pos"
                  onChange={(e) => setArchivoPos(e.target.files[0])}
                  disabled={enviando}
                />
              </Form.Group>
            ) : (
              <>
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
              </>
            )}
          </Form>
        )}
      </Modal.Body>

      {/* Pie del modal */}
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={enviando}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleCrear} disabled={enviando}>
          Crear
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// 🔸 Exportación del componente
export default ModalCrearGps;
