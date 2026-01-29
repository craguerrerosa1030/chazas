import { Link } from 'react-router-dom';

function SobreNosotros() {
  return (
    <div className="sobre-nosotros">
      <div className="container">

        {/* Hero */}
        <div className="sobre-hero">
          <h1>Sobre Chazas</h1>
          <p className="sobre-subtitulo">
            La plataforma que conecta estudiantes universitarios con oportunidades de trabajo en chazas cercanas a su campus.
          </p>
        </div>

        {/* Qué es */}
        <section className="sobre-seccion">
          <h2>¿Qué es Chazas?</h2>
          <p>
            Chazas es una plataforma web diseñada para universidades colombianas que facilita la conexión
            entre estudiantes chazeros (quienes tienen un negocio de comida o servicios cerca del campus) y estudiantes
            que buscan oportunidades de trabajo a medio tiempo.
          </p>
          <p>
            Los estudiantes chazeros publican sus chazas con los horarios en los que necesitan ayuda,
            y los demás estudiantes pueden postularse a los turnos que mejor se ajusten a su horario académico.
          </p>
        </section>

        {/* Cómo funciona */}
        <section className="sobre-seccion">
          <h2>¿Cómo funciona?</h2>
          <div className="sobre-pasos">
            <div className="sobre-paso">
              <span className="paso-numero">1</span>
              <h3>Regístrate</h3>
              <p>Crea tu cuenta como estudiante o como chazero y selecciona tu universidad.</p>
            </div>
            <div className="sobre-paso">
              <span className="paso-numero">2</span>
              <h3>Explora o Publica</h3>
              <p>Los estudiantes exploran chazas disponibles. Los chazeros publican su chaza con horarios de trabajo.</p>
            </div>
            <div className="sobre-paso">
              <span className="paso-numero">3</span>
              <h3>Conecta</h3>
              <p>Los estudiantes se postulan a los turnos que les convengan y los chazeros aceptan o rechazan solicitudes.</p>
            </div>
          </div>
        </section>

        {/* Para quién */}
        <section className="sobre-seccion">
          <h2>¿Para quién es Chazas?</h2>
          <div className="sobre-grid-dos">
            <div className="sobre-card">
              <h3>Estudiantes</h3>
              <ul>
                <li>Busca oportunidades de trabajo cerca de tu universidad</li>
                <li>Filtra chazas por horarios compatibles con tus clases</li>
                <li>Postúlate directamente desde la plataforma</li>
                <li>Recibe notificaciones cuando tu solicitud sea respondida</li>
              </ul>
            </div>
            <div className="sobre-card">
              <h3>Estudiantes Chazeros</h3>
              <ul>
                <li>Publica tu chaza para que los estudiantes te encuentren</li>
                <li>Define los horarios en los que necesitas ayuda</li>
                <li>Recibe solicitudes de estudiantes interesados</li>
                <li>Acepta o rechaza postulaciones fácilmente</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Universidades */}
        <section className="sobre-seccion">
          <h2>Universidades</h2>
          <p>
            Chazas está disponible para universidades colombianas. Cada usuario selecciona su universidad
            al registrarse, y la plataforma muestra las chazas cercanas a ese campus.
          </p>
        </section>

        {/* Disclaimer Legal */}
        <section className="sobre-seccion sobre-disclaimer">
          <h2>Aviso Legal</h2>
          <div className="disclaimer-box">
            <p>
              <strong>Chazas es un proyecto independiente</strong> creado por estudiantes
              universitarios con el objetivo de conectar a la comunidad estudiantil con
              oportunidades de trabajo en negocios cercanos a los campus.
            </p>
            <p>
              <strong>NO somos una plataforma oficial</strong> de ninguna universidad.
              No tenemos ninguna afiliación, patrocinio ni respaldo institucional.
            </p>
            <p>
              Los nombres de las universidades se utilizan únicamente con fines
              de identificación geográfica para los usuarios de la plataforma.
            </p>
            <p>
              La verificación de correo institucional se realiza únicamente para validar
              que el usuario pertenece a la comunidad universitaria, no implica ninguna
              relación oficial con la institución.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="sobre-cta">
          <h2>Empieza ahora</h2>
          <p>Únete a Chazas y conecta con oportunidades cerca de tu universidad.</p>
          <div className="sobre-cta-botones">
            <Link to="/registro" className="btn btn-primary">Crear Cuenta</Link>
            <Link to="/home" className="btn btn-outline">Ver Chazas</Link>
          </div>
        </section>

      </div>
    </div>
  );
}

export default SobreNosotros;
