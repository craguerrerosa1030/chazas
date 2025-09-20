import React, { useState } from 'react';
import ChazaModal from './ChazaModal';

function ChazasGrid({ onNavegar }) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [chazaSeleccionada, setChazaSeleccionada] = useState(null);

  // Datos simulados más completos
  const chazasDestacadas = [
    {
      id: 1,
      nombre: "Chaza Don Mario",
      ubicacion: "Cerca a la Universidad",
      imagen: "https://www.las2orillas.co/wp-content/uploads/2015/06/FullSizeRender.jpg",
      horarios: "6AM - 2PM",
      disponible: true,
      dueno: {
        nombre: "Mario González",
        email: "mario.gonzalez@email.com"
      },
      productos: [
        "Desayunos", "Almuerzos", "Jugos naturales", "Café", "Empanadas", "Arepas"
      ],
      horariosDisponibles: [
        // Lunes
        "Lunes-06:00", "Lunes-06:30", "Lunes-07:00", "Lunes-11:30", "Lunes-12:00",
        // Martes
        "Martes-06:00", "Martes-06:30", "Martes-12:00", "Martes-12:30",
        // Miércoles
        "Miércoles-07:00", "Miércoles-07:30", "Miércoles-13:00",
        // Jueves
        "Jueves-06:00", "Jueves-11:30", "Jueves-12:00", "Jueves-12:30",
        // Viernes
        "Viernes-06:30", "Viernes-07:00", "Viernes-13:00", "Viernes-13:30"
      ]
    },
    {
      id: 2,
      nombre: "Chaza La Esquina",
      ubicacion: "Frente al SENA",
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyw2bzM3Rke1UlDwIe0BQqgdLvE2muq5cu1g&s",
      horarios: "8AM - 4PM",
      disponible: true,
      dueno: {
        nombre: "Ana López",
        email: "ana.lopez@email.com"
      },
      productos: [
        "Comidas rápidas", "Hamburguesas", "Hot dogs", "Gaseosas", "Papas fritas"
      ],
      horariosDisponibles: [
        "Lunes-08:00", "Lunes-08:30", "Lunes-15:00", "Lunes-15:30",
        "Martes-08:00", "Martes-14:00", "Martes-14:30", "Martes-15:00",
        "Miércoles-08:30", "Miércoles-09:00", "Miércoles-15:00",
        "Jueves-08:00", "Jueves-08:30", "Jueves-14:30", "Jueves-15:00",
        "Viernes-09:00", "Viernes-09:30", "Viernes-15:00", "Viernes-15:30"
      ]
    }
    // ... más chazas
  ];

  const abrirModal = (chaza) => {
    setChazaSeleccionada(chaza);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setChazaSeleccionada(null);
  };

  return (
    <section className="chazas-grid-section">
      <div className="container">
        <div className="chazas-grid-header">
          <h2>Chazas Destacadas</h2>
          <p>Descubre las mejores oportunidades de trabajo cerca de ti</p>
        </div>
        
        <div className="chazas-grid">
          {chazasDestacadas.map(chaza => (
            <div key={chaza.id} className="chaza-grid-card">
              <div className="chaza-image-container">
                <img 
                  src={chaza.imagen} 
                  alt={chaza.nombre}
                  className="chaza-image"
                />
                <div className={`chaza-status ${chaza.disponible ? 'disponible' : 'ocupado'}`}>
                  {chaza.disponible ? 'Disponible' : 'Ocupado'}
                </div>
              </div>
              
              <div className="chaza-info">
                <h3 className="chaza-nombre">{chaza.nombre}</h3>
                <div className="chaza-details">
                  <p className="chaza-ubicacion">
                    📍 {chaza.ubicacion}
                  </p>
                  <p className="chaza-horarios">
                    🕐 {chaza.horarios}
                  </p>
                </div>
                
                <button 
                  className="chaza-ver-btn"
                  onClick={() => abrirModal(chaza)}
                >
                  Ver detalles
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="chazas-grid-footer">
          <button 
            className="btn btn-primary"
            onClick={() => onNavegar('buscar-chazas')}
          >
            Ver todas las chazas
          </button>
        </div>
      </div>

      {/* Modal */}
      <ChazaModal 
        chaza={chazaSeleccionada}
        isOpen={modalAbierto}
        onClose={cerrarModal}
      />
    </section>
  );
}

export default ChazasGrid;