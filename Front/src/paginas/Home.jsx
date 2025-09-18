import React from 'react';

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>¡Bienvenido a Chazas!</h1>
        <p>Conectamos estudiantes que buscan trabajo con chazas que necesitan personal</p>
        <div className="hero-buttons">
          <a href="/registro" className="btn btn-primary">
            Buscar Trabajo
          </a>
          <a href="/registro" className="btn btn-secondary">
            Publicar Chaza
          </a>
        </div>
      </div>
      
      <section className="features">
        <h2>¿Cómo funciona?</h2>
        <div className="features-grid">
          <div className="feature">
            <h3>Para Estudiantes</h3>
            <p>Encuentra trabajos flexibles que se adapten a tu horario de estudio</p>
          </div>
          <div className="feature">
            <h3>Para Chazeros</h3>
            <p>Encuentra personal confiable para cubrir turnos en tu chaza</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;