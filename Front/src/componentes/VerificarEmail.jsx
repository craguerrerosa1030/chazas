import { useState, useEffect, useRef } from 'react';
import { verificationApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

function VerificarEmail({ onVerified, onSkip }) {
    const { token, user, updateUser } = useAuth();
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [emailSent, setEmailSent] = useState(false);
    const inputRefs = useRef([]);

    // Enviar código automáticamente al montar
    useEffect(() => {
        if (!emailSent && token) {
            handleSendCode();
        }
    }, [token]);

    // Countdown para reenvío
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSendCode = async () => {
        setSending(true);
        setError('');
        try {
            await verificationApi.sendCode(token);
            setEmailSent(true);
            setSuccess('Código enviado a ' + user.email);
            setCountdown(60);
            // Limpiar mensaje de éxito después de 5 segundos
            setTimeout(() => setSuccess(''), 5000);
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
            setError('Ingresa el código completo de 6 dígitos');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const result = await verificationApi.verifyCode(fullCode, token);
            if (result.is_verified) {
                updateUser({ ...user, is_verified: true });
                onVerified();
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
                        Enviamos un código de 6 dígitos a<br/>
                        <strong>{user?.email}</strong>
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
                    {loading ? 'Verificando...' : 'Verificar código'}
                </button>

                <div className="resend-section">
                    <p>¿No recibiste el código?</p>
                    <button
                        className="btn-link"
                        onClick={handleSendCode}
                        disabled={loading || sending || countdown > 0}
                    >
                        {sending
                            ? 'Enviando...'
                            : countdown > 0
                                ? `Reenviar en ${countdown}s`
                                : 'Reenviar código'}
                    </button>
                </div>

                {onSkip && (
                    <button
                        className="btn-skip"
                        onClick={onSkip}
                        disabled={loading || sending}
                    >
                        Verificar después
                    </button>
                )}

                <p className="verificar-disclaimer">
                    El código expira en 15 minutos.<br/>
                    Revisa también tu carpeta de spam.
                </p>
            </div>
        </div>
    );
}

export default VerificarEmail;
