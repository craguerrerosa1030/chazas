import { useState, useEffect, useMemo } from 'react';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function EditorHorarios({ horariosIniciales = [], onGuardar, guardando, horarioApertura = '06:00', horarioCierre = '20:00' }) {
  // Generar array de horas basado en horario de apertura/cierre
  const HORAS = useMemo(() => {
    const inicio = parseInt(horarioApertura.split(':')[0], 10) || 6;
    const fin = parseInt(horarioCierre.split(':')[0], 10) || 20;
    const cantidad = fin - inicio;
    return Array.from({ length: cantidad }, (_, i) => i + inicio);
  }, [horarioApertura, horarioCierre]);
  const [seleccionados, setSeleccionados] = useState({});

  // Convertir horarios del backend a formato local
  useEffect(() => {
    if (horariosIniciales && horariosIniciales.length > 0) {
      const nuevo = {};
      horariosIniciales.forEach(h => {
        if (typeof h === 'object' && h.dia_semana !== undefined) {
          for (let hora = h.hora_inicio; hora < h.hora_fin; hora++) {
            const key = `${h.dia_semana}-${hora}`;
            nuevo[key] = true;
          }
        }
      });
      setSeleccionados(nuevo);
    }
  }, [horariosIniciales]);

  // Toggle una celda
  const toggleCelda = (dia, hora) => {
    const key = `${dia}-${hora}`;
    setSeleccionados(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Convertir selecciones a formato del backend
  const convertirAHorarios = () => {
    const horariosNuevos = [];
    const horaMin = HORAS[0] || 6;
    const horaMax = (HORAS[HORAS.length - 1] || 20) + 1;

    for (let dia = 0; dia < 7; dia++) {
      let horaInicio = null;

      for (let hora = horaMin; hora <= horaMax; hora++) {
        const key = `${dia}-${hora}`;
        const seleccionado = seleccionados[key];

        if (seleccionado && horaInicio === null) {
          horaInicio = hora;
        } else if (!seleccionado && horaInicio !== null) {
          horariosNuevos.push({
            dia_semana: dia,
            hora_inicio: horaInicio,
            hora_fin: hora
          });
          horaInicio = null;
        }
      }

      // Si termina seleccionado
      if (horaInicio !== null) {
        horariosNuevos.push({
          dia_semana: dia,
          hora_inicio: horaInicio,
          hora_fin: horaMax
        });
      }
    }

    return horariosNuevos;
  };

  const handleGuardar = () => {
    const horariosConvertidos = convertirAHorarios();
    onGuardar(horariosConvertidos);
  };

  // Seleccionar/deseleccionar todo un día
  const toggleDia = (dia) => {
    const todasSeleccionadas = HORAS.every(hora => seleccionados[`${dia}-${hora}`]);
    const nuevo = { ...seleccionados };

    HORAS.forEach(hora => {
      nuevo[`${dia}-${hora}`] = !todasSeleccionadas;
    });

    setSeleccionados(nuevo);
  };

  // Seleccionar/deseleccionar toda una hora
  const toggleHora = (hora) => {
    const todasSeleccionadas = DIAS.every((_, dia) => seleccionados[`${dia}-${hora}`]);
    const nuevo = { ...seleccionados };

    DIAS.forEach((_, dia) => {
      nuevo[`${dia}-${hora}`] = !todasSeleccionadas;
    });

    setSeleccionados(nuevo);
  };

  // Contar horas seleccionadas
  const horasSeleccionadasCount = Object.values(seleccionados).filter(Boolean).length;

  return (
    <div className="editor-horarios">
      <div className="editor-header">
        <h3>Horarios que necesitas turnos</h3>
        <span className="horas-count">
          {horasSeleccionadasCount} horas seleccionadas
        </span>
      </div>

      <p className="editor-instrucciones">
        Haz clic en las celdas para seleccionar las horas. Clic en el nombre del día o la hora para seleccionar toda la fila/columna.
      </p>

      <div className="leyenda-horarios">
        <div className="leyenda-item">
          <div className="leyenda-color no-seleccionado"></div>
          <span>No necesita turno</span>
        </div>
        <div className="leyenda-item">
          <div className="leyenda-color seleccionado"></div>
          <span>Necesita turno</span>
        </div>
      </div>

      <div className="horario-grid-container">
        <div className="horarios-grid">
          {/* Header con horas */}
          <div
            className="horarios-header"
            style={{ gridTemplateColumns: `100px repeat(${HORAS.length}, minmax(50px, 1fr))` }}
          >
            <div className="celda-vacia"></div>
            {HORAS.map(hora => (
              <div
                key={hora}
                className="celda-hora-header"
                onClick={() => toggleHora(hora)}
                title={`Seleccionar ${hora}:00 en todos los días`}
              >
                {hora}:00
              </div>
            ))}
          </div>

          {/* Filas por dia */}
          {DIAS.map((dia, diaIndex) => (
            <div
              key={diaIndex}
              className="horarios-row"
              style={{ gridTemplateColumns: `100px repeat(${HORAS.length}, minmax(50px, 1fr))` }}
            >
              <div
                className="celda-dia"
                onClick={() => toggleDia(diaIndex)}
                title={`Seleccionar todo ${dia}`}
              >
                {dia}
              </div>
              {HORAS.map(hora => {
                const key = `${diaIndex}-${hora}`;
                const seleccionado = seleccionados[key];
                return (
                  <div
                    key={key}
                    className={`celda-horario ${seleccionado ? 'seleccionado' : ''}`}
                    onClick={() => toggleCelda(diaIndex, hora)}
                    title={`${dia} ${hora}:00 - ${hora + 1}:00`}
                  >
                    {seleccionado && <span className="check-marca">✓</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="horarios-acciones">
        <button
          className="btn btn-primary btn-large"
          onClick={handleGuardar}
          disabled={guardando}
        >
          {guardando ? 'Guardando...' : `Guardar Horarios (${horasSeleccionadasCount} horas)`}
        </button>
      </div>
    </div>
  );
}

export default EditorHorarios;
