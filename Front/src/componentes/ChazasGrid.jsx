import React from 'react';

function ChazasGrid({ onNavegar }) {
  // Datos simulados de chazas destacadas
  const chazasDestacadas = [
    {
      id: 1,
      nombre: "Chaza Don Mario",
      ubicacion: "Cerca a la Universidad",
      imagen: "https://www.las2orillas.co/wp-content/uploads/2015/06/FullSizeRender.jpg",
      horarios: "6AM - 2PM",
      disponible: true
    },
    {
      id: 2,
      nombre: "Chaza La Esquina",
      ubicacion: "Frente al SENA",
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyw2bzM3Rke1UlDwIe0BQqgdLvE2muq5cu1g&s",
      horarios: "8AM - 4PM",
      disponible: true
    },
    {
      id: 3,
      nombre: "Chaza El Buen Sabor",
      ubicacion: "Centro de la ciudad",
      imagen: "https://semanariovoz.com/wp-content/uploads/2025/02/chazas.png",
      horarios: "7AM - 3PM",
      disponible: false
    },
    {
      id: 4,
      nombre: "Chaza Los Amigos",
      ubicacion: "Barrio La Paz",
      imagen: "https://medellin.unal.edu.co/images/noticias_sede/2018/03/lucho2.jpg",
      horarios: "5AM - 1PM",
      disponible: true
    },
    {
      id: 5,
      nombre: "Chaza Express",
      ubicacion: "Terminal de buses",
      imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwDyemqPB__jI8JYjxHAU0o2jubBSpVfbrMg&s",
      horarios: "24 Horas",
      disponible: true
    },
    {
      id: 6,
      nombre: "Chaza Universitaria",
      ubicacion: "Campus principal",
      imagen: "https://pbs.twimg.com/media/BK_gOPfCYAAHFcP.jpg:large",
      horarios: "6AM - 6PM",
      disponible: true
    }
  ];

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
                  onClick={() => onNavegar('buscar-chazas')}
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
    </section>
  );
}

export default ChazasGrid;