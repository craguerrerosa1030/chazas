import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VerificarEmail from '../componentes/VerificarEmail';
import { useEffect } from 'react';

function Verificacion() {
    const navigate = useNavigate();
    const { pendingEmail, isAuthenticated } = useAuth();

    useEffect(() => {
        // Si ya esta logueado, ir a dashboard
        if (isAuthenticated()) {
            navigate('/dashboard');
            return;
        }
        // Si no hay email pendiente, ir a registro
        if (!pendingEmail) {
            navigate('/registro');
        }
    }, [pendingEmail, isAuthenticated, navigate]);

    const handleVerified = () => {
        // Usuario creado y logueado automaticamente, ir a dashboard
        navigate('/dashboard');
    };

    // Si ya esta autenticado o no hay email pendiente, no mostrar nada (se redirige)
    if (isAuthenticated() || !pendingEmail) {
        return null;
    }

    return (
        <div className="verificacion-page">
            <VerificarEmail
                email={pendingEmail}
                onVerified={handleVerified}
            />
        </div>
    );
}

export default Verificacion;
