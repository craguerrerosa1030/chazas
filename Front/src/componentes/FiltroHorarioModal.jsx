import React, { useState } from 'react';

function FiltroHorarioModal({ isOpen, onClose, onAplicarFiltro, horariosPreseleccionados = [] }) {
  // Estado para los horarios seleccionados por el usuario
  const [horariosSeleccionados, setHorariosSeleccionados] = useState(horariosPreseleccionados);

  // Generar horas de 7:00 AM a 8:00 PM cada 30 minutos
  const generarHorarios = () => {
    const horarios = [];
    for (let hour = 7; hour <= 20; hour++) {
      horarios.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 20) {
        horarios.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return horarios;
  };

  const horarios = generarHorarios();
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  // Toggle de selección de hora individual
  const toggleHorario = (dia, hora) => {
    const horarioId = `${dia}-${hora}`;
    setHorariosSeleccionados(prev => {
      if (prev.includes(horarioId)) {
        // Deseleccionar
        return prev.filter(h => h !== horarioId);
      } else {
        // Seleccionar
        return [...prev, horarioId];
      }
    });
  };

  // Verificar si un horario está seleccionado
  const estaSeleccionado = (dia, hora) => {
    return horariosSeleccionados.includes(`${dia}-${hora}`);
  };

  // Limpiar todos los horarios
  const limpiarSeleccion = () => {
    setHorariosSeleccionados([]);
  };

  // Aplicar filtro y cerrar modal
  const handleAplicarFiltro = () => {
    onAplicarFiltro(horariosSeleccionados);
    onClose();
  };

  // Seleccionar día completo
  const seleccionarDiaCompleto = (dia) => {
    const horariosDelDia = horarios.map(hora => `${dia}-${hora}`);
    const todosSeleccionados = horariosDelDia.every(h => horariosSeleccionados.includes(h));
    
    if (todosSeleccionados) {
      // Deseleccionar todo el día
      setHorariosSeleccionados(prev => prev.filter(h => !h.startsWith(`${dia}-`)));
    } else {
      // Seleccionar todo el día
      const nuevosHorarios = [...horariosSeleccionados];
      horariosDelDia.forEach(h => {
        if (!nuevosHorarios.includes(h)) {
          nuevosHorarios.push(h);
        }
      });
      setHorariosSeleccionados(nuevosHorarios);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content filtro-horario-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header del modal */}
        <div className="modal-header">
          <div>
            <h2>🕐 Filtrar por Horario Disponible</h2>
            <p className="modal-subtitle">Selecciona las horas en las que estás disponible</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body del modal */}
        <div className="modal-body">
          
          {/* Instrucciones */}
          <div className="instrucciones-filtro">
            <p>
              <strong>📋 Instrucciones:</strong> Haz click en las horas en las que estás disponible para trabajar.
              Puedes seleccionar horas individuales en cualquier día.
            </p>
            <p className="tip">
              💡 <strong>Tip:</strong> Selecciona solo tus verdaderos huecos disponibles para encontrar chazas compatibles.
            </p>
          </div>

          {/* Resumen de selección */}
          <div className="resumen-seleccion">
            <p>
              <strong>Horas seleccionadas:</strong> 
              <span className={`contador-horas ${horariosSeleccionados.length > 0 ? 'activo' : ''}`}>
                {horariosSeleccionados.length}
              </span>
            </p>
          </div>

          {/* Acciones rápidas */}
          <div className="acciones-rapidas">
            <button 
              className="btn-accion-rapida"
              onClick={limpiarSeleccion}
              disabled={horariosSeleccionados.length === 0}
            >
              🗑️ Limpiar Todo
            </button>
            <div className="seleccionar-dias">
              <span>Seleccionar día completo:</span>
              {diasSemana.map(dia => (
                <button
                  key={dia}
                  className="btn-dia-completo"
                  onClick={() => seleccionarDiaCompleto(dia)}
                >
                  {dia.substring(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de horarios */}
          <div className="horario-grid-container">
            <div className="horario-grid">
              
              {/* Header con días de la semana */}
              <div className="horario-header">
                <div className="hora-cell header-corner">Hora</div>
                {diasSemana.map(dia => (
                  <div 
                    key={dia} 
                    className="dia-header clickable"
                    onClick={() => seleccionarDiaCompleto(dia)}
                    title={`Click para seleccionar todo ${dia}`}
                  >
                    {dia}
                  </div>
                ))}
              </div>

              {/* Filas con horas */}
              {horarios.map(hora => (
                <div key={hora} className="horario-row">
                  <div className="hora-cell">{hora}</div>
                  {diasSemana.map(dia => {
                    const seleccionado = estaSeleccionado(dia, hora);
                    
                    return (
                      <div
                        key={`${dia}-${hora}`}
                        className={`hora-slot selectable ${seleccionado ? 'seleccionada-filtro' : ''}`}
                        onClick={() => toggleHorario(dia, hora)}
                        title={seleccionado ? 'Click para deseleccionar' : 'Click para seleccionar'}
                      >
                        <div className="slot-indicator">
                          {seleccionado ? '✓' : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Horarios seleccionados - Preview */}
          {horariosSeleccionados.length > 0 && (
            <div className="preview-horarios-seleccionados">
              <h4>📅 Horarios que seleccionaste:</h4>
              <div className="horarios-preview-list">
                {horariosSeleccionados.slice(0, 15).map(horario => (
                  <span key={horario} className="horario-preview-tag">
                    {horario.replace('-', ' ')}
                  </span>
                ))}
                {horariosSeleccionados.length > 15 && (
                  <span className="mas-horarios">
                    +{horariosSeleccionados.length - 15} más
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="modal-footer">
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleAplicarFiltro}
            disabled={horariosSeleccionados.length === 0}
          >
            🔍 Filtrar Chazas ({horariosSeleccionados.length} horas)
          </button>
        </div>
      </div>
    </div>
  );
}

export default FiltroHorarioModal;