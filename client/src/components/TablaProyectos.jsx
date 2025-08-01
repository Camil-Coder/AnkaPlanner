import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Table, Button, Spinner } from 'react-bootstrap';
import { obtenerProyectos } from '../services/proyectoService';

const TablaProyectos = forwardRef((props, ref) => {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarProyectos = async () => {
    try {
      setCargando(true);
      const data = await obtenerProyectos();
      setProyectos(data);
    } catch (err) {
      console.error('Error al cargar proyectos:', err);
    } finally {
      setCargando(false);
    }
  };

  // Función expuesta hacia afuera
  useImperativeHandle(ref, () => ({
    refrescarTablaExternamente: () => {
      cargarProyectos();
    }
  }));

  // Cargar automáticamente al montar
  useEffect(() => {
    cargarProyectos();
  }, []);

  const formatearFecha = (isoString) => {
    const fecha = new Date(isoString);
    return fecha.toISOString().split('T')[0];
  };

  const calcularEstadoGlobal = (estadoRed, estadoGeo) => {
    return estadoRed === 'Completo' && estadoGeo === 'Completo'
      ? 'Completo'
      : 'En Proceso';
  };

  if (cargando) {
    return <p><Spinner animation="border" size="sm" /> Cargando proyectos...</p>;
  }

  return (
    <>
      <h5 className="mt-4">Listado de Proyectos</h5>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nombre Proyecto</th>
            <th>Topógrafo</th>
            <th>Empresa</th>
            <th>Fecha de carga</th>
            <th>Radio Búsqueda</th>
            <th>Estado RedGeoScan</th>
            <th>Estado Cambio de Época</th>
            <th>Estado Global</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {proyectos.map((p) => (
            <tr key={p.ID_PROYECTO}>
              <td>{p.NOMBRE_PROYECTO}</td>
              <td>{p.NOMBRE_TOPOGRAFO}</td>
              <td>{p.NOMBRE_EMPRESA}</td>
              <td>{formatearFecha(p.FECHA_CREACION)}</td>
              <td>{p.RADIO_BUSQUEDA}</td>
              <td>{p.ESTADO_RED}</td>
              <td>{p.ESTADO_GEO}</td>
              <td>{calcularEstadoGlobal(p.ESTADO_RED, p.ESTADO_GEO)}</td>
              <td>
                <Button variant="warning" size="sm">
                  Modificar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
});

export default TablaProyectos;
