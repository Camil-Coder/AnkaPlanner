// App.jsx
import React, { useRef } from 'react';
import Header from './components/Header';
import TablaProyectos from './components/TablaProyectos';
import './App.css';

const App = () => {
  const tablaRef = useRef();

  // Esta función se pasará a Header y luego al Modal para refrescar
  const refrescarProyectos = () => {
    if (tablaRef.current) {
      tablaRef.current.refrescarTablaExternamente();
    }
  };

  return (
    <>
      <Header refrescarProyectos={refrescarProyectos} />
      <TablaProyectos ref={tablaRef} />
    </>
  );
};

export default App;
