import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VerificarEmail from '../componentes/VerificarEmail';
import { useEffect } from 'react';

function Verificacion() {
    const navigate = useNavigate();
    const { user, isAuthenticated, isVerified } = useAuth();

    useEffect(() => {
        // Si no está logueado, ir a login
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }
        // Si ya está verificado, ir a dashboard
        if (isVerified()) {
            navigate('/dashboard');
        }
    }, [user, isAuthenticated, isVerified, navigate]);

    const handleVerified = () => {
        navigate('/dashboard');
    };

    const handleSkip = () => {
        // Permitir uso limitado sin verificar
        navigate('/dashboard');
    };

    // Si está verificado o no autenticado, no mostrar nada (se redirige)
    if (!isAuthenticated() || isVerified()) {
        return null;
    }

    return (
        <div className="verificacion-page">
            <VerificarEmail
                onVerified={handleVerified}
                onSkip={handleSkip}
            />
        </div>
    );
}

export default Verificacion;
