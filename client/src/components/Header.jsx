import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import logoAnka from '../assets/logo-anka.png';
import ModalCrearProyecto from './ModalCrearProyecto';

const Header = ({ refrescarProyectos }) => {
    const [mostrarModal, setMostrarModal] = useState(false);

    // 👉 Maneja la apertura del modal
    const abrirModal = () => setMostrarModal(true);

    // 👉 Maneja el cierre del modal
    const cerrarModal = () => setMostrarModal(false);

    return (
        <>
            {/* CABECERA con botón y logo */}
            <header style={{ backgroundColor: '#2F4D73', width: '100%' }}>
                <Container fluid>
                    <Row className="gx-0">
                        <Col>
                            <img src={logoAnka} alt="Logo Anka" height="90" />
                        </Col>
                        <Col style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Button className="boton-crear" onClick={abrirModal}>
                                CREAR PROYECTO
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </header>

            {/* MODAL para crear proyecto */}
            <ModalCrearProyecto
                show={mostrarModal}
                handleClose={cerrarModal}
                refrescarProyectos={refrescarProyectos} // ✅ función para refrescar tabla después de crear
            />
        </>
    );
};

export default Header;
