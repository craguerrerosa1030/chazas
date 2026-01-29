import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { solicitudesApi, getStaticUrl } from '../services/api';

function ChazaDetalleModal({ isOpen, onClose, chaza, horariosUsuario = [] }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, token } = useAuth();
  const [horasSeleccionadas, setHorasSeleccionadas] = useState([]);
  const [mensajeDirecto, setMensajeDirecto] = useState('');
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);

  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Generar horas basadas en horario de apertura/cierre de la chaza
  const HORAS = useMemo(() => {
    if (chaza?.duracion_estimada) {
      const partes = chaza.duracion_estimada.split(' - ');
      if (partes.length === 2) {
        const inicio = parseInt(partes[0].split(':')[0], 10) || 6;
        const fin = parseInt(partes[1].split(':')[0], 10) || 20;
        const cantidad = fin - inicio;
        return Array.from({ length: cantidad }, (_, i) => i + inicio);
      }
    }
    return Array.from({ length: 15 }, (_, i) => i + 6); // Default 6:00 a 20:00
  }, [chaza?.duracion_estimada]);

  // URL para imágenes
  const getImageUrl = (imagenUrl) => {
    return getStaticUrl(imagenUrl);
  };

  // Convertir horarios del backend a formato de celdas seleccionables
  const horariosDisponiblesSet = useMemo(() => {
    const set = new Set();

    if (chaza?.horariosDisponibles && Array.isArray(chaza.horariosDisponibles)) {
      chaza.horariosDisponibles.forEach(horario => {
        if (typeof horario === 'object' && horario.dia_semana !== undefined) {
          const diaIndex = horario.dia_semana;
          for (let hora = horario.hora_inicio; hora < horario.hora_fin; hora++) {
            set.add(`${diaIndex}-${hora}`);
          }
        } else if (typeof horario === 'string') {
          set.add(horario);
        }
      });
    }

    if (chaza?.horarios_trabajo && Array.isArray(chaza.horarios_trabajo)) {
      chaza.horarios_trabajo.forEach(horario => {
        if (typeof horario === 'object' && horario.dia_semana !== undefined) {
          const diaIndex = horario.dia_semana;
          for (let hora = horario.hora_inicio; hora < horario.hora_fin; hora++) {
            set.add(`${diaIndex}-${hora}`);
          }
        }
      });
    }

    if (chaza?.horarios && Array.isArray(chaza.horarios)) {
      chaza.horarios.forEach(horario => {
        if (typeof horario === 'object' && horario.dia_semana !== undefined) {
          const diaIndex = horario.dia_semana;
          for (let hora = horario.hora_inicio; hora < horario.hora_fin; hora++) {
            set.add(`${diaIndex}-${hora}`);
          }
        }
      });
    }

    return set;
  }, [chaza]);

  const estaDisponible = (diaIndex, hora) => {
    return horariosDisponiblesSet.has(`${diaIndex}-${hora}`);
  };

  const esCoincidencia = (diaIndex, hora) => {
    return horariosUsuario.includes(`${diaIndex}-${hora}`);
  };

  const estaSeleccionada = (diaIndex, hora) => {
    return horasSeleccionadas.includes(`${diaIndex}-${hora}`);
  };

  const toggleHora = (diaIndex, hora) => {
    const horaId = `${diaIndex}-${hora}`;

    if (!estaDisponible(diaIndex, hora)) {
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

  // Formatear hora seleccionada para mostrar
  const formatearHoraSeleccionada = (horaId) => {
    const [diaIndex, hora] = horaId.split('-');
    const diaNombre = diasSemana[parseInt(diaIndex)] || `Día ${diaIndex}`;
    return `${diaNombre} ${hora}:00`;
  };

  // Agrupar horarios seleccionados por día para el mensaje
  const agruparHorariosPorDia = () => {
    const agrupados = {};

    horasSeleccionadas.forEach(horaId => {
      const [diaIndex, hora] = horaId.split('-');
      const diaNombre = diasSemana[parseInt(diaIndex)];

      if (!agrupados[diaNombre]) {
        agrupados[diaNombre] = [];
      }
      agrupados[diaNombre].push(parseInt(hora));
    });

    // Ordenar horas y formatear rangos
    const resultado = [];
    for (const dia in agrupados) {
      const horas = agrupados[dia].sort((a, b) => a - b);
      const rangos = [];
      let inicio = horas[0];
      let fin = horas[0];

      for (let i = 1; i <= horas.length; i++) {
        if (horas[i] === fin + 1) {
          fin = horas[i];
        } else {
          rangos.push(`${inicio}:00 - ${fin + 1}:00`);
          inicio = horas[i];
          fin = horas[i];
        }
      }

      resultado.push(`${dia}: ${rangos.join(', ')}`);
    }

    return resultado.join('\n');
  };

  // Generar link de WhatsApp con mensaje
  const generarLinkWhatsApp = () => {
    const telefono = chaza.telefono?.replace(/\D/g, '');
    if (!telefono) return null;

    const telefonoCompleto = telefono.startsWith('57') ? telefono : `57${telefono}`;

    const nombreChaza = chaza.nombre || chaza.titulo;
    const nombreUsuario = user?.nombre || 'Estudiante';
    const horariosTexto = agruparHorariosPorDia();

    const mensaje = `Hola! Vi tu chaza *${nombreChaza}* en Chazas App

Me interesa trabajar contigo.

*Horarios que puedo:*
${horariosTexto}

Soy ${nombreUsuario}, estudiante de la universidad.

Podemos hablar?`;

    const mensajeCodificado = encodeURIComponent(mensaje);
    return `https://wa.me/${telefonoCompleto}?text=${mensajeCodificado}`;
  };

  // Abrir WhatsApp
  const contactarWhatsApp = () => {
    if (horasSeleccionadas.length === 0) {
      alert('Selecciona al menos una hora antes de contactar');
      return;
    }

    if (!chaza.telefono) {
      alert('Esta chaza no tiene número de WhatsApp registrado');
      return;
    }

    const link = generarLinkWhatsApp();
    if (link) {
      window.open(link, '_blank');
    }
  };

  // Enviar mensaje directo por la app (solicitud de trabajo)
  const enviarMensajeDirecto = async () => {
    if (!isAuthenticated()) {
      alert('Debes iniciar sesión para enviar solicitudes');
      return;
    }

    if (horasSeleccionadas.length === 0) {
      alert('Selecciona al menos una hora');
      return;
    }

    setEnviandoMensaje(true);

    try {
      // Preparar datos de la solicitud
      const solicitudData = {
        chaza_id: chaza.id,
        horarios_seleccionados: horasSeleccionadas,
        mensaje: mensajeDirecto || null
      };

      // Enviar solicitud al backend
      await solicitudesApi.crear(solicitudData, token);

      alert('¡Solicitud enviada! El dueño de la chaza la verá en sus notificaciones.');
      setMensajeDirecto('');
      setHorasSeleccionadas([]);
      onClose();
    } catch (error) {
      console.error('Error enviando solicitud:', error);
      alert(error.message || 'Error al enviar la solicitud. Intenta de nuevo.');
    } finally {
      setEnviandoMensaje(false);
    }
  };

  if (!isOpen) return null;

  const imagenUrl = getImageUrl(chaza.imagen_url || chaza.imagen);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content chaza-detalle-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header del modal */}
        <div className="modal-header">
          <div>
            <h2>{chaza.nombre || chaza.titulo}</h2>
            <p className="modal-subtitle">📍 {chaza.ubicacion}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body del modal */}
        <div className="modal-body">

          {/* Seccion superior: Foto + Descripcion */}
          <div className="chaza-hero-section">
            <div className="chaza-imagen-container">
              {imagenUrl ? (
                <img
                  src={imagenUrl}
                  alt={chaza.nombre || chaza.titulo}
                  className="chaza-imagen-detalle"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="imagen-placeholder-detalle" style={{ display: imagenUrl ? 'none' : 'flex' }}>
                <span>🏪</span>
              </div>
              <div className={`chaza-badge-estado ${chaza.is_active ? 'activa' : 'inactiva'}`}>
                {chaza.is_active ? 'Abierta' : 'Cerrada'}
              </div>
            </div>

            <div className="chaza-descripcion-container">
              <h3>Acerca de esta chaza</h3>
              <p className="descripcion-texto">
                {chaza.descripcion || 'Sin descripción disponible.'}
              </p>
              {chaza.categoria && (
                <span className="categoria-tag">{chaza.categoria}</span>
              )}
            </div>
          </div>

          {/* Horarios disponibles */}
          <div className="horarios-section">
            <h3>Horarios Disponibles para Turnos</h3>

            {/* Leyenda */}
            <div className="horarios-leyenda">
              <div className="leyenda-item">
                <div className="leyenda-color disponible"></div>
                <span>Disponible</span>
              </div>
              {horariosUsuario.length > 0 && (
                <div className="leyenda-item">
                  <div className="leyenda-color coincidencia"></div>
                  <span>Coincide contigo</span>
                </div>
              )}
              <div className="leyenda-item">
                <div className="leyenda-color seleccionada"></div>
                <span>Tu selección</span>
              </div>
            </div>

            {/* Instruccion */}
            <p className="instruccion-horarios">
              Selecciona las horas en que puedes trabajar
            </p>

            {/* Grid de horarios */}
            <div className="horario-grid-detalle">
              <div className="horarios-grid">
                {/* Header con horas */}
                <div
                  className="horarios-header"
                  style={{ gridTemplateColumns: `100px repeat(${HORAS.length}, minmax(50px, 1fr))` }}
                >
                  <div className="celda-vacia"></div>
                  {HORAS.map(hora => (
                    <div key={hora} className="celda-hora-header">
                      {hora}:00
                    </div>
                  ))}
                </div>

                {/* Filas por dia */}
                {diasSemana.map((dia, diaIndex) => (
                  <div
                    key={diaIndex}
                    className="horarios-row"
                    style={{ gridTemplateColumns: `100px repeat(${HORAS.length}, minmax(50px, 1fr))` }}
                  >
                    <div className="celda-dia">{dia.substring(0, 3)}</div>
                    {HORAS.map(hora => {
                      const disponible = estaDisponible(diaIndex, hora);
                      const coincidencia = esCoincidencia(diaIndex, hora);
                      const seleccionada = estaSeleccionada(diaIndex, hora);

                      let claseSlot = 'celda-horario';
                      if (disponible) claseSlot += ' disponible';
                      if (coincidencia && disponible) claseSlot += ' coincidencia';
                      if (seleccionada) claseSlot += ' seleccionado';
                      if (disponible) claseSlot += ' clickeable';

                      return (
                        <div
                          key={`${diaIndex}-${hora}`}
                          className={claseSlot}
                          onClick={() => toggleHora(diaIndex, hora)}
                        >
                          {seleccionada && <span className="check-marca">✓</span>}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Contador de horas */}
            {horasSeleccionadas.length > 0 && (
              <div className="horas-seleccionadas-contador">
                <strong>{horasSeleccionadas.length}</strong> hora{horasSeleccionadas.length !== 1 ? 's' : ''} seleccionada{horasSeleccionadas.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Seccion de contacto - Dos opciones */}
          <div className="contacto-section">
            <h3>Contactar al dueño</h3>

            {/* Vista previa de horarios seleccionados */}
            {horasSeleccionadas.length > 0 && (
              <div className="horarios-seleccionados-preview">
                <p className="preview-label">Horarios que enviarás:</p>
                <div className="horas-tags">
                  {horasSeleccionadas.slice(0, 8).map(hora => (
                    <span key={hora} className="hora-tag">
                      {formatearHoraSeleccionada(hora)}
                    </span>
                  ))}
                  {horasSeleccionadas.length > 8 && (
                    <span className="hora-tag mas">+{horasSeleccionadas.length - 8}</span>
                  )}
                </div>
              </div>
            )}

            <div className="opciones-contacto">
              {/* Opcion 1: WhatsApp */}
              {chaza.telefono && (
                <div className="opcion-contacto whatsapp">
                  <div className="opcion-header">
                    <span className="opcion-icono">📱</span>
                    <span className="opcion-titulo">WhatsApp</span>
                  </div>
                  <p className="opcion-desc">Contacto directo e inmediato</p>
                  <button
                    onClick={contactarWhatsApp}
                    className="btn btn-whatsapp"
                    disabled={horasSeleccionadas.length === 0}
                  >
                    Abrir WhatsApp
                  </button>
                </div>
              )}

              {/* Opcion 2: Mensaje por la app */}
              <div className="opcion-contacto mensaje-app">
                <div className="opcion-header">
                  <span className="opcion-icono">💬</span>
                  <span className="opcion-titulo">Mensaje en la App</span>
                </div>
                <p className="opcion-desc">El dueño lo verá en sus notificaciones</p>

                {isAuthenticated() ? (
                  <>
                    <textarea
                      value={mensajeDirecto}
                      onChange={(e) => setMensajeDirecto(e.target.value)}
                      placeholder="Escribe un mensaje adicional (opcional)..."
                      className="mensaje-textarea"
                      rows={2}
                    />
                    <button
                      onClick={enviarMensajeDirecto}
                      className="btn btn-primary"
                      disabled={horasSeleccionadas.length === 0 || enviandoMensaje}
                    >
                      {enviandoMensaje ? 'Enviando...' : 'Enviar Mensaje'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { onClose(); navigate('/login'); }}
                    className="btn btn-secondary"
                  >
                    Inicia sesión para enviar
                  </button>
                )}
              </div>
            </div>

            {horasSeleccionadas.length === 0 && (
              <p className="aviso-seleccionar">
                Selecciona al menos una hora arriba para poder contactar
              </p>
            )}
          </div>

          {/* Info de la chaza - Compacta al final */}
          <div className="info-chaza-compacta">
            <div className="info-items">
              {chaza.owner_nombre && (
                <span className="info-chip">
                  👤 {chaza.owner_nombre}
                </span>
              )}
              {chaza.duracion_estimada && (
                <span className="info-chip">
                  🕐 {chaza.duracion_estimada}
                </span>
              )}
              {chaza.telefono && (
                <span className="info-chip telefono">
                  📞 {chaza.telefono}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChazaDetalleModal;
