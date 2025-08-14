// App.jsx
import React, { useRef } from 'react';
import Header from './components/Header';
import TablaProyectos from './components/TablaProyectos';
import Resumen from './components/Resumen';
import './App.css';

const App = () => {
  const tablaRef = useRef();
  const resumenRef = useRef();

  // Esta función se pasará a Header y luego al Modal para refrescar
  const refrescarProyectos = () => {
    if (tablaRef.current) {
      tablaRef.current.refrescarTablaExternamente();
    }
    if (resumenRef.current){
      resumenRef.current.refrescarTablaResumen();
    }
  };



  return (
    <>
      <Header refrescarProyectos={refrescarProyectos} />
      <br />
        < Resumen ref={resumenRef}/>
      <main style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <section style={{ width: '95%' }}>
          <TablaProyectos ref={tablaRef} refrescarProyectos={refrescarProyectos} />
        </section>
      </main>
    </>
  );
};

export default App;
