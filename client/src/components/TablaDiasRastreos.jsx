//C:\BotAuto-Full\client\src\components\TablaDiasRastreos.jsx
import React, { useEffect, useState } from 'react';
import { Table, Spinner, Button } from 'react-bootstrap';
import { obtenerDiasRastreos } from '../services/diasRastreosService';
import ModalCrearDiaRastreo from './ModalCrearDiaRastreo';
import { TablaGps } from './TablaGps'

export const TablaDiasRastreos = ({ id_proyecto, fecha_creacion, radio_busqueda, estado_geo, cargarP, refrescar }) => {

    // MANEJO DE ESTADOD DE DIAS RASTREOS
    const [dias, setDias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);

    // ✅ Nueva fila activa (para expandir un solo día)
    const [filaActivaDia, setFilaActivaDia] = useState(null);

    // CAMBIO DE ESTADOS DE MODAL
    const abrirModal = () => setMostrarModal(true);
    const cerrarModal = () => setMostrarModal(false);

    // CAMBIO DE ESTADO DE FILA DESPLEGABLE
    const toggleFilaDia = (idDia) => { setFilaActivaDia((prev) => (prev === idDia ? null : idDia)); };

    // FUNCION PARA CARGAR Y ORGANIZAR LOS DIAS ARSTREOS EN ORDEN
    const cargarDias = async () => {
        try {
            setCargando(true);
            const data = await obtenerDiasRastreos(id_proyecto);

            const dataOrdenada = data.sort((a, b) => {
                const fechaA = new Date(
                    `20${a.NOMBRE_DIA_RASTREO.slice(4, 6)}`,
                    parseInt(a.NOMBRE_DIA_RASTREO.slice(2, 4)) - 1,
                    a.NOMBRE_DIA_RASTREO.slice(0, 2)
                );

                const fechaB = new Date(
                    `20${b.NOMBRE_DIA_RASTREO.slice(4, 6)}`,
                    parseInt(b.NOMBRE_DIA_RASTREO.slice(2, 4)) - 1,
                    b.NOMBRE_DIA_RASTREO.slice(0, 2)
                );

                return fechaA - fechaB;
            });

            setDias(dataOrdenada);
        } catch (err) {
            console.error('Error al cargar días de rastreo:', err);
        } finally {
            setCargando(false);
        }
    };

    // CARGA LOS DIAS RASTREOS DESDE EL INICO
    useEffect(() => {
        if (id_proyecto) {
            cargarDias();
        }
    }, [id_proyecto]);

    if (cargando) {
        return (
            <div className="d-flex align-items-center gap-2">
                <Spinner animation="border" size="sm" />
                <span>Cargando días de rastreo...</span>
            </div>
        );
    }

    const botonNuevoDia = (
        <Button className="boton-crear" onClick={abrirModal} aria-label="Crear nuevo día de rastreo">
            + Nuevo Día Rastreo
        </Button>
    );

    return (
        <>
            <Table striped bordered hover size="sm" responsive>
                <thead>
                    <tr>
                        <th className="rg-dias-header">{botonNuevoDia}</th>
                    </tr>
                </thead>

                <tbody>
                    {dias.length === 0 ? (
                        <tr>
                            <td>Sin Días Rastreos</td>
                        </tr>
                    ) : (
                        dias.map((dia) => (
                            <React.Fragment key={dia.ID_DIA_RASTREO}>
                                {/* Fila “título del día” con flechita a la derecha */}
                                <tr>
                                    <td className="rg-cell-tight" >
                                        <div
                                            className="rg-dia-row"
                                            onClick={() => toggleFilaDia(dia.ID_DIA_RASTREO)}
                                            role="button"
                                            tabIndex={0}
                                            aria-expanded={filaActivaDia === dia.ID_DIA_RASTREO}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') toggleFilaDia(dia.ID_DIA_RASTREO);
                                            }}
                                        >
                                            <span className="rg-dia-name">{dia.NOMBRE_DIA_RASTREO}</span>
                                            <span className="rg-dia-arrow">
                                                {filaActivaDia === dia.ID_DIA_RASTREO ? '▾' : '▸'}
                                            </span>
                                        </div>
                                        <input type="hidden" value={dia.ID_DIA_RASTREO} />
                                    </td>
                                </tr>

                                {/* Fila desplegable */}
                                {filaActivaDia === dia.ID_DIA_RASTREO && (
                                    <tr>
                                        <td className="rg-cell-tight">
                                            <div className="rg-dia-panel">
                                                <TablaGps
                                                    id_proyecto={id_proyecto}
                                                    fecha_creacion={fecha_creacion}
                                                    id_dia_rastreo={dia.ID_DIA_RASTREO}
                                                    radio_busqueda={radio_busqueda}
                                                    estado_geo={estado_geo}
                                                    cargarPro={cargarP}
                                                    refrescar={refrescar}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    )}
                </tbody>
            </Table>

            <ModalCrearDiaRastreo
                show={mostrarModal}
                handleClose={cerrarModal}
                id_proyecto={id_proyecto}
                refrescarDias={cargarDias}
            />
        </>
    );
};
