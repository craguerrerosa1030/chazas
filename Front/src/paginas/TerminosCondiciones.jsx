import { Link } from 'react-router-dom';

function TerminosCondiciones() {
  return (
    <div className="legal-pagina">
      <div className="container">
        <h1>Términos y Condiciones</h1>
        <p className="legal-fecha">Última actualización: Enero 2025</p>

        <div className="legal-contenido">
          <section>
            <h2>En resumen</h2>
            <div className="legal-resumen">
              <p>
                <strong>Chazas conecta estudiantes con chazas.</strong> No somos empleadores
                ni intermediarios laborales. Solo facilitamos el contacto. El acuerdo de
                trabajo es entre ustedes.
              </p>
            </div>
          </section>

          <section>
            <h2>1. ¿Qué es Chazas?</h2>
            <p>
              Chazas es una plataforma web que conecta estudiantes universitarios que
              buscan trabajo con estudiantes chazeros que necesitan ayuda en sus negocios
              cerca del campus.
            </p>
            <p>
              <strong>Importante:</strong> Chazas es un proyecto independiente. NO estamos
              afiliados con ninguna universidad. Los nombres de universidades se usan solo
              para identificar la ubicación geográfica.
            </p>
          </section>

          <section>
            <h2>2. ¿Quién puede usar Chazas?</h2>
            <p>Para usar Chazas debes:</p>
            <ul>
              <li>Ser estudiante universitario activo</li>
              <li>Tener un correo institucional válido</li>
              <li>Ser mayor de 18 años</li>
              <li>Aceptar estos términos y la política de privacidad</li>
            </ul>
          </section>

          <section>
            <h2>3. Tipos de cuenta</h2>
            <h3>Estudiante</h3>
            <ul>
              <li>Puedes buscar y ver chazas disponibles</li>
              <li>Puedes postularte a trabajar en chazas</li>
              <li>Recibes notificaciones cuando respondan tu solicitud</li>
            </ul>
            <h3>Chazero</h3>
            <ul>
              <li>Puedes publicar tu chaza con los horarios que necesitas ayuda</li>
              <li>Recibes solicitudes de estudiantes interesados</li>
              <li>Puedes aceptar o rechazar solicitudes</li>
            </ul>
          </section>

          <section>
            <h2>4. Lo que NO hacemos</h2>
            <ul>
              <li><strong>NO somos empleadores.</strong> El trabajo es entre el chazero y el estudiante.</li>
              <li><strong>NO procesamos pagos.</strong> El pago se acuerda directamente entre las partes.</li>
              <li><strong>NO verificamos la calidad del trabajo.</strong> Cada quien es responsable.</li>
              <li><strong>NO ofrecemos garantías laborales.</strong> No somos una bolsa de empleo formal.</li>
            </ul>
          </section>

          <section>
            <h2>5. Tus responsabilidades</h2>
            <p>Al usar Chazas te comprometes a:</p>
            <ul>
              <li>Proporcionar información real y actualizada</li>
              <li>No publicar contenido ofensivo, ilegal o engañoso</li>
              <li>Respetar a los demás usuarios</li>
              <li>Cumplir los acuerdos que hagas con otros usuarios</li>
              <li>No usar la plataforma para fines ilegales</li>
            </ul>
          </section>

          <section>
            <h2>6. Contenido publicado</h2>
            <p>
              Tú eres responsable del contenido que publicas (chazas, solicitudes, mensajes).
              Nos reservamos el derecho de eliminar contenido que viole estos términos.
            </p>
          </section>

          <section>
            <h2>7. Limitación de responsabilidad</h2>
            <p>
              Chazas es una plataforma de conexión. No somos responsables de:
            </p>
            <ul>
              <li>Los acuerdos entre usuarios</li>
              <li>La calidad del trabajo realizado</li>
              <li>Disputas entre chazeros y estudiantes</li>
              <li>Pérdidas o daños derivados del uso de la plataforma</li>
            </ul>
            <p>
              Usas la plataforma bajo tu propia responsabilidad.
            </p>
          </section>

          <section>
            <h2>8. Suspensión de cuenta</h2>
            <p>
              Podemos suspender o eliminar tu cuenta si:
            </p>
            <ul>
              <li>Violas estos términos</li>
              <li>Publicas contenido inapropiado</li>
              <li>Usas la plataforma para actividades ilegales</li>
              <li>Recibes múltiples quejas de otros usuarios</li>
            </ul>
          </section>

          <section>
            <h2>9. Propiedad intelectual</h2>
            <p>
              El código, diseño y contenido de Chazas nos pertenece.
              El contenido que publicas (como descripciones de chazas) sigue siendo tuyo,
              pero nos das permiso de mostrarlo en la plataforma.
            </p>
          </section>

          <section>
            <h2>10. Cambios a estos términos</h2>
            <p>
              Podemos actualizar estos términos. Si hacemos cambios importantes,
              te avisaremos a través de la plataforma.
            </p>
          </section>

          <section>
            <h2>11. Ley aplicable</h2>
            <p>
              Estos términos se rigen por las leyes de Colombia.
            </p>
          </section>

          <section>
            <h2>¿Preguntas?</h2>
            <p>
              Si tienes dudas sobre estos términos, escríbenos a través
              del <Link to="/contacto">formulario de contacto</Link>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default TerminosCondiciones;
