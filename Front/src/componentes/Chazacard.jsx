import React from 'react';

function ChazaCard({ chaza }) {
  const handleEnviarPropuesta = () => {
    console.log('Enviando propuesta a:', chaza.nombre);
    // Aquí irá la lógica para enviar propuesta
  };

  return (
    <div className="chaza-card">
      <div className="chaza-card-header">
        <h3>{chaza.nombre}</h3>
        <span className="chaza-pago">${chaza.pago.toLocaleString()}/hora</span>
      </div>
      
      <div className="chaza-card-body">
        <p><strong>Ubicación:</strong> {chaza.ubicacion}</p>
        <p><strong>Horarios:</strong> {chaza.horarios}</p>
        <p>{chaza.descripcion}</p>
      </div>
      
      <div className="chaza-card-footer">
        <button 
          className="btn btn-primary"
          onClick={handleEnviarPropuesta}
        >
          Enviar Propuesta
        </button>
      </div>
    </div>
  );
}

export default ChazaCard;