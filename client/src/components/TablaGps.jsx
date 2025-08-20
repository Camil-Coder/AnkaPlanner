// TablaGps.jsx
import React, { useEffect, useState } from 'react';
import { Table, Spinner, Button } from 'react-bootstrap';
import { obtenerGpsBase } from '../services/gpsServise';           // ⬅️ corregido
import ModalCrearGps from './ModalCrearGps';


export const TablaGps = ({ id_proyecto, fecha_creacion, id_dia_rastreo, radio_busqueda, estado_geo, cargarPro, refrescar }) => {
  const [gpsBase, setGpsBase] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [actualizando, setActualizando] = useState(false);

  const abrirModal = () => setMostrarModal(true);
  const cerrarModal = () => setMostrarModal(false);

  const cargarGpsBase = async () => {
    try {
      setCargando(true);
      const data = await obtenerGpsBase(id_dia_rastreo);
      setGpsBase(data);
    } catch (err) {
      console.error('Error al cargar GPS base:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (id_dia_rastreo) cargarGpsBase();
  }, [id_dia_rastreo]);

  // ⬇️ Se llamará desde el modal cuando el GPS se cree con éxito
  const handleGpsCreado = async () => {
    try {
      setActualizando(true);
      await cargarGpsBase(); // refresca lista
    } catch (e) {
      console.error('No se pudo actualizar estado del proyecto:', e);
    } finally {
      setActualizando(false);
    }
  };

  if (cargando) {
    return (
      <div className="d-flex align-items-center gap-2">
        <Spinner animation="border" size="sm" />
        <span>Cargando GPS base...</span>
      </div>
    );
  }

  return (
    <>
      <Table striped bordered hover size="sm" responsive>
        <thead>
          <tr>
            <th>Nombre GPS</th>
            <th>Archivo Observado</th>
            <th>Archivo Navegado</th>
            <th style={{ width: '1px', whiteSpace: 'nowrap' }}>
              <Button className="boton-crear" onClick={abrirModal} disabled={actualizando}>
                + Nuevo GPS Base
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {gpsBase.length === 0 ? (
            <tr>
              <td colSpan="4">Sin GPS Base</td>
            </tr>
          ) : (
            gpsBase.map((gps, index) => (
              <tr key={index}>
                <td>{gps.NOMBRE_GPS_BASE}</td>
                <td>{gps.RUTA_OBS_GPS_BASE ? 'Cargado' : 'No cargado'}</td>
                <td>{gps.RUTA_NAV_GPS_BASE ? 'Cargado' : 'No cargado'}</td>
                <td />
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <ModalCrearGps
        show={mostrarModal}
        handleClose={cerrarModal}
        id_proyecto={id_proyecto}
        fecha_creacion={fecha_creacion}
        id_dia_rastreo={id_dia_rastreo}
        refrescarGps={cargarGpsBase}
        onCreado={handleGpsCreado}
        radio_busqueda={radio_busqueda}
        estado_geo={estado_geo}
        cargarPro={cargarPro}
        refrescar={refrescar}
      />
    </>
  );
};

export default TablaGps;
