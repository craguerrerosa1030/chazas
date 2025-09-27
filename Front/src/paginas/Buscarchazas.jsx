import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ChazaCard from '../componentes/Chazacard';
import ChazaModal from '../componentes/ChazaModal';
import BuscadorHorarios from '../componentes/BuscadorHorarios';

function BuscarChazas({ onNavegar }) {
  const { user, isEstudiante } = useAuth();
  const [todasLasChazas] = useState([
    {
      id: 1,
      nombre: "Chaza Don Carlos",
      ubicacion: "Universidad Nacional",
      horarios: "6AM - 2PM",
      pago: 15000,
      descripcion: "La mejor chaza del campus universitario",
      dueno: {
        nombre: "Carlos Dueño",
        email: "chazero@chazas.com"
      },
      productos: ["Desayunos", "Almuerzos", "Jugos", "Café", "Empanadas"],
      horariosDisponibles: [
        "Lunes-06:00", "Lunes-06:30", "Lunes-07:00", "Lunes-11:30", "Lunes-12:00",
        "Martes-06:00", "Martes-06:30", "Martes-12:00", "Martes-12:30",
        "Miércoles-07:00", "Miércoles-07:30", "Miércoles-13:00",
        "Jueves-06:00", "Jueves-11:30", "Jueves-12:00", "Jueves-12:30",
        "Viernes-06:30", "Viernes-07:00", "Viernes-13:00", "Viernes-13:30"
      ]
    },
    {
      id: 2,
      nombre: "Chaza La Esquina",
      ubicacion: "Frente al SENA",
      horarios: "8AM - 4PM",
      pago: 18000,
      descripcion: "Comida rápida cerca al SENA",
      dueno: {
        nombre: "Ana López",
        email: "ana.lopez@email.com"
      },
      productos: ["Hamburguesas", "Hot dogs", "Gaseosas", "Papas fritas"],
      horariosDisponibles: [
        "Lunes-08:00", "Lunes-08:30", "Lunes-15:00", "Lunes-15:30",
        "Martes-08:00", "Martes-14:00", "Martes-14:30", "Martes-15:00",
        "Miércoles-08:30", "Miércoles-09:00", "Miércoles-15:00",
        "Jueves-08:00", "Jueves-08:30", "Jueves-14:30", "Jueves-15:00",
        "Viernes-09:00", "Viernes-09:30", "Viernes-15:00", "Viernes-15:30"
      ]
    },
    {
      id: 3,
      nombre: "Chaza El Estudiante",
      ubicacion: "Centro de Bogotá",
      horarios: "7AM - 3PM",
      pago: 16000,
      descripcion: "Perfecta para estudiantes universitarios",
      dueno: {
        nombre: "Luis Martín",
        email: "luis.martin@email.com"
      },
      productos: ["Desayunos", "Menú ejecutivo", "Bebidas", "Postres"],
      horariosDisponibles: [
        "Lunes-07:00", "Lunes-12:00", "Lunes-12:30",
        "Martes-06:30", "Martes-07:00", "Martes-12:00",
        "Miércoles-07:00", "Miércoles-07:30", "Miércoles-13:00",
        "Jueves-06:00", "Jueves-07:00", "Jueves-12:00",
        "Viernes-07:00", "Viernes-13:00", "Viernes-13:30"
      ]
    }
  ]);

  const [chazasFiltradas, setChazasFiltradas] = useState(todasLasChazas);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [chazaSeleccionada, setChazaSeleccionada] = useState(null);
  const [ordenPorCompatibilidad, setOrdenPorCompatibilidad] = useState(false);

  // Función para calcular compatibilidad
  const calcularCompatibilidad = (chaza, horariosEstudiante) => {
    if (!horariosEstudiante.length) return 0;
    
    const horasComunes = chaza.horariosDisponibles.filter(hora => 
      horariosEstudiante.includes(hora)
    );
    
    return {
      horasComunes: horasComunes.length,
      porcentaje: (horasComunes.length / horariosEstudiante.length) * 100,
      horasCoincidentes: horasComunes
    };
  };

  // Función de búsqueda inteligente
  const buscarPorHorarios = (horariosEstudiante) => {
    if (!horariosEstudiante.length) {
      setChazasFiltradas(todasLasChazas);
      setOrdenPorCompatibilidad(false);
      return;
    }

    // Filtrar chazas que tengan al menos 1 hora en común
    const chazasCompatibles = todasLasChazas
      .map(chaza => ({
        ...chaza,
        compatibilidad: calcularCompatibilidad(chaza, horariosEstudiante)
      }))
      .filter(chaza => chaza.compatibilidad.horasComunes > 0)
      .sort((a, b) => b.compatibilidad.horasComunes - a.compatibilidad.horasComunes);

    setChazasFiltradas(chazasCompatibles);
    setOrdenPorCompatibilidad(true);
  };

  const abrirModal = (chaza) => {
    setChazaSeleccionada(chaza);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setChazaSeleccionada(null);
  };

  return (
    <div className="buscar-chazas">
      <div className="container">
        <div className="buscar-header">
          <h1>Buscar Chazas por Horario</h1>
          <p>Encuentra chazas que coincidan con tu disponibilidad</p>
        </div>

        {/* Buscador de horarios - Solo para estudiantes */}
        {isEstudiante() && (
          <BuscadorHorarios onBuscar={buscarPorHorarios} />
        )}

        {/* Tip para estudiantes */}
        {isEstudiante() && (
          <div className="horarios-nota">
            <p>💡 <strong>Tip:</strong> Las chazas se mostrarán ordenadas por compatibilidad con tus horarios</p>
          </div>
        )}

        {/* Resultados */}
        <div className="resultados-section">
          <div className="resultados-header">
            <h3>
              {ordenPorCompatibilidad 
                ? `Chazas compatibles (${chazasFiltradas.length})`
                : `Todas las chazas (${chazasFiltradas.length})`
              }
            </h3>
            {ordenPorCompatibilidad && (
              <p className="compatibilidad-nota">
                📊 Ordenadas por número de horas en común
              </p>
            )}
          </div>

          {chazasFiltradas.length === 0 ? (
            <div className="sin-resultados">
              <h3>😔 No encontramos chazas compatibles</h3>
              <p>Intenta seleccionar más horarios o diferentes horas</p>
            </div>
          ) : (
            <div className="chazas-grid">
              {chazasFiltradas.map(chaza => (
                <div key={chaza.id} className="chaza-result-card">
                  <ChazaCard chaza={chaza} />
                  
                  {/* Información de compatibilidad */}
                  {ordenPorCompatibilidad && chaza.compatibilidad && (
                    <div className="compatibilidad-info">
                      <div className="compatibilidad-badge">
                        ✅ {chaza.compatibilidad.horasComunes} horas en común
                      </div>
                      <div className="porcentaje-compatibilidad">
                        {chaza.compatibilidad.porcentaje.toFixed(0)}% compatible
                      </div>
                    </div>
                  )}
                  
                  <button 
                    className="btn btn-primary"
                    onClick={() => abrirModal(chaza)}
                  >
                    Ver Detalles y Postular
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <ChazaModal 
        chaza={chazaSeleccionada}
        isOpen={modalAbierto}
        onClose={cerrarModal}
      />
    </div>
  );
}

export default BuscarChazas;