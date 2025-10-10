import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function ChazaDetalleModal({ isOpen, onClose, chaza, horariosUsuario = [], onNavegar }) {
  const { user, isAuthenticated, isEstudiante } = useAuth();
  const [horasSeleccionadas, setHorasSeleccionadas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Generar horarios de 7:00 AM a 8:00 PM
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

  // Verificar si un horario está disponible en la chaza
  const estaDisponible = (dia, hora) => {
    return chaza.horariosDisponibles?.includes(`${dia}-${hora}`) || false;
  };

  // Verificar si un horario coincide con los del usuario (filtro aplicado)
  const esCoincidencia = (dia, hora) => {
    return horariosUsuario.includes(`${dia}-${hora}`);
  };

  // Verificar si un horario está seleccionado por el usuario para postularse
  const estaSeleccionada = (dia, hora) => {
    return horasSeleccionadas.includes(`${dia}-${hora}`);
  };

  // Toggle de selección de hora para postularse
  const toggleHora = (dia, hora) => {
    const horaId = `${dia}-${hora}`;
    
    // Solo permitir seleccionar si está disponible
    if (!estaDisponible(dia, hora)) {
      return;
    }

    setHorasSeleccionadas(prev => {
      if (prev.includes(horaId)) {
        return prev.filter(h => h !== horaId);
      } else {
        return [...prev, horaId];
      }
    });
  };

  // Enviar propuesta
  const enviarPropuesta = async () => {
    if (horasSeleccionadas.length === 0) {
      alert('❌ Debes seleccionar al menos una hora');
      return;
    }

    if (!isAuthenticated()) {
      alert('❌ Debes iniciar sesión para enviar propuestas');
      onClose();
      onNavegar('login');
      return;
    }

    if (!isEstudiante()) {
      alert('❌ Solo los estudiantes pueden enviar propuestas');
      return;
    }

    setEnviando(true);

    try {
      // Crear objeto de propuesta
      const nuevaPropuesta = {
        id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        chazaId: chaza.id,
        chazaNombre: chaza.nombre,
        ubicacionChaza: chaza.ubicacion,
        estudianteId: user.id,
        estudianteNombre: user.nombre,
        estudianteEmail: user.email,
        horasSeleccionadas: horasSeleccionadas,
        mensaje: mensaje,
        estado: 'pendiente',
        fechaEnvio: new Date().toISOString(),
        duenioChaza: chaza.duenioNombre || 'Sin nombre'
      };

      // Obtener propuestas existentes
      const propuestasExistentes = JSON.parse(localStorage.getItem('propuestas') || '[]');

      // Verificar si ya existe una propuesta pendiente
      const propuestaExistente = propuestasExistentes.find(
        p => p.chazaId === chaza.id && 
             p.estudianteId === user.id && 
             p.estado === 'pendiente'
      );

      if (propuestaExistente) {
        alert('⚠️ Ya tienes una propuesta pendiente para esta chaza.');
        setEnviando(false);
        return;
      }

      // Agregar nueva propuesta
      propuestasExistentes.push(nuevaPropuesta);
      localStorage.setItem('propuestas', JSON.stringify(propuestasExistentes));

      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert(`✅ ¡Propuesta enviada exitosamente!
      
📋 Resumen:
• Chaza: ${chaza.nombre}
• Horas solicitadas: ${horasSeleccionadas.length}
• Estado: Pendiente de revisión

El dueño revisará tu propuesta pronto.`);

      // Limpiar y cerrar
      setHorasSeleccionadas([]);
      setMensaje('');
      onClose();

    } catch (error) {
      console.error('Error enviando propuesta:', error);
      alert('❌ Error enviando la propuesta. Por favor intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content chaza-detalle-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header del modal */}
        <div className="modal-header">
          <div>
            <h2>{chaza.nombre}</h2>
            <p className="modal-subtitle">📍 {chaza.ubicacion}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body del modal */}
        <div className="modal-body">
          
          {/* Información básica de la chaza */}
          <div className="chaza-info-detalle">
            <div className="info-section">
              <h3>ℹ️ Información de la Chaza</h3>
              <div className="info-grid-detalle">
                <div className="info-item">
                  <span className="info-label">👤 Dueño:</span>
                  <span className="info-value">{chaza.duenioNombre}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">📧 Correo:</span>
                  <span className="info-value">{chaza.duenioEmail}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">📱 Teléfono:</span>
                  <span className="info-value">{chaza.telefono || 'No disponible'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">⏰ Horario:</span>
                  <span className="info-value">{chaza.horarios}</span>
                </div>
              </div>

              {chaza.descripcion && (
                <div className="descripcion-detalle">
                  <p><strong>📝 Descripción:</strong></p>
                  <p>{chaza.descripcion}</p>
                </div>
              )}

              {/* Productos */}
              {chaza.productos && chaza.productos.length > 0 && (
                <div className="productos-detalle">
                  <p><strong>🛍️ Productos:</strong></p>
                  <div className="productos-tags">
                    {chaza.productos.map((producto, index) => (
                      <span key={index} className="producto-tag">
                        {producto}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Horarios disponibles */}
          <div className="horarios-section">
            <h3>📅 Horarios Disponibles para Trabajadores</h3>
            
            {/* Leyenda */}
            <div className="horarios-leyenda">
              <div className="leyenda-item">
                <div className="leyenda-color disponible"></div>
                <span>Disponible</span>
              </div>
              {horariosUsuario.length > 0 && (
                <div className="leyenda-item">
                  <div className="leyenda-color coincidencia"></div>
                  <span>Coincide con tu horario</span>
                </div>
              )}
              {isAuthenticated() && isEstudiante() && (
                <div className="leyenda-item">
                  <div className="leyenda-color seleccionada"></div>
                  <span>Seleccionada para postular</span>
                </div>
              )}
              <div className="leyenda-item">
                <div className="leyenda-color no-disponible"></div>
                <span>No disponible</span>
              </div>
            </div>

            {/* Instrucción */}
            {isAuthenticated() && isEstudiante() && (
              <p className="instruccion-horarios">
                💡 Haz click en las horas disponibles (verdes/azules) para seleccionarlas y postularte
              </p>
            )}

            {/* Grid de horarios */}
            <div className="horario-grid-detalle">
              <div className="horario-grid">
                
                {/* Header */}
                <div className="horario-header">
                  <div className="hora-cell">Hora</div>
                  {diasSemana.map(dia => (
                    <div key={dia} className="dia-header">{dia}</div>
                  ))}
                </div>

                {/* Filas */}
                {horarios.map(hora => (
                  <div key={hora} className="horario-row">
                    <div className="hora-cell">{hora}</div>
                    {diasSemana.map(dia => {
                      const disponible = estaDisponible(dia, hora);
                      const coincidencia = esCoincidencia(dia, hora);
                      const seleccionada = estaSeleccionada(dia, hora);
                      
                      let claseSlot = 'hora-slot';
                      if (disponible) {
                        claseSlot += ' disponible-chaza';
                      }
                      if (coincidencia && disponible) {
                        claseSlot += ' coincidencia-horario';
                      }
                      if (seleccionada) {
                        claseSlot += ' seleccionada-postular';
                      }
                      if (disponible && isEstudiante() && isAuthenticated()) {
                        claseSlot += ' clickeable';
                      }

                      return (
                        <div
                          key={`${dia}-${hora}`}
                          className={claseSlot}
                          onClick={() => toggleHora(dia, hora)}
                          title={
                            !disponible ? 'No disponible' :
                            seleccionada ? 'Click para deseleccionar' :
                            coincidencia ? 'Coincide con tu horario - Click para seleccionar' :
                            'Click para seleccionar'
                          }
                        >
                          {disponible && (
                            <div className="slot-indicator">
                              {seleccionada ? '✓' : coincidencia ? '★' : '○'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sección de postulación - Solo para estudiantes autenticados */}
          {isAuthenticated() && isEstudiante() && (
            <div className="postulacion-section">
              <h3>📝 Postúlate a esta Chaza</h3>
              
              {/* Resumen de horas seleccionadas */}
              <div className="horas-seleccionadas-resumen">
                <p>
                  <strong>Horas seleccionadas:</strong> 
                  <span className={`contador ${horasSeleccionadas.length > 0 ? 'activo' : ''}`}>
                    {horasSeleccionadas.length}
                  </span>
                </p>
                
                {horasSeleccionadas.length > 0 && (
                  <div className="horas-preview-postular">
                    {horasSeleccionadas.map(hora => (
                      <span key={hora} className="hora-preview">
                        {hora.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Mensaje opcional */}
              <div className="mensaje-postulacion">
                <label htmlFor="mensaje">Mensaje para el dueño (opcional):</label>
                <textarea
                  id="mensaje"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Cuéntale al dueño por qué eres el candidato ideal para su chaza..."
                  rows={3}
                  disabled={enviando}
                />
              </div>

              {/* Botón de envío */}
              <button
                onClick={enviarPropuesta}
                className="btn btn-primary btn-large"
                disabled={horasSeleccionadas.length === 0 || enviando}
              >
                {enviando ? (
                  <>⏳ Enviando...</>
                ) : (
                  <>🚀 Enviar Propuesta ({horasSeleccionadas.length} horas)</>
                )}
              </button>
            </div>
          )}

          {/* Mensaje para no autenticados */}
          {!isAuthenticated() && (
            <div className="no-auth-message">
              <h3>🔐 Inicia sesión para postularte</h3>
              <p>Debes tener una cuenta de estudiante para enviar propuestas</p>
              <div className="auth-actions">
                <button 
                  onClick={() => { onClose(); onNavegar('login'); }}
                  className="btn btn-primary"
                >
                  Iniciar Sesión
                </button>
                <button 
                  onClick={() => { onClose(); onNavegar('registro'); }}
                  className="btn btn-secondary"
                >
                  Registrarse
                </button>
              </div>
            </div>
          )}

          {/* Mensaje para chazeros */}
          {isAuthenticated() && !isEstudiante() && (
            <div className="chazero-view-message">
              <p>👨‍💼 Como chazero, puedes ver los horarios pero no postularte</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChazaDetalleModal;