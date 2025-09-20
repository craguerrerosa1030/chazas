import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function ChazaModal({ chaza, isOpen, onClose }) {
  const { user, isAuthenticated, isEstudiante } = useAuth();
  const [horasSeleccionadas, setHorasSeleccionadas] = useState([]);
  const [mensaje, setMensaje] = useState('');

  // Horarios disponibles de 6:00 AM a 8:00 PM cada media hora
  const generarHorarios = () => {
    const horarios = [];
    for (let hour = 6; hour <= 20; hour++) {
      horarios.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 20) { // No agregar :30 a las 20:00
        horarios.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return horarios;
  };

  const horarios = generarHorarios();
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  // Función para seleccionar/deseleccionar horas
  const toggleHora = (dia, hora) => {
    const horaId = `${dia}-${hora}`;
    setHorasSeleccionadas(prev => {
      if (prev.includes(horaId)) {
        return prev.filter(h => h !== horaId);
      } else {
        return [...prev, horaId];
      }
    });
  };

  // Verificar si una hora está disponible (simulado)
  const estaDisponible = (dia, hora) => {
    return chaza.horariosDisponibles?.includes(`${dia}-${hora}`) || false;
  };

  // Verificar si una hora está seleccionada por el usuario
  const estaSeleccionada = (dia, hora) => {
    return horasSeleccionadas.includes(`${dia}-${hora}`);
  };

  // Enviar propuesta
  const enviarPropuesta = () => {
    if (horasSeleccionadas.length === 0) {
      alert('Debes seleccionar al menos una hora');
      return;
    }

    console.log('Propuesta enviada:', {
      chazaId: chaza.id,
      usuarioId: user.id,
      horas: horasSeleccionadas,
      mensaje: mensaje
    });

    alert(`¡Propuesta enviada! Has aplicado para ${horasSeleccionadas.length} horas`);
    setHorasSeleccionadas([]);
    setMensaje('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header del modal */}
        <div className="modal-header">
          <h2>{chaza.nombre}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Información del dueño */}
          <section className="chaza-info-section">
            <h3>Información del Dueño</h3>
            <div className="owner-info">
              <p><strong>Nombre:</strong> {chaza.dueno?.nombre}</p>
              <p><strong>Correo:</strong> {chaza.dueno?.email}</p>
              <p><strong>Ubicación:</strong> {chaza.ubicacion}</p>
            </div>
          </section>

          {/* Productos manejados */}
          <section className="productos-section">
            <h3>Productos que Maneja</h3>
            <div className="productos-list">
              {chaza.productos?.map((producto, index) => (
                <span key={index} className="producto-tag">
                  {producto}
                </span>
              ))}
            </div>
          </section>

          {/* Horario semanal */}
          <section className="horario-section">
            <h3>Horas Disponibles para Trabajo</h3>
            <p className="horario-instruccion">
              🟢 Verde = Horas que necesita cubrir | 
              🔵 Azul = Horas que seleccionaste
            </p>
            
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
                    const disponible = estaDisponible(dia, hora);
                    const seleccionada = estaSeleccionada(dia, hora);
                    
                    return (
                      <div
                        key={`${dia}-${hora}`}
                        className={`hora-slot ${
                          disponible ? 'disponible' : ''
                        } ${
                          seleccionada ? 'seleccionada' : ''
                        }`}
                        onClick={() => disponible && isEstudiante() && toggleHora(dia, hora)}
                      >
                        {disponible && (
                          <div className="slot-indicator">
                            {seleccionada ? '✓' : '○'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>

          {/* Sección de postulación */}
          {isAuthenticated() && isEstudiante() && (
            <section className="postulacion-section">
              <h3>Enviar Propuesta</h3>
              <div className="horas-seleccionadas">
                <p><strong>Horas seleccionadas:</strong> {horasSeleccionadas.length}</p>
                {horasSeleccionadas.length > 0 && (
                  <div className="horas-list">
                    {horasSeleccionadas.map(hora => (
                      <span key={hora} className="hora-selected">
                        {hora.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mensaje-propuesta">
                <label>Mensaje (opcional):</label>
                <textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Escribe un mensaje para el dueño de la chaza..."
                  rows={3}
                />
              </div>

              <button 
                onClick={enviarPropuesta}
                className="btn btn-primary"
                disabled={horasSeleccionadas.length === 0}
              >
                Enviar Propuesta ({horasSeleccionadas.length} horas)
              </button>
            </section>
          )}

          {!isAuthenticated() && (
            <div className="auth-required">
              <p>Debes iniciar sesión para postularte</p>
              <button className="btn btn-primary">Iniciar Sesión</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChazaModal;