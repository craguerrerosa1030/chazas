import { Link } from 'react-router-dom';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Chazas</h4>
            <p>Conectando estudiantes con oportunidades de trabajo.</p>
            <p className="footer-disclaimer">
              Proyecto independiente. No estamos afiliados con ninguna universidad.
            </p>
          </div>

          <div className="footer-section">
            <h4>Enlaces</h4>
            <ul>
              <li><Link to="/sobre-nosotros">Sobre Nosotros</Link></li>
              <li><Link to="/buscar-chazas">Buscar Chazas</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/privacidad">Politica de Privacidad</Link></li>
              <li><Link to="/terminos">Terminos y Condiciones</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {year} Chazas. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
