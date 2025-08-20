// C:\BotAuto-Full\client\src\components\TablaProyectos.jsx

// Importaciones
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import Swal from 'sweetalert2';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Table, Button, Form } from 'react-bootstrap';
import { obtenerProyectos } from '../services/proyectoService';
import { TablaDiasRastreos } from './TablaDiasRastreos';
import { TablaCambioDeEpoca } from './TablaCambioDeEpoca';
import ModalModificarProyecto from './ModalModificarProyecto';
import NombreProyectoToggle from './NombreProyectoToggle';

//******************************************************************************************************
const TablaProyectos = forwardRef(({ refrescarProyectos }, ref) => {

  const [todosLosProyectos, setTodosLosProyectos] = useState([]);
  const [proyectosFiltrados, setProyectosFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filaActiva, setFilaActiva] = useState(null); // Proyecto desplegado

  // ✅ NUEVO: panel activo dentro del proyecto (solo uno a la vez: 'rastreos' | 'epoca' | null)
  const [panelActivo, setPanelActivo] = useState(null);

  const [busqueda, setBusqueda] = useState('');
  const ordenarPorFechaDesc = (arr) =>
    [...arr].sort((a, b) => new Date(b.FECHA_CREACION) - new Date(a.FECHA_CREACION));

  const [modalAbierto, setModalAbierto] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

  const cargarProyectos = async () => {
    try {
      setCargando(true);
      const data = await obtenerProyectos();
      const ordenados = ordenarPorFechaDesc(data);
      setTodosLosProyectos(ordenados);
      setProyectosFiltrados(ordenados);
    } catch (err) {
      console.error('Error al cargar proyectos:', err);
      Swal.fire('Error', 'No se pudieron cargar los proyectos.', 'error');
    } finally {
      setCargando(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refrescarTablaExternamente: () => {
      cargarProyectos();
    }
  }));

  useEffect(() => {
    cargarProyectos();
  }, []);

  const formatearFecha = (isoString) => {
    const fecha = new Date(isoString);
    return fecha.toISOString().split('T')[0];
  };

  // Abre/cierra la fila de detalle; al cambiar de proyecto, resetea el panel activo
  const toggleFila = (idProyecto) => {
    setFilaActiva((prev) => {
      const siguiente = prev === idProyecto ? null : idProyecto;
      if (siguiente !== prev) setPanelActivo(null); // 🔒 nunca quedan dos paneles abiertos
      return siguiente;
    });
  };

  // ✅ NUEVO: alterna el panel dentro del proyecto (solo uno abierto)
  const togglePanel = (panel) => {
    setPanelActivo((prev) => (prev === panel ? null : panel));
  };

  const handleBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    const texto = valor.toLowerCase();

    const filtrados = todosLosProyectos.filter(p =>
      p.NOMBRE_PROYECTO.toLowerCase().includes(texto) ||
      p.NOMBRE_EMPRESA.toLowerCase().includes(texto) ||
      p.NOMBRE_TOPOGRAFO.toLowerCase().includes(texto)
    );

    setProyectosFiltrados(filtrados);
  };

  const abrirModal = (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setProyectoSeleccionado(null);
  };

  if (cargando) {
    return (
      <div className="d-flex align-items-center mt-3">
        <DotLottieReact src="https://lottie.host/d9b46d70-8e00-4356-9307-6152c917c64b/iMuNvyZS6n.lottie" autoplay loop style={{ height: 400, width: 400, margin: '0 auto' }} />
      </div>
    );
  }

  return (
    <>
      <h2 className="mt-4"><strong>Proyectos</strong></h2>

      {/* Barra de búsqueda */}
      <Form.Group className="mb-3 mt-3">
        <Form.Control type="text" placeholder="Buscar por nombre de proyecto, empresa o topógrafo..." value={busqueda} onChange={handleBusqueda} />
      </Form.Group>

      {/* Tabla con los proyectos filtrados */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nombre Proyecto</th>
            <th>Topógrafo</th>
            <th>Empresa</th>
            <th>Fecha de creación</th>
            <th>Radio Búsqueda</th>
            <th>Estado RedGeoScan</th>
            <th>Estado Cambio de Época</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {proyectosFiltrados.map((p) => (
            <React.Fragment key={p.ID_PROYECTO}>
              {/* Fila principal */}
              <tr style={{ cursor: 'pointer' }}>
                <td>
                  <NombreProyectoToggle
                    abierto={filaActiva === p.ID_PROYECTO}
                    onToggle={() => toggleFila(p.ID_PROYECTO)}
                  >
                    {p.NOMBRE_PROYECTO}
                  </NombreProyectoToggle>
                </td>
                <td>
                  {p.NOMBRE_TOPOGRAFO?.toLowerCase().endsWith('-eliminado')
                    ? p.NOMBRE_TOPOGRAFO.slice(0, -10)
                    : p.NOMBRE_TOPOGRAFO}
                </td>
                <td>{p.NOMBRE_EMPRESA}</td>
                <td>{formatearFecha(p.FECHA_CREACION)}</td>
                <td>{p.RADIO_BUSQUEDA}</td>
                <td>
                  {/^\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2}:\d{2})?$/.test(String(p.ESTADO_RED || '').trim())
                    ? 'En Proceso'
                    : p.ESTADO_RED}
                </td>
                <td>{p.ESTADO_GEO}</td>
                <td>
                  <Button style={{ backgroundColor: '#F47C27', border: 'none' }} size="sm" onClick={(e) => { e.stopPropagation(); abrirModal(p); }}>Modificar</Button>
                </td>
              </tr>

              {/* Fila desplegable */}
              {filaActiva === p.ID_PROYECTO && (
                <tr>
                  <td colSpan="8" style={{ padding: 0 }}>
                    <div id={`rg-${p.ID_PROYECTO}-wrap`}>
                      <div id={`rg-${p.ID_PROYECTO}-inner`}>

                        {/* Tarjeta: Días de Rastreo (cabecera clickeable) */}
                        <div id={`rg-${p.ID_PROYECTO}-rastreos-card`}>
                          <div
                            id={`rg-${p.ID_PROYECTO}-rastreos-header`}
                            role="button"
                            tabIndex={0}
                            onClick={() => togglePanel('rastreos')}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') togglePanel('rastreos'); }}
                            style={{ cursor: 'pointer' }}
                          >
                            <span id={`rg-${p.ID_PROYECTO}-rastreos-title`}>
                              <span id={`rg-${p.ID_PROYECTO}-rastreos-dot`} />
                              Días de Rastreo
                              <span style={{ marginLeft: 8 }}>{panelActivo === 'rastreos' ? '▾' : '▸'}</span>
                            </span>
                          </div>

                          {/* Solo se muestra si este panel está activo */}
                          {panelActivo === 'rastreos' && (
                            <div id={`rg-${p.ID_PROYECTO}-rastreos-body`}>
                              <TablaDiasRastreos
                                id_proyecto={p.ID_PROYECTO}
                                fecha_creacion={formatearFecha(p.FECHA_CREACION)}
                                radio_busqueda={p.RADIO_BUSQUEDA}
                                estado_geo={p.estado_geo}
                                cargarP={cargarProyectos}
                                refrescar={refrescarProyectos}
                              />
                            </div>
                          )}
                        </div>

                        {/* Tarjeta: Cambio de Época (cabecera clickeable) */}
                        <div id={`rg-${p.ID_PROYECTO}-epoca-card`} style={{ marginTop: 12 }}>
                          <div
                            id={`rg-${p.ID_PROYECTO}-epoca-header`}
                            role="button"
                            tabIndex={0}
                            onClick={() => togglePanel('epoca')}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') togglePanel('epoca'); }}
                            style={{ cursor: 'pointer' }}
                          >
                            <span id={`rg-${p.ID_PROYECTO}-epoca-title`}>
                              <span id={`rg-${p.ID_PROYECTO}-epoca-dot`} />
                              Cambio de Época
                              <span style={{ marginLeft: 8 }}>{panelActivo === 'epoca' ? '▾' : '▸'}</span>
                            </span>
                          </div>

                          {/* Solo se muestra si este panel está activo */}
                          {panelActivo === 'epoca' && (
                            <div id={`rg-${p.ID_PROYECTO}-epoca-body`}>
                              <TablaCambioDeEpoca
                                id_proyecto={p.ID_PROYECTO}
                                cargarP={cargarProyectos}
                                refrescar={refrescarProyectos}
                              />
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </Table>

      <ModalModificarProyecto
        show={modalAbierto}
        onHide={cerrarModal}
        proyecto={proyectoSeleccionado}
        onActualizado={() => { cargarProyectos(); }}
      />
    </>
  );
});

export default TablaProyectos;
