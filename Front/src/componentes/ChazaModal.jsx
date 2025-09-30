import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function ChazaModal({ chaza, isOpen, onClose }) {
  const { user, isAuthenticated, isEstudiante } = useAuth();
  const [horasSeleccionadas, setHorasSeleccionadas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

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

  // Verificar si una hora está disponible (según la chaza)
  const estaDisponible = (dia, hora) => {
    return chaza.horariosDisponibles?.includes(`${dia}-${hora}`) || false;
  };

  // Verificar si una hora está seleccionada por el usuario
  const estaSeleccionada = (dia, hora) => {
    return horasSeleccionadas.includes(`${dia}-${hora}`);
  };

  // Generar ID único para la propuesta
  const generarIdPropuesta = () => {
    return `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Enviar propuesta REAL con persistencia
  const enviarPropuesta = async () => {
    // Validaciones
    if (horasSeleccionadas.length === 0) {
      alert('❌ Debes seleccionar al menos una hora');
      return;
    }

    if (!isAuthenticated()) {
      alert('❌ Debes iniciar sesión para enviar propuestas');
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
        id: generarIdPropuesta(),
        chazaId: chaza.id,
        chazaNombre: chaza.nombre,
        estudianteId: user.id,
        estudianteNombre: user.nombre,
        estudianteEmail: user.email,
        horasSeleccionadas: horasSeleccionadas,
        mensaje: mensaje,
        estado: 'pendiente', // pendiente | aceptada | rechazada
        fechaEnvio: new Date().toISOString(),
        duenioChaza: chaza.dueno?.nombre || 'Sin nombre',
        ubicacionChaza: chaza.ubicacion
      };

      // Obtener propuestas existentes del localStorage
      const propuestasExistentes = JSON.parse(localStorage.getItem('propuestas') || '[]');

      // Verificar si ya existe una propuesta pendiente para esta chaza
      const propuestaExistente = propuestasExistentes.find(
        p => p.chazaId === chaza.id && 
             p.estudianteId === user.id && 
             p.estado === 'pendiente'
      );

      if (propuestaExistente) {
        alert('⚠️ Ya tienes una propuesta pendiente para esta chaza. Espera la respuesta del dueño.');
        setEnviando(false);
        return;
      }

      // Agregar la nueva propuesta
      propuestasExistentes.push(nuevaPropuesta);

      // Guardar en localStorage
      localStorage.setItem('propuestas', JSON.stringify(propuestasExistentes));

      // Simular delay de envío (para mejor UX)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mostrar mensaje de éxito
      alert(`✅ ¡Propuesta enviada exitosamente!
      
📋 Resumen:
• Chaza: ${chaza.nombre}
• Horas solicitadas: ${horasSeleccionadas.length}
• Estado: Pendiente de revisión

El dueño de la chaza revisará tu propuesta y te contactará pronto.`);

      // Limpiar formulario y cerrar modal
      setHorasSeleccionadas([]);
      setMensaje('');
      onClose();

      // Opcional: Mostrar notificación de éxito en el dashboard
      console.log('✅ Propuesta guardada:', nuevaPropuesta);

    } catch (error) {
      console.error('❌ Error enviando propuesta:', error);
      alert('❌ Error enviando la propuesta. Por favor intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  // Limpiar formulario al cerrar
  const handleClose = () => {
    setHorasSeleccionadas([]);
    setMensaje('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header del modal */}
        <div className="modal-header">
          <h2>{chaza.nombre}</h2>
          <button className="modal-close" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Información del dueño */}
          <section className="chaza-info-section">
            <h3>👤 Información del Dueño</h3>
            <div className="owner-info">
              <p><strong>Nombre:</strong> {chaza.dueno?.nombre || 'Sin información'}</p>
              <p><strong>Correo:</strong> {chaza.dueno?.email || 'Sin información'}</p>
              <p><strong>Ubicación:</strong> {chaza.ubicacion}</p>
            </div>
          </section>

          {/* Productos manejados */}
          <section className="productos-section">
            <h3>🛍️ Productos que Maneja</h3>
            <div className="productos-list">
              {chaza.productos?.length > 0 ? (
                chaza.productos.map((producto, index) => (
                  <span key={index} className="producto-tag">
                    {producto}
                  </span>
                ))
              ) : (
                <p className="no-data">No se especificaron productos</p>
              )}
            </div>
          </section>

          {/* Horario semanal */}
          <section className="horario-section">
            <h3>⏰ Horas Disponibles para Trabajo</h3>
            <p className="horario-instruccion">
              🟢 Verde = Horas que necesita cubrir | 
              🔵 Azul = Horas que seleccionaste |
              ⚪ Gris = No disponible
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
                        title={
                          disponible 
                            ? (seleccionada ? 'Click para deseleccionar' : 'Click para seleccionar')
                            : 'No disponible'
                        }
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

          {/* Sección de postulación - Solo para estudiantes autenticados */}
          {isAuthenticated() && isEstudiante() && (
            <section className="postulacion-section">
              <h3>📝 Enviar Propuesta</h3>
              
              {/* Resumen de horas seleccionadas */}
              <div className="horas-seleccionadas">
                <p><strong>Horas seleccionadas:</strong> {horasSeleccionadas.length}</p>
                {horasSeleccionadas.length > 0 && (
                  <div className="horas-list">
                    <p className="horas-preview"><strong>Horarios específicos:</strong></p>
                    <div className="horas-tags-preview">
                      {horasSeleccionadas.map(hora => (
                        <span key={hora} className="hora-selected">
                          {hora.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Mensaje opcional */}
              <div className="mensaje-propuesta">
                <label htmlFor="mensaje">Mensaje para el dueño (opcional):</label>
                <textarea
                  id="mensaje"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Ej: Hola! Soy estudiante de [Universidad] y estoy muy interesado en trabajar en su chaza. Tengo experiencia en atención al cliente y estoy disponible en los horarios seleccionados..."
                  rows={4}
                  disabled={enviando}
                />
                <small className="mensaje-helper">
                  💡 Un mensaje personalizado aumenta tus posibilidades de ser contratado
                </small>
              </div>

              {/* Botón de envío */}
              <div className="envio-section">
                <button 
                  onClick={enviarPropuesta}
                  className="btn btn-primary btn-large"
                  disabled={horasSeleccionadas.length === 0 || enviando}
                >
                  {enviando ? (
                    <>
                      ⏳ Enviando Propuesta...
                    </>
                  ) : (
                    <>
                      🚀 Enviar Propuesta ({horasSeleccionadas.length} horas)
                    </>
                  )}
                </button>
                
                {horasSeleccionadas.length === 0 && (
                  <p className="validation-message">
                    ⚠️ Selecciona al menos una hora para continuar
                  </p>
                )}
              </div>

              {/* Información adicional */}
              <div className="info-adicional">
                <h4>ℹ️ Información importante:</h4>
                <ul>
                  <li>✅ Tu propuesta será enviada directamente al dueño de la chaza</li>
                  <li>📱 Recibirás una respuesta en tu dashboard</li>
                  <li>⏰ Puedes cancelar tu propuesta antes de que sea aceptada</li>
                  <li>🔄 Solo puedes tener una propuesta activa por chaza</li>
                </ul>
              </div>
            </section>
          )}

          {/* Mensaje para usuarios no autenticados */}
          {!isAuthenticated() && (
            <div className="auth-required">
              <h3>🔐 Inicia sesión para postularte</h3>
              <p>Necesitas una cuenta para enviar propuestas a las chazas</p>
              <div className="auth-buttons">
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    handleClose();
                    // Esta función debería ser pasada como prop para navegar
                    window.location.reload(); // Temporal, debería usar onNavegar
                  }}
                >
                  Iniciar Sesión
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    handleClose();
                    // Esta función debería ser pasada como prop para navegar
                    window.location.reload(); // Temporal, debería usar onNavegar
                  }}
                >
                  Crear Cuenta
                </button>
              </div>
            </div>
          )}

          {/* Mensaje para chazeros */}
          {isAuthenticated() && !isEstudiante() && (
            <div className="chazero-message">
              <h3>👨‍💼 Vista de Chazero</h3>
              <p>Como dueño de chaza, puedes ver los detalles pero no enviar propuestas.</p>
              <p>Ve a tu dashboard para gestionar las propuestas recibidas en tus chazas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChazaModal;