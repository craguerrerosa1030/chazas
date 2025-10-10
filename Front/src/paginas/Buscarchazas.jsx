import React, { useState, useEffect } from 'react';
import FiltroHorarioModal from '../componentes/FiltroHorarioModal';
import ChazaDetalleModal from '../componentes/ChazaDetalleModal';

function BuscarChazas({ onNavegar }) {
  // Estados principales
  const [chazas, setChazas] = useState([]);
  const [chazasFiltradas, setChazasFiltradas] = useState([]);
  const [horariosUsuario, setHorariosUsuario] = useState([]);
  const [filtroAplicado, setFiltroAplicado] = useState(false);
  
  // Estados de modales
  const [modalFiltroAbierto, setModalFiltroAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [chazaSeleccionada, setChazaSeleccionada] = useState(null);

  // Cargar chazas al montar
  useEffect(() => {
    cargarChazas();
  }, []);

  // Cargar chazas desde localStorage o usar datos simulados
  const cargarChazas = () => {
    try {
      // Intentar cargar chazas del localStorage
      let chazasGuardadas = JSON.parse(localStorage.getItem('chazas_sistema') || '[]');
      
      // Si no hay chazas, usar datos de ejemplo
      if (chazasGuardadas.length === 0) {
        chazasGuardadas = chazasDeEjemplo;
        // Opcionalmente guardar los datos de ejemplo
        localStorage.setItem('chazas_sistema', JSON.stringify(chazasGuardadas));
      }
      
      setChazas(chazasGuardadas);
      setChazasFiltradas(chazasGuardadas);
    } catch (error) {
      console.error('Error cargando chazas:', error);
      setChazas(chazasDeEjemplo);
      setChazasFiltradas(chazasDeEjemplo);
    }
  };

  // Aplicar filtro de horarios
  const aplicarFiltroHorario = (horariosSeleccionados) => {
    setHorariosUsuario(horariosSeleccionados);
    setFiltroAplicado(true);

    if (horariosSeleccionados.length === 0) {
      // Si no hay horarios seleccionados, mostrar todas las chazas
      setChazasFiltradas(chazas);
      setFiltroAplicado(false);
      return;
    }

    // Filtrar chazas que tengan al menos UNA coincidencia con los horarios del usuario
    const chazasConCoincidencias = chazas.map(chaza => {
      // Calcular coincidencias
      const horariosComunes = chaza.horariosDisponibles.filter(hora => 
        horariosSeleccionados.includes(hora)
      );

      return {
        ...chaza,
        horariosComunes,
        cantidadCoincidencias: horariosComunes.length,
        porcentajeCompatibilidad: (horariosComunes.length / horariosSeleccionados.length) * 100
      };
    })
    .filter(chaza => chaza.cantidadCoincidencias > 0) // Solo chazas con al menos 1 coincidencia
    .sort((a, b) => b.cantidadCoincidencias - a.cantidadCoincidencias); // Ordenar por más coincidencias

    setChazasFiltradas(chazasConCoincidencias);
  };

  // Limpiar filtro
  const limpiarFiltro = () => {
    setHorariosUsuario([]);
    setChazasFiltradas(chazas);
    setFiltroAplicado(false);
  };

  // Abrir detalle de chaza
  const abrirDetalle = (chaza) => {
    setChazaSeleccionada(chaza);
    setModalDetalleAbierto(true);
  };

  return (
    <div className="buscar-chazas-page">
      <div className="container">
        
        {/* Header de la página */}
        <div className="page-header">
          <h1>🔍 Buscar Chazas</h1>
          <p>Encuentra chazas compatibles con tu horario disponible</p>
        </div>

        {/* Sección de filtros */}
        <div className="filtros-container">
          <div className="filtro-principal">
            <button 
              className="btn-filtrar-horario"
              onClick={() => setModalFiltroAbierto(true)}
            >
              <span className="btn-icon">🕐</span>
              <span className="btn-text">Filtrar por Horario</span>
              {horariosUsuario.length > 0 && (
                <span className="badge-filtro">{horariosUsuario.length}</span>
              )}
            </button>

            {filtroAplicado && (
              <button 
                className="btn-limpiar-filtro"
                onClick={limpiarFiltro}
              >
                <span>✕ Limpiar Filtro</span>
              </button>
            )}
          </div>

          {/* Información del filtro aplicado */}
          {filtroAplicado && horariosUsuario.length > 0 && (
            <div className="info-filtro-aplicado">
              <div className="filtro-info-header">
                <h4>✅ Filtro Activo</h4>
                <p>Mostrando chazas con coincidencias en tus {horariosUsuario.length} horas seleccionadas</p>
              </div>
              <div className="horarios-filtro-resumen">
                {horariosUsuario.slice(0, 8).map(horario => (
                  <span key={horario} className="horario-chip">
                    {horario.replace('-', ' ')}
                  </span>
                ))}
                {horariosUsuario.length > 8 && (
                  <span className="horario-chip mas">
                    +{horariosUsuario.length - 8} más
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="resultados-section">
          <div className="resultados-header">
            <h3>
              {filtroAplicado ? 
                `Chazas Compatibles (${chazasFiltradas.length})` : 
                `Todas las Chazas (${chazasFiltradas.length})`
              }
            </h3>
            {filtroAplicado && chazasFiltradas.length > 0 && (
              <p className="resultados-descripcion">
                Ordenadas por mayor coincidencia con tu horario
              </p>
            )}
          </div>

          {/* Grid de chazas */}
          {chazasFiltradas.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">😔</div>
              <h3>No se encontraron chazas</h3>
              {filtroAplicado ? (
                <>
                  <p>No hay chazas con horarios que coincidan con tu disponibilidad.</p>
                  <p>Intenta ajustar tu filtro de horarios.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setModalFiltroAbierto(true)}
                  >
                    🔄 Ajustar Horarios
                  </button>
                </>
              ) : (
                <>
                  <p>Aún no hay chazas disponibles.</p>
                  <p>Vuelve más tarde.</p>
                </>
              )}
            </div>
          ) : (
            <div className="chazas-grid">
              {chazasFiltradas.map(chaza => (
                <div 
                  key={chaza.id} 
                  className="chaza-card"
                  onClick={() => abrirDetalle(chaza)}
                >
                  {/* Imagen de la chaza */}
                  <div className="chaza-imagen">
                    {chaza.imagenUrl ? (
                      <img src={chaza.imagenUrl} alt={chaza.nombre} />
                    ) : (
                      <div className="imagen-placeholder">
                        <span className="placeholder-icon">🏪</span>
                      </div>
                    )}
                    
                    {/* Badge de compatibilidad si hay filtro */}
                    {filtroAplicado && chaza.cantidadCoincidencias > 0 && (
                      <div className="compatibilidad-badge">
                        <span className="compatibilidad-numero">
                          {chaza.cantidadCoincidencias}
                        </span>
                        <span className="compatibilidad-texto">
                          hora{chaza.cantidadCoincidencias !== 1 ? 's' : ''} en común
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Información de la chaza */}
                  <div className="chaza-info-card">
                    <h3 className="chaza-nombre">{chaza.nombre}</h3>
                    
                    <div className="chaza-detalles-breve">
                      <p className="chaza-ubicacion">
                        📍 {chaza.ubicacion}
                      </p>
                      
                      <p className="chaza-horario">
                        ⏰ {chaza.horarios || 'Horario flexible'}
                      </p>

                      {/* Productos */}
                      {chaza.productos && chaza.productos.length > 0 && (
                        <div className="productos-preview">
                          <span className="productos-label">🛍️</span>
                          <div className="productos-tags-mini">
                            {chaza.productos.slice(0, 3).map((producto, index) => (
                              <span key={index} className="producto-tag-mini">
                                {producto}
                              </span>
                            ))}
                            {chaza.productos.length > 3 && (
                              <span className="producto-tag-mini mas">
                                +{chaza.productos.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Barra de compatibilidad */}
                      {filtroAplicado && chaza.porcentajeCompatibilidad !== undefined && (
                        <div className="compatibilidad-bar-container">
                          <div className="compatibilidad-label">
                            <span>Compatibilidad</span>
                            <span className="porcentaje">
                              {Math.round(chaza.porcentajeCompatibilidad)}%
                            </span>
                          </div>
                          <div className="compatibilidad-bar">
                            <div 
                              className="compatibilidad-fill"
                              style={{ 
                                width: `${chaza.porcentajeCompatibilidad}%`,
                                backgroundColor: getColorCompatibilidad(chaza.porcentajeCompatibilidad)
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botón de ver más */}
                    <button className="btn-ver-detalle">
                      Ver Horarios Disponibles →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Filtro de Horario */}
      <FiltroHorarioModal
        isOpen={modalFiltroAbierto}
        onClose={() => setModalFiltroAbierto(false)}
        onAplicarFiltro={aplicarFiltroHorario}
        horariosPreseleccionados={horariosUsuario}
      />

      {/* Modal de Detalle de Chaza */}
      {chazaSeleccionada && (
        <ChazaDetalleModal
          isOpen={modalDetalleAbierto}
          onClose={() => setModalDetalleAbierto(false)}
          chaza={chazaSeleccionada}
          horariosUsuario={horariosUsuario}
          onNavegar={onNavegar}
        />
      )}
    </div>
  );
}

// Función para obtener color según porcentaje de compatibilidad
function getColorCompatibilidad(porcentaje) {
  if (porcentaje >= 75) return '#27ae60'; // Verde
  if (porcentaje >= 50) return '#f39c12'; // Naranja
  if (porcentaje >= 25) return '#e67e22'; // Naranja oscuro
  return '#e74c3c'; // Rojo
}

// Datos de ejemplo para cuando no hay chazas en localStorage
const chazasDeEjemplo = [
  {
    id: 1,
    nombre: "Chaza Don Mario",
    ubicacion: "Frente a Universidad Nacional",
    descripcion: "Chaza con 15 años de experiencia, especializada en desayunos y almuerzos caseros",
    horarios: "6:00 AM - 8:00 PM",
    productos: ["Desayunos", "Almuerzos", "Jugos naturales", "Café", "Empanadas"],
    duenioNombre: "Mario Rodríguez",
    duenioEmail: "mario@chaza.com",
    telefono: "300 123 4567",
    activa: true,
    horariosDisponibles: [
      "Lunes-07:00", "Lunes-07:30", "Lunes-11:30", "Lunes-12:00", "Lunes-12:30",
      "Martes-07:00", "Martes-07:30", "Martes-12:00", "Martes-12:30", "Martes-13:00",
      "Miércoles-07:00", "Miércoles-11:30", "Miércoles-12:00", "Miércoles-13:00",
      "Jueves-07:00", "Jueves-07:30", "Jueves-11:30", "Jueves-12:00", "Jueves-12:30",
      "Viernes-07:00", "Viernes-12:00", "Viernes-12:30", "Viernes-13:00"
    ]
  },
  {
    id: 2,
    nombre: "Chaza La Esquina",
    ubicacion: "Carrera 30 con Calle 45",
    descripcion: "Comida rápida y bebidas. Ambiente joven y dinámico",
    horarios: "7:00 AM - 7:00 PM",
    productos: ["Hamburguesas", "Hot dogs", "Gaseosas", "Jugos", "Mecato"],
    duenioNombre: "Laura Gómez",
    duenioEmail: "laura@chaza.com",
    telefono: "301 234 5678",
    activa: true,
    horariosDisponibles: [
      "Lunes-13:00", "Lunes-13:30", "Lunes-14:00", "Lunes-14:30",
      "Martes-13:00", "Martes-13:30", "Martes-14:00",
      "Miércoles-13:00", "Miércoles-13:30", "Miércoles-14:00", "Miércoles-14:30", "Miércoles-15:00",
      "Jueves-13:00", "Jueves-14:00", "Jueves-14:30",
      "Viernes-13:00", "Viernes-13:30", "Viernes-14:00", "Viernes-14:30", "Viernes-15:00"
    ]
  },
  {
    id: 3,
    nombre: "Chaza El Buen Sabor",
    ubicacion: "Dentro del campus universitario",
    descripcion: "Comida casera y saludable, perfecto para estudiantes",
    horarios: "6:30 AM - 6:00 PM",
    productos: ["Comida casera", "Ensaladas", "Jugos naturales", "Postres", "Café"],
    duenioNombre: "Carlos Pérez",
    duenioEmail: "carlos@chaza.com",
    telefono: "302 345 6789",
    activa: true,
    horariosDisponibles: [
      "Lunes-07:30", "Lunes-08:00", "Lunes-12:00", "Lunes-12:30", "Lunes-13:00",
      "Martes-07:30", "Martes-08:00", "Martes-08:30", "Martes-12:00", "Martes-12:30",
      "Miércoles-08:00", "Miércoles-12:00", "Miércoles-12:30", "Miércoles-13:00",
      "Jueves-07:30", "Jueves-08:00", "Jueves-12:00", "Jueves-12:30", "Jueves-13:00",
      "Viernes-08:00", "Viernes-08:30", "Viernes-12:00", "Viernes-12:30", "Viernes-13:00", "Viernes-13:30"
    ]
  },
  {
    id: 4,
    nombre: "Chaza Express",
    ubicacion: "Calle 26 con Carrera 7",
    descripcion: "Comida rápida para estudiantes con poco tiempo",
    horarios: "7:00 AM - 8:00 PM",
    productos: ["Sándwiches", "Empanadas", "Café", "Jugos", "Gaseosas"],
    duenioNombre: "Ana Martínez",
    duenioEmail: "ana@chaza.com",
    telefono: "303 456 7890",
    activa: true,
    horariosDisponibles: [
      "Lunes-09:00", "Lunes-09:30", "Lunes-10:00", "Lunes-15:00", "Lunes-15:30",
      "Martes-09:00", "Martes-09:30", "Martes-15:00", "Martes-15:30", "Martes-16:00",
      "Miércoles-09:00", "Miércoles-09:30", "Miércoles-10:00", "Miércoles-15:00",
      "Jueves-09:00", "Jueves-09:30", "Jueves-15:00", "Jueves-15:30",
      "Viernes-09:00", "Viernes-09:30", "Viernes-10:00", "Viernes-15:00", "Viernes-15:30", "Viernes-16:00"
    ]
  }
];

export default BuscarChazas;