import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

const Resumen = () => {
  return (
    <Row className="mb-4 text-center">
      <Col md={4}>
        <Card>
          <Card.Body>
            <h2>12</h2>
            <p>Total de proyectos</p>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card>
          <Card.Body>
            <h2>5</h2>
            <p>RedGeoScan: Completo</p>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4}>
        <Card>
          <Card.Body>
            <h2>3</h2>
            <p>Cambio de Época: En Proceso</p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Resumen;
