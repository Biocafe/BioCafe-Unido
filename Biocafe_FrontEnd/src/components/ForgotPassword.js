import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import styles from '../styles/login.module.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    if (email !== confirmEmail) {
      setError('Los correos no coinciden.');
      setLoading(false);
      return;
    }
    
    try {
      const result = await authService.forgotPassword(email);
      if (result.ok) {
        setMessage(`El correo para restablecer su clave fue enviado de manera satisfactoria a ${email}`);
      } else {
        setError(result.message || 'Error al enviar el correo');
      }
    } catch (error) {
      setError(error.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginBackground}>
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h2>Restablecer Clave</h2>
          {message ? (
            <>
              <p className={styles.successMessage}>{message}</p>
              <button className={styles.loginButton} onClick={() => navigate('/')}>Volver</button>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}
              <div className={styles.inputGroup}>
                <label htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="confirmEmail">Confirmar correo</label>
                <input
                  type="email"
                  id="confirmEmail"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.links}>
                <button type="submit" className={styles.loginButton} disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar'}
                </button>
                <button type="button" className={styles.loginButton} onClick={() => navigate('/')} disabled={loading}>Volver</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;