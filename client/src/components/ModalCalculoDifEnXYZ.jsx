// C:\BotAuto-Full\client\src\components\ModalCalculoDifEnXYZ.jsx
// Requiere instalar:
// npm i sweetalert2 @lottiefiles/dotlottie-react xlsx

import React, { useMemo, useState } from 'react';
import { Modal, Button, Form, Row, Col, Table, Spinner, Alert } from 'react-bootstrap';
import './rg-tables.css';
import { parseNavFile, fmtDate } from '../utils/parseNav';
import { parseFixFile } from '../utils/parseFix';
import { compareNavFix } from '../utils/compareNavFix';
import * as XLSX from 'xlsx';
import { guardarReportes } from '../services/reportesService';
import { actualizarProyecto } from '../services/proyectoService'; // ⬅️ NUEVO
import Swal from 'sweetalert2';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const THRESHOLD = 10;
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const ModalCalculoDifEnXYZ = ({ show, onHide, id_proyecto, id_dia_rastreo, cargarP, refrescar }) => {
    // Archivos seleccionados
    const [navFile, setNavFile] = useState(null);
    const [fixFile, setFixFile] = useState(null);

    // NAV
    const [loadingNav, setLoadingNav] = useState(false);
    const [errorNav, setErrorNav] = useState('');
    const [navRows, setNavRows] = useState([]);
    const [navPreview, setNavPreview] = useState([]);

    // FIX
    const [loadingFix, setLoadingFix] = useState(false);
    const [errorFix, setErrorFix] = useState('');
    const [fixRows, setFixRows] = useState([]);
    const [fixPreview, setFixPreview] = useState([]);

    // Comparación
    const [comparisonReady, setComparisonReady] = useState(false);
    const [cmpRows, setCmpRows] = useState([]);
    const [omittedGps, setOmittedGps] = useState([]);

    // Envío
    const [enviando, setEnviando] = useState(false);
    const [errorSave, setErrorSave] = useState('');

    // Ready flags
    const navReady = useMemo(() => navRows.length > 0, [navRows]);
    const fixReady = useMemo(() => fixRows.length > 0, [fixRows]);

    // --- helpers XLSX ---
    const fmtDMY = (d) => {
        if (!(d instanceof Date)) return '';
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yy = d.getFullYear();
        return `${dd}/${mm}/${yy}`;
    };
    const aoaToXlsxBlob = (aoa, sheetName = 'Hoja1') => {
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
        return new Blob([buf], { type: XLSX_MIME });
    };
    const buildNavXlsxNoHeader = () => {
        const aoa = navRows.map(r => [r.gps, fmtDMY(r.fecha), r.x, r.y, r.z]); // SIN encabezado
        return aoaToXlsxBlob(aoa, 'NAV');
    };
    const buildFixXlsxNoHeader = () => {
        const aoa = fixRows.map(r => [r.gps, r.x, r.y, r.z]); // SIN encabezado
        return aoaToXlsxBlob(aoa, 'FIX');
    };
    const buildDiferXlsx = () => {
        const rows = (cmpRows.length ? cmpRows : compareNavFix(navRows, fixRows, THRESHOLD).rows);
        const aoa = [['GPS', 'DIF EN X', 'DIF EN Y', 'DIF EN Z']];
        rows.forEach(r => aoa.push([r.gps, r.dx, r.dy, r.dz]));
        return aoaToXlsxBlob(aoa, 'DIFER');
    };

    // Select handlers
    const handleSelectNav = (e) => {
        const file = e.target.files?.[0];
        setErrorNav('');
        setNavFile(file || null);
        setNavRows([]); setNavPreview([]);
        setComparisonReady(false); setCmpRows([]); setOmittedGps([]);
    };

    const handleSelectFix = (e) => {
        const file = e.target.files?.[0];
        setErrorFix('');
        setFixFile(file || null);
        setFixRows([]); setFixPreview([]);
        setComparisonReady(false); setCmpRows([]); setOmittedGps([]);
    };

    // NAV
    const handleParseNav = async () => {
        if (!navFile) return;
        setLoadingNav(true); setErrorNav(''); setNavRows([]); setNavPreview([]);
        const res = await parseNavFile(navFile);
        if (!res.ok) setErrorNav(res.errors.join('\n'));
        else { setNavRows(res.rows); setNavPreview(res.preview); }
        setLoadingNav(false);
    };

    // FIX — requiere encabezado
    const handleParseFix = async () => {
        if (!fixFile) return;
        setLoadingFix(true); setErrorFix(''); setFixRows([]); setFixPreview([]);
        const res = await parseFixFile(fixFile);
        if (!res.ok) setErrorFix(res.errors.join('\n'));
        else { setFixRows(res.rows); setFixPreview(res.preview); }
        setLoadingFix(false);
    };

    // Comparación (solo pares)
    const handleVerificar = () => {
        const { rows, omitted } = compareNavFix(navRows, fixRows, THRESHOLD);
        setCmpRows(rows);
        setOmittedGps(omitted ?? []);
        setComparisonReady(true);
    };

    const handleCancelar = () => {
        if (enviando) return;
        setNavFile(null); setFixFile(null);
        setErrorNav(''); setErrorFix(''); setErrorSave('');
        setLoadingNav(false); setLoadingFix(false);
        setNavRows([]); setNavPreview([]);
        setFixRows([]); setFixPreview([]);
        setCmpRows([]); setOmittedGps([]);
        setComparisonReady(false);
        setEnviando(false);
        onHide?.();
    };

    // === ACEPTAR: construir archivos y enviar al backend + actualizar ESTADO_GEO ===
    const handleAceptar = async () => {
        if (!navReady || !fixReady || enviando) return;
        try {
            setErrorSave('');
            setEnviando(true);
            

            // asegurar comparación
            if (!comparisonReady || cmpRows.length === 0) {
                const { rows } = compareNavFix(navRows, fixRows, THRESHOLD);
                setCmpRows(rows);
            }

            // crear blobs
            const navBlob = buildNavXlsxNoHeader();
            const fixBlob = buildFixXlsxNoHeader();
            const diferBlob = buildDiferXlsx();

            // form-data
            const formData = new FormData();
            formData.append('id_dia_rastreo', String(id_dia_rastreo ?? ''));
            formData.append('id_proyecto', String(id_proyecto ?? ''));
            formData.append('archivo_navegado', new File([navBlob], 'NAV.xlsx', { type: XLSX_MIME }));
            formData.append('archivo_fix', new File([fixBlob], 'FIX.xlsx', { type: XLSX_MIME }));
            formData.append('archivo_difer', new File([diferBlob], 'DIFER.xlsx', { type: XLSX_MIME }));

            // 1) Guardar reportes
            await guardarReportes(formData);

            // 2) Actualizar ESTADO_GEO = 'En Proceso'
            if (id_proyecto) {
                await actualizarProyecto(id_proyecto, { estado_geo: 'En Proceso' });
            }

            setEnviando(false);

            await Swal.fire({
                icon: 'success',
                title: '¡Reportes guardados!',
                text: 'Se enviaron NAV, FIX y DIFER correctamente. Estado GEO actualizado a "En Proceso".',
                confirmButtonText: 'OK'
            });
            cargarP()
            refrescar()
            handleCancelar();
        } catch (err) {
            console.error('Error al guardar reportes / actualizar estado:', err);
            setEnviando(false);
            setErrorSave('No se pudo completar la operación. Revisa tu conexión o el servicio.');
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron enviar los archivos o actualizar el estado.',
                confirmButtonText: 'Entendido'
            });
        }
    };

    return (
        <Modal show={show} onHide={handleCancelar} size="lg" centered scrollable>
            <Modal.Header closeButton>
                <Modal.Title>Calcular diferencias en X/Y/Z</Modal.Title>
            </Modal.Header>

            {/* Contenedor relativo para overlay de animación */}
            <Modal.Body style={{ position: 'relative', minHeight: 120 }}>
                {/* Overlay Lottie mientras enviamos */}
                {enviando && (
                    <div
                        className="d-flex flex-column align-items-center justify-content-center text-center"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(255,255,255,0.9)',
                            zIndex: 20
                        }}
                    >
                        <DotLottieReact
                            src="https://lottie.host/d9b46d70-8e00-4356-9307-6152c917c64b/iMuNvyZS6n.lottie"
                            loop
                            autoplay
                            style={{ height: 200, width: 200 }}
                        />
                        <p className="mt-3">Enviando reportes... 📤</p>
                    </div>
                )}

                <div className="mb-3 small text-muted">
                    <div><b>Proyecto:</b> {id_proyecto ?? '—'}</div>
                    <div><b>Día de rastreo:</b> {id_dia_rastreo ?? '—'}</div>
                </div>

                {!!errorSave && (
                    <Alert variant="danger" className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>
                        {errorSave}
                    </Alert>
                )}

                {/* 1) NAV */}
                <section className="mb-4">
                    <h6 className="mb-2">Cargar NAV (navegado) — .csv/.xlsx</h6>
                    <Row className="g-2 align-items-center">
                        <Col md="8">
                            <Form.Group controlId="navFileInput">
                                <Form.Control type="file" accept=".csv,.xlsx" onChange={handleSelectNav} disabled={loadingNav || enviando} />
                            </Form.Group>
                        </Col>
                        <Col md="4" className="text-md-end">
                            <Button className="boton-crear" disabled={!navFile || loadingNav || enviando} onClick={handleParseNav}>
                                {loadingNav ? (<><Spinner animation="border" size="sm" className="me-2" />Cargando NAV...</>) : 'Cargar NAV'}
                            </Button>
                        </Col>
                    </Row>
                    {!!errorNav && <Alert variant="danger" className="mt-2" style={{ whiteSpace: 'pre-wrap' }}>{errorNav}</Alert>}

                    {navFile && (
                        <div className="mt-3">
                            <div className="mb-2 fw-semibold">Vista previa NAV</div>
                            <div className="rg-table-scroll">
                                <Table striped bordered hover size="sm" responsive>
                                    <thead>
                                        <tr><th>GPS</th><th>Fecha</th><th>X</th><th>Y</th><th>Z</th></tr>
                                    </thead>
                                    <tbody>
                                        {navRows.length === 0 ? (
                                            <tr><td colSpan={5} className="text-center text-muted">
                                                {loadingNav ? 'Leyendo archivo...' : '(Carga el NAV para ver filas válidas)'}
                                            </td></tr>
                                        ) : (
                                            navPreview.map((r, i) => (
                                                <tr key={i}><td>{r.gps}</td><td>{fmtDate(r.fecha)}</td><td>{r.x}</td><td>{r.y}</td><td>{r.z}</td></tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                            {navRows.length > navPreview.length && (
                                <div className="text-muted small mt-1">Mostrando {navPreview.length} de {navRows.length} filas.</div>
                            )}
                        </div>
                    )}
                </section>

                <hr />

                {/* 2) FIX */}
                <section className="mb-4">
                    <h6 className="mb-2">Cargar FIX — .csv (requiere encabezado)</h6>
                    <div className="small text-muted mb-2">
                        Debe incluir las columnas: <b>Station ID</b>, <b>X (m)</b>, <b>Y (m)</b>, <b>Z (m)</b>.
                    </div>
                    <Row className="g-2 align-items-center">
                        <Col md="9">
                            <Form.Group controlId="fixFileInput">
                                <Form.Control type="file" accept=".csv" onChange={handleSelectFix} disabled={!navReady || loadingFix || enviando} />
                            </Form.Group>
                        </Col>
                        <Col md="3" className="text-md-end">
                            <Button className="boton-crear" disabled={!navReady || !fixFile || loadingFix || enviando} onClick={handleParseFix}>
                                {loadingFix ? (<><Spinner animation="border" size="sm" className="me-2" />Cargando FIX...</>) : 'Cargar FIX'}
                            </Button>
                        </Col>
                    </Row>
                    {!!errorFix && <Alert variant="danger" className="mt-2" style={{ whiteSpace: 'pre-wrap' }}>{errorFix}</Alert>}

                    {fixFile && (
                        <div className="mt-3">
                            <div className="mb-2 fw-semibold">Vista previa FIX (normalizado)</div>
                            <div className="rg-table-scroll">
                                <Table striped bordered hover size="sm" responsive>
                                    <thead>
                                        <tr><th>GPS</th><th>X (m)</th><th>Y (m)</th><th>Z (m)</th></tr>
                                    </thead>
                                    <tbody>
                                        {fixRows.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center text-muted">
                                                {loadingFix ? 'Leyendo archivo...' : '(Carga el FIX con encabezado para ver filas válidas)'}
                                            </td></tr>
                                        ) : (
                                            fixPreview.map((r, i) => (
                                                <tr key={i}><td>{r.gps}</td><td>{r.x}</td><td>{r.y}</td><td>{r.z}</td></tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                            {fixRows.length > fixPreview.length && (
                                <div className="text-muted small mt-1">Mostrando {fixPreview.length} de {fixRows.length} filas.</div>
                            )}
                        </div>
                    )}
                </section>

                <hr />

                {/* 3) Comparación */}
                {navReady && fixReady && (
                    <section>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">Verificar distancias</h6>
                            <Button variant="primary" onClick={handleVerificar} disabled={enviando}>
                                Verificar distancias
                            </Button>
                        </div>

                        {!comparisonReady ? (
                            <div className="text-muted small">
                                (La tabla de comparación aparecerá aquí cuando presiones “Verificar distancias”)
                            </div>
                        ) : (
                            <div className="rg-table-scroll rg-table-scroll--lg">
                                <Table striped bordered hover size="sm" responsive>
                                    <thead>
                                        <tr>
                                            <th>GPS</th>
                                            <th>DIF EN X</th>
                                            <th>DIF EN Y</th>
                                            <th>DIF EN Z</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cmpRows.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center text-muted">Sin resultados</td></tr>
                                        ) : (
                                            cmpRows.map((r, i) => (
                                                <tr key={i}>
                                                    <td>{r.gps}</td>
                                                    <td className={Math.abs(r.dx) > THRESHOLD ? 'diff-bad' : ''}>{r.dx.toFixed(4)}</td>
                                                    <td className={Math.abs(r.dy) > THRESHOLD ? 'diff-bad' : ''}>{r.dy.toFixed(4)}</td>
                                                    <td className={Math.abs(r.dz) > THRESHOLD ? 'diff-bad' : ''}>{r.dz.toFixed(4)}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </section>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="danger" onClick={handleCancelar} disabled={enviando}>Cancelar</Button>
                <Button className="boton-crear" onClick={handleAceptar} disabled={!navReady || !fixReady || enviando}>
                    {enviando ? 'Enviando…' : 'Calcular Epoca'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalCalculoDifEnXYZ;
