import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import logoAnka from '../assets/logo-anka.png';
import ModalCrearProyecto from './ModalCrearProyecto';
import ModalGestionTopografos from './ModalGestionTopografos';
import ModalGestionEmpresas from './ModalGestionEmpresas';


const Header = ({ refrescarProyectos }) => {
    // Estado para cada modal
    const [showEmpresas, setShowEmpresas] = useState(false);
    const [showTopografos, setShowTopografos] = useState(false);
    const [showCrearProyecto, setShowCrearProyecto] = useState(false);

    return (
        <>
            {/* CABECERA con botón y logo */}
            <header style={{ backgroundColor: '#2F4D73', width: '100%' }}>
                <Container fluid>
                    <Row className="gx-0">
                        <Col>
                            <img src={logoAnka} alt="Logo Anka" height="90" />
                        </Col>
                        <Col style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
                            <Button className="boton-crear" onClick={() => setShowEmpresas(true)}>
                                + EMPRESAS
                            </Button>
                            <Button className="boton-crear" onClick={() => setShowTopografos(true)}>
                                + TOPOGRAFOS
                            </Button>
                            <Button className="boton-crear" onClick={() => setShowCrearProyecto(true)}>
                                + NUEVO PROYECTO
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </header>

            {/* MODAL: Gestión de empresas */}
            <ModalGestionEmpresas
                show={showEmpresas}
                onHide={() => setShowEmpresas(false)}
                refrescarProyectos={refrescarProyectos}
            />

            {/* MODAL: Gestión de Topógrafos */}
            <ModalGestionTopografos
                show={showTopografos}
                onHide={() => setShowTopografos(false)}
                refrescarProyectos={refrescarProyectos}
            />

            {/* MODAL: Crear Proyecto */}
            <ModalCrearProyecto
                show={showCrearProyecto}
                handleClose={() => setShowCrearProyecto(false)}
                refrescarProyectos={refrescarProyectos} // refresca la tabla al crear
            />
        </>
    );
};

export default Header;
