// C:\BotAuto-Full\client\src\components\TablaCambioDeEpoca.jsx
import React, { useEffect, useState } from 'react';
import { Table, Spinner, Button } from 'react-bootstrap';
import { obtenerDiasRastreos } from '../services/diasRastreosService';
import ModalCalculoDifEnXYZ from './ModalCalculoDifEnXYZ';
import TablaDIfer from './TablaDIfer'; // ⬅️ NUEVO: import de la tabla

export const TablaCambioDeEpoca = ({ id_proyecto, cargarP, refrescar }) => {
    // 1) Estado: días, carga y fila activa
    const [dias, setDias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [filaActivaDia, setFilaActivaDia] = useState(null);

    // 2) Estado: modal y día seleccionado
    const [mostrarModal, setMostrarModal] = useState(false);
    const [diaSeleccionado, setDiaSeleccionado] = useState(null);

    // 3) Alterna la fila desplegable
    const toggleFilaDia = (idDia) => {
        setFilaActivaDia((prev) => (prev === idDia ? null : idDia));
    };

    // 4) Carga días desde la API y ordena por fecha (string DDMMYY)
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

    // 5) Efecto: carga inicial cuando hay id_proyecto
    useEffect(() => {
        if (id_proyecto) cargarDias();
    }, [id_proyecto]);

    // 6) Click en "Calcular diferencias": abrir modal con el día
    const handleCalcularDiferencias = (dia) => {
        setDiaSeleccionado(dia);
        setMostrarModal(true);
    };

    // 7) Callbacks del modal (placeholders)
    const onCalcular = ({ id_proyecto, id_dia_rastreo, excel1, excel2 }) => {
        console.log('Calcular diferencias =>', { id_proyecto, id_dia_rastreo, excel1, excel2 });
        setMostrarModal(false);
    };

    const onCambioEpoca = ({ id_proyecto, id_dia_rastreo, excel1, excel2 }) => {
        console.log('Cambio de época =>', { id_proyecto, id_dia_rastreo, excel1, excel2 });
        setMostrarModal(false);
    };

    // 8) Estado de carga
    if (cargando) {
        return (
            <div className="d-flex align-items-center gap-2">
                <Spinner animation="border" size="sm" />
                <span>Cargando Reportes...</span>
            </div>
        );
    }

    // 9) Render de la tabla
    return (
        <>
            <Table striped bordered hover size="sm" responsive>
                <thead>
                    <tr>
                        <th>Reporte (Día rastreo)</th>
                        <th style={{ width: 180 }}>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {dias.length === 0 ? (
                        <tr>
                            <td colSpan={2}>Sin Días Rastreos</td>
                        </tr>
                    ) : (
                        dias.map((dia) => (
                            <React.Fragment key={dia.ID_DIA_RASTREO}>
                                {/* 10) Fila principal: nombre del día + botón "Calcular diferencias" */}
                                <tr>
                                    <td
                                        className="rg-cell-tight"
                                        onClick={() => toggleFilaDia(dia.ID_DIA_RASTREO)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div
                                            className="rg-dia-row"
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

                                    {/* 11) Botón centrado con estilo naranja (mismo "boton-crear") */}
                                    <td className="text-center align-middle">
                                        <div className="d-flex justify-content-center">
                                            <Button
                                                className="boton-crear"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCalcularDiferencias(dia);
                                                }}
                                                disabled={cargando}
                                            >
                                                Calcular diferencias
                                            </Button>
                                        </div>
                                    </td>
                                </tr>

                                {/* 12) Fila desplegable: aquí llamamos a la tabla de diferencias */}
                                {filaActivaDia === dia.ID_DIA_RASTREO && (
                                    <tr>
                                        <td className="rg-cell-tight" colSpan={2}>
                                            <div className="rg-dia-panel">
                                                <TablaDIfer idDiaRastreo={dia.ID_DIA_RASTREO} />
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))
                    )}
                </tbody>
            </Table>

            {/* 13) Modal para subir Excels y lanzar acciones */}
            <ModalCalculoDifEnXYZ
                show={mostrarModal}
                onHide={() => setMostrarModal(false)}
                id_proyecto={id_proyecto}
                id_dia_rastreo={diaSeleccionado?.ID_DIA_RASTREO}
                onCalcular={onCalcular}
                onCambioEpoca={onCambioEpoca}
                cargarP={cargarP}
                refrescar={refrescar}
            />
        </>
    );
};
