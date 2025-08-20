// C:\BotAuto-Full\client\src\components\TablaDIfer.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { consultarDiferencias } from '../services/reportesService';
import * as XLSX from 'xlsx';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const TablaDIfer = ({ idDiaRastreo }) => {
  const [data, setData] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setCargando(true);
        const blob = await consultarDiferencias(idDiaRastreo);

        if (!blob) {
          setData([]);
          return;
        }

        const buffer = await blob.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const hoja = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(hoja, { header: 1 });

        setData(json); // matriz [ [headers...], [fila1...], ... ]
      } catch (error) {
        console.error('Error al leer diferencias:', error);
        setData([]);
      } finally {
        setCargando(false);
      }
    };

    if (idDiaRastreo) fetchData();
  }, [idDiaRastreo]);

  // Indices de columnas que queremos formatear a "máximo 2 decimales + m"
  const meterCols = useMemo(() => {
    if (!data.length) return new Set();
    const headers = data[0].map((h) => String(h || '').toLowerCase().trim());
    const objetivo = new Set(['dif en x', 'dif en y', 'dif en z']); // columnas esperadas
    const idxs = new Set();
    headers.forEach((h, i) => {
      if (objetivo.has(h)) idxs.add(i);
    });
    return idxs;
  }, [data]);

  // Formateador: máximo 2 decimales y sufijo " m"
  const formatMeters = (val) => {
    if (val === null || val === undefined || val === '') return val;
    const n = typeof val === 'number' ? val : Number(String(val).replace(',', '.'));
    if (!Number.isFinite(n)) return val; // si no es número, lo dejamos como está
    const s = n.toLocaleString('es-CO', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });
    return `${s} m`;
  };

  if (cargando) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center text-center p-3">
        <DotLottieReact
          src="https://lottie.host/d9b46d70-8e00-4356-9307-6152c917c64b/iMuNvyZS6n.lottie"
          loop
          autoplay
          style={{ height: 200, width: 200 }}
        />
        <p className="mt-3">Cargando diferencias... ⏳</p>
      </div>
    );
  }

  if (data.length === 0) {
    return <div className="text-muted p-2">⚠️ Sin diferencias registradas</div>;
  }

  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <table className="table table-sm table-bordered">
        <thead>
          <tr>
            {data[0].map((col, i) => (
              <th key={i}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(1).map((fila, i) => (
            <tr key={i}>
              {fila.map((celda, j) => (
                <td key={j}>
                  {meterCols.has(j) ? formatMeters(celda) : celda}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaDIfer;
