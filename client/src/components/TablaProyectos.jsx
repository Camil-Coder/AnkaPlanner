// Importaciones
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import Swal from 'sweetalert2'; // Librería para mostrar alertas elegantes
import { DotLottieReact } from '@lottiefiles/dotlottie-react'; // Animación de carga 
import { Table, Button, Spinner, Form } from 'react-bootstrap';
import { obtenerProyectos } from '../services/proyectoService';
import { TablaDiasRastreos } from './TablaDiasRastreos';
import ModalModificarProyecto from './ModalModificarProyecto';
import NombreProyectoToggle from './NombreProyectoToggle';

//******************************************************************************************************
const TablaProyectos = forwardRef(({ refrescarProyectos }, ref) => {

  const [todosLosProyectos, setTodosLosProyectos] = useState([]);// Lista completa de proyectos (sin filtrar)
  const [proyectosFiltrados, setProyectosFiltrados] = useState([]);// Lista filtrada que se muestra
  const [cargando, setCargando] = useState(true);// Estado para saber si se está cargando la tabla
  const [filaActiva, setFilaActiva] = useState(null);// ID del proyecto cuya fila está desplegada

  // Estado del campo de búsqueda
  const [busqueda, setBusqueda] = useState('');

  // Ordena por fecha descendente (más nuevos primero)
  const ordenarPorFechaDesc = (arr) =>
    [...arr].sort((a, b) => new Date(b.FECHA_CREACION) - new Date(a.FECHA_CREACION));

  // Estado para el modal y el proyecto seleccionado
  const [modalAbierto, setModalAbierto] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);



  // Función para cargar proyectos desde la API
  const cargarProyectos = async () => {
    try {
      setCargando(true);
      const data = await obtenerProyectos();
      const ordenados = ordenarPorFechaDesc(data);  // ⬅️ ordenar aquí
      setTodosLosProyectos(ordenados);         // Guarda la lista completa
      setProyectosFiltrados(ordenados);        // Inicialmente muestra todo

    } catch (err) {
      console.error('Error al cargar proyectos:', err);
      Swal.fire('Error', 'No se pudieron cargar los proyectos.', 'error');
    } finally {
      setCargando(false);
    }
  };

  // Permite al componente padre refrescar la tabla desde fuera
  useImperativeHandle(ref, () => ({
    refrescarTablaExternamente: () => {
      cargarProyectos();
    }
  }));

  // Ejecuta una vez al montar el componente
  useEffect(() => {
    cargarProyectos();
  }, []);

  // Formato de fecha YYYY-MM-DD
  const formatearFecha = (isoString) => {
    const fecha = new Date(isoString);
    return fecha.toISOString().split('T')[0];
  };

  // Abre/cierra la fila de detalle
  const toggleFila = (idProyecto) => {
    setFilaActiva((prev) => (prev === idProyecto ? null : idProyecto));
  };

  // Filtra proyectos cuando se escribe en la barra de búsqueda
  const handleBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    const texto = valor.toLowerCase();

    // Filtra por nombre del proyecto, empresa o topógrafo
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

  // Si está cargando, mostramos un spinner
  if (cargando) {
    return (
      <div className="d-flex align-items-center mt-3">
        <DotLottieReact src="https://lottie.host/d9b46d70-8e00-4356-9307-6152c917c64b/iMuNvyZS6n.lottie" autoplay loop style={{ height: 400, width: 400, margin: '0 auto' }} />
      </div>
    );
  }

  // Render principal
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
            <th>Fecha de carga</th>
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
                <td>  {p.NOMBRE_TOPOGRAFO?.toLowerCase().endsWith('-eliminado')
                  ? p.NOMBRE_TOPOGRAFO.slice(0, -10) // quita los últimos 10 caracteres
                  : p.NOMBRE_TOPOGRAFO}</td>
                <td>{p.NOMBRE_EMPRESA}</td>
                <td>{formatearFecha(p.FECHA_CREACION)}</td>
                <td>{p.RADIO_BUSQUEDA}</td>
                <td>{p.ESTADO_RED}</td>
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

                        {/* Tarjeta: Días de Rastreo */}
                        <div id={`rg-${p.ID_PROYECTO}-rastreos-card`}>
                          <div id={`rg-${p.ID_PROYECTO}-rastreos-header`}>
                            <span id={`rg-${p.ID_PROYECTO}-rastreos-title`}>
                              <span id={`rg-${p.ID_PROYECTO}-rastreos-dot`} />
                              Días de Rastreo
                            </span>
                            {/* botón opcional a la derecha */}
                            {/* <Button size="sm" style={{ backgroundColor:'#F47C27', border:'none' }}>+ Nuevo Día</Button> */}
                          </div>
                          <div id={`rg-${p.ID_PROYECTO}-rastreos-body`}>
                            <TablaDiasRastreos
                              id_proyecto={p.ID_PROYECTO}
                              radio_busqueda={p.RADIO_BUSQUEDA}
                              estado_geo={p.estado_geo}
                              cargarP={cargarProyectos}
                              refrescar={refrescarProyectos}
                              />
                          </div>
                        </div>

                        {/* Tarjeta: Cambio de Época */}
                        <div id={`rg-${p.ID_PROYECTO}-epoca-card`}>
                          <div id={`rg-${p.ID_PROYECTO}-epoca-header`}>
                            <span id={`rg-${p.ID_PROYECTO}-epoca-title`}>
                              <span id={`rg-${p.ID_PROYECTO}-epoca-dot`} />
                              Cambio de Época
                            </span>
                          </div>
                          <div id={`rg-${p.ID_PROYECTO}-epoca-body`}>
                            <small className="text-muted">
                              Aquí verás el estado y acciones del cambio de época.
                            </small>
                          </div>
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
      <ModalModificarProyecto show={modalAbierto} onHide={cerrarModal} proyecto={proyectoSeleccionado} onActualizado={() => { cargarProyectos(); }}
      />
    </>
  );
});

export default TablaProyectos;
