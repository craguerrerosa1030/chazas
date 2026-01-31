import { Link } from 'react-router-dom';

function PoliticaPrivacidad() {
  return (
    <div className="legal-pagina">
      <div className="container">
        <h1>Política de Privacidad</h1>
        <p className="legal-fecha">Última actualización: Enero 2025</p>

        <div className="legal-contenido">
          <section>
            <h2>En resumen</h2>
            <div className="legal-resumen">
              <p>
                <strong>Somos transparentes.</strong> Recolectamos solo los datos necesarios
                para que la plataforma funcione. No vendemos tu información a nadie.
                Puedes pedir que eliminemos tus datos cuando quieras.
              </p>
            </div>
          </section>

          <section>
            <h2>1. ¿Quién es responsable de tus datos?</h2>
            <p>
              <strong>Responsable:</strong> Cristian Andrés Guerrero Sánchez<br />
              <strong>Contacto:</strong> <Link to="/contacto">Formulario de contacto</Link>
            </p>
            <p>
              Chazas es un proyecto independiente creado por estudiantes. No estamos
              afiliados con ninguna universidad.
            </p>
          </section>

          <section>
            <h2>2. ¿Qué datos recolectamos?</h2>
            <p>Recolectamos únicamente lo necesario:</p>
            <table className="legal-tabla">
              <thead>
                <tr>
                  <th>Dato</th>
                  <th>¿Para qué?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Nombre</td>
                  <td>Para identificarte en la plataforma</td>
                </tr>
                <tr>
                  <td>Correo institucional</td>
                  <td>Para verificar que eres estudiante y para iniciar sesión</td>
                </tr>
                <tr>
                  <td>Contraseña</td>
                  <td>Para proteger tu cuenta (se guarda encriptada, nunca la vemos)</td>
                </tr>
                <tr>
                  <td>Teléfono (solo chazeros)</td>
                  <td>Para que los estudiantes puedan contactarte</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>3. ¿Para qué usamos tus datos?</h2>
            <ul>
              <li>Para que puedas crear tu cuenta y usar la plataforma</li>
              <li>Para conectar estudiantes con oportunidades de trabajo en chazas</li>
              <li>Para enviarte notificaciones sobre tus solicitudes</li>
              <li>Para responder si nos contactas</li>
            </ul>
            <p><strong>NO hacemos:</strong></p>
            <ul>
              <li>NO vendemos tus datos a nadie</li>
              <li>NO enviamos publicidad ni spam</li>
              <li>NO compartimos tu información con terceros</li>
            </ul>
          </section>

          <section>
            <h2>4. ¿Cuánto tiempo guardamos tus datos?</h2>
            <p>
              Guardamos tus datos mientras tengas una cuenta activa. Si eliminas tu cuenta,
              borramos toda tu información.
            </p>
          </section>

          <section>
            <h2>5. Tus derechos (Ley 1581 de 2012)</h2>
            <p>Tienes derecho a:</p>
            <ul>
              <li><strong>Acceder:</strong> Pedir una copia de tus datos</li>
              <li><strong>Rectificar:</strong> Corregir información incorrecta</li>
              <li><strong>Cancelar:</strong> Pedir que eliminemos tus datos</li>
              <li><strong>Oponerte:</strong> Pedir que dejemos de usar tus datos</li>
            </ul>
            <p>
              Para ejercer cualquiera de estos derechos, usa nuestro{' '}
              <Link to="/contacto">formulario de contacto</Link>.
              Te responderemos en máximo 15 días hábiles.
            </p>
          </section>

          <section>
            <h2>6. Seguridad</h2>
            <p>
              Protegemos tus datos con medidas de seguridad estándar de la industria:
            </p>
            <ul>
              <li>Las contraseñas se guardan encriptadas (bcrypt)</li>
              <li>Las conexiones usan HTTPS (cifrado)</li>
              <li>Solo tú puedes acceder a tu cuenta</li>
            </ul>
          </section>

          <section>
            <h2>7. Cookies</h2>
            <p>
              Usamos cookies técnicas necesarias para que la plataforma funcione
              (por ejemplo, para mantener tu sesión iniciada). No usamos cookies
              de publicidad ni de rastreo.
            </p>
          </section>

          <section>
            <h2>8. Cambios a esta política</h2>
            <p>
              Si hacemos cambios importantes a esta política, te avisaremos
              a través de la plataforma.
            </p>
          </section>

          <section>
            <h2>¿Preguntas?</h2>
            <p>
              Si tienes dudas sobre cómo manejamos tus datos, escríbenos a través
              del <Link to="/contacto">formulario de contacto</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PoliticaPrivacidad;
