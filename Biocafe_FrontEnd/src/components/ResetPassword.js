import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';
import styles from '../styles/ForgotPassword.module.css';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Token de recuperación no válido o expirado');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validaciones
    if (!token) {
      setError('Token de recuperación no válido');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.resetPassword(token, newPassword);
      
      if (response.ok) {
        setMessage('Contraseña restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.');
      } else {
        setError(response.message || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      setError(error.message || 'Error de conexión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginBackground}>
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h2>Restablecer Contraseña</h2>
          {message ? (
            <>
              <p style={{ color: 'green', marginBottom: '20px' }}>{message}</p>
              <button 
                className={styles.loginButton} 
                onClick={() => navigate('/login')}
                style={{ width: '100%' }}
              >
                Ir a Login
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ 
                  color: 'red', 
                  marginBottom: '15px', 
                  padding: '10px', 
                  backgroundColor: '#ffe6e6', 
                  borderRadius: '5px',
                  border: '1px solid #ff9999'
                }}>
                  {error}
                </div>
              )}
              
              <div className={styles.inputGroup}>
                <label htmlFor="newPassword">Nueva Contraseña</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="6"
                  disabled={loading || !token}
                  placeholder="Ingresa tu nueva contraseña"
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength="6"
                  disabled={loading || !token}
                  placeholder="Confirma tu nueva contraseña"
                />
              </div>
              
              <div className={styles.links}>
                <button 
                  type="submit" 
                  className={styles.loginButton} 
                  disabled={loading || !token}
                >
                  {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                </button>
                <button 
                  type="button" 
                  className={styles.loginButton} 
                  onClick={() => navigate('/login')}
                  disabled={loading}
                >
                  Volver al Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;