// src/components/NombreProyectoToggle.jsx
import React from 'react';

const NombreProyectoToggle = ({ abierto, onToggle, children }) => {
    return (
        <span
            onClick={onToggle}
            style={{
                cursor: 'pointer',
                userSelect: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
            }}
            role="button"
            aria-expanded={abierto}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') onToggle();
            }}
            title={abierto ? 'Contraer' : 'Desplegar'}
        >
            {/* ▸ cerrado / ▾ abierto */}
            <span style={{ fontSize: 14, color: '#555' }}>
                {abierto ? '▾' : '▸'}
            </span>
            <span>{children}</span>
        </span>
    );
};

export default React.memo(NombreProyectoToggle);
