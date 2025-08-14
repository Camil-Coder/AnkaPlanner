import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { obtenerProyectos } from '../services/proyectoService';

const Resumen = forwardRef((props, ref) => {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const data = await obtenerProyectos();
      setProyectos(data);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    } finally {
      setCargando(false);
    }
  };

  // Permite al componente padre refrescar la tabla desde fuera
  useImperativeHandle(ref, () => ({
    refrescarTablaResumen: () => {
      cargarDatos();
    }
  }));

  useEffect(() => {
    cargarDatos();
  }, []); // 👈 Solo se ejecuta una vez al montar

  const totalProyectos = proyectos.length;
  const redEnProceso = proyectos.filter(p => p.ESTADO_RED === 'En Proceso').length;
  const geoEnProceso = proyectos.filter(p => p.ESTADO_GEO === 'En Proceso').length;

  return (
    <Row
      className="mb-3 text-center"
      style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0' }}
    >
      {cargando ? (
        <Spinner animation="border" />
      ) : (
        <>
          <Col md={4}>
            <Card>
              <Card.Body>
                <h2>{totalProyectos}</h2>
                <p>Total de proyectos</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Body>
                <h2>{redEnProceso}</h2>
                <p>RedGeoScan: En Proceso</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Body>
                <h2>{geoEnProceso}</h2>
                <p>Cambio de Época: En Proceso</p>
              </Card.Body>
            </Card>
          </Col>
        </>
      )}
    </Row>
  );
});

export default Resumen;
