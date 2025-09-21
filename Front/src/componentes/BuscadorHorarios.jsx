import React, { useState } from 'react';

function BuscadorHorarios({ onBuscar, horariosEstudiante = [] }) {
  const [horariosSeleccionados, setHorariosSeleccionados] = useState(horariosEstudiante);
  const [mostrarGrid, setMostrarGrid] = useState(false);

  // Generar horarios disponibles
  const generarHorarios = () => {
    const horarios = [];
    for (let hour = 6; hour <= 20; hour++) {
      horarios.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 20) {
        horarios.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return horarios;
  };

  const horarios = generarHorarios();
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  const toggleHora = (dia, hora) => {
    const horaId = `${dia}-${hora}`;
    const nuevosHorarios = horariosSeleccionados.includes(horaId)
      ? horariosSeleccionados.filter(h => h !== horaId)
      : [...horariosSeleccionados, horaId];
    
    setHorariosSeleccionados(nuevosHorarios);
  };

  const estaSeleccionada = (dia, hora) => {
    return horariosSeleccionados.includes(`${dia}-${hora}`);
  };

  const buscarChazas = () => {
    onBuscar(horariosSeleccionados);
    setMostrarGrid(false);
  };

  const limpiarSeleccion = () => {
    setHorariosSeleccionados([]);
    onBuscar([]);
  };

  return (
    <div className="buscador-horarios">
      <div className="buscador-header">
        <h3>¿Cuándo puedes trabajar?</h3>
        <p>Selecciona tus horarios disponibles para encontrar chazas compatibles</p>
      </div>

      <div className="horarios-seleccionados-resumen">
        <p><strong>Horas seleccionadas:</strong> {horariosSeleccionados.length}</p>
        <button 
          className="btn btn-secondary"
          onClick={() => setMostrarGrid(!mostrarGrid)}
        >
          {mostrarGrid ? 'Ocultar Horarios' : 'Seleccionar Horarios'}
        </button>
        {horariosSeleccionados.length > 0 && (
          <>
            <button 
              className="btn btn-primary"
              onClick={buscarChazas}
            >
              Buscar Chazas ({horariosSeleccionados.length} horas)
            </button>
            <button 
              className="btn btn-outline"
              onClick={limpiarSeleccion}
            >
              Limpiar
            </button>
          </>
        )}
      </div>

      {mostrarGrid && (
        <div className="horario-selector">
          <div className="selector-instruccion">
            <p>🔵 Haz clic en las horas que tienes disponibles para trabajar</p>
          </div>
          
          <div className="horario-grid">
            <div className="horario-header">
              <div className="hora-cell">Hora</div>
              {diasSemana.map(dia => (
                <div key={dia} className="dia-header">{dia}</div>
              ))}
            </div>

            {horarios.map(hora => (
              <div key={hora} className="horario-row">
                <div className="hora-cell">{hora}</div>
                {diasSemana.map(dia => {
                  const seleccionada = estaSeleccionada(dia, hora);
                  
                  return (
                    <div
                      key={`${dia}-${hora}`}
                      className={`hora-slot selectable ${seleccionada ? 'seleccionada' : ''}`}
                      onClick={() => toggleHora(dia, hora)}
                    >
                      <div className="slot-indicator">
                        {seleccionada ? '✓' : '○'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {horariosSeleccionados.length > 0 && (
        <div className="horas-seleccionadas-lista">
          <h4>Tus horarios seleccionados:</h4>
          <div className="horas-tags">
            {horariosSeleccionados.map(hora => (
              <span key={hora} className="hora-tag">
                {hora.replace('-', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BuscadorHorarios;