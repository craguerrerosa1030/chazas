import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

function VerificarEmail({ email, onVerified }) {
    const { verifyRegistration, resendRegistrationCode } = useAuth();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(60);
    const inputRefs = useRef([]);

    // Countdown para reenvio (inicia en 60 porque el codigo ya fue enviado al registrar)
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleResendCode = async () => {
        setSending(true);
        setError('');
        try {
            const result = await resendRegistrationCode(email);
            if (result.success) {
                setSuccess('Codigo reenviado a ' + email);
                setCountdown(60);
                setTimeout(() => setSuccess(''), 5000);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    const handleChange = (index, value) => {
        if (value.length > 1) return;
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus al siguiente input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Backspace mueve al anterior
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length === 6) {
            setCode(pastedData.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerify = async () => {
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            setError('Ingresa el codigo completo de 6 digitos');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const result = await verifyRegistration(email, fullCode);
            if (result.success) {
                // Usuario creado y logueado automaticamente
                onVerified();
            } else {
                setError(result.error);
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (err) {
            setError(err.message);
            setCode(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="verificar-email-modal">
            <div className="verificar-email-content">
                <div className="verificar-header">
                    <span className="verificar-icon">📧</span>
                    <h2>Verifica tu correo</h2>
                    <p>
                        Enviamos un codigo de 6 digitos a<br/>
                        <strong>{email}</strong>
                    </p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <div className="code-inputs" onPaste={handlePaste}>
                    {code.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            disabled={loading || sending}
                            className="code-input"
                            autoFocus={index === 0}
                        />
                    ))}
                </div>

                <button
                    className="btn btn-primary btn-large btn-full"
                    onClick={handleVerify}
                    disabled={loading || sending || code.join('').length !== 6}
                >
                    {loading ? 'Verificando...' : 'Verificar codigo'}
                </button>

                <div className="resend-section">
                    <p>¿No recibiste el codigo?</p>
                    <button
                        className="btn-link"
                        onClick={handleResendCode}
                        disabled={loading || sending || countdown > 0}
                    >
                        {sending
                            ? 'Enviando...'
                            : countdown > 0
                                ? `Reenviar en ${countdown}s`
                                : 'Reenviar codigo'}
                    </button>
                </div>

                <p className="verificar-disclaimer">
                    El codigo expira en 15 minutos.<br/>
                    Revisa tambien tu carpeta de spam.
                </p>
            </div>
        </div>
    );
}

export default VerificarEmail;
