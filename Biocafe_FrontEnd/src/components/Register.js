import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import styles from '../styles/Register.module.css';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState('caficultor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validaciones
    if (email !== confirmEmail) {
      setError('Los correos no coinciden.');
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }
    
    try {
      // Registrar usuario con envío automático de email de bienvenida
      const userData = {
        usuario: email, // El backend espera 'usuario' según AutenticadorDto
        password: password, // El backend espera 'password' según AutenticadorDto
        email: email, // Para el envío de email
        nombre: fullName,
        rol
      };
      
      const result = await authService.register(userData);
      
      if (result.ok) {
        setMessage(`Su usuario ha sido registrado exitosamente. Se ha enviado un correo de confirmación a ${email}. Ya puede iniciar sesión.`);
      } else {
        setError(result.message || 'Error en el registro');
      }
    } catch (error) {
      setError(error.message || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginBackground}>
      <div className={styles.logoContainer}>
        <img src="/logo-biocafe.png" alt="BioCafé Logo" className={styles.animatedLogo} />
      </div>
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <h2>Registrarse</h2>
          {message ? (
            <>
              <p>{message}</p>
              <button className={styles.loginButton} onClick={() => navigate('/login')}>Ir a Login</button>
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
                <label htmlFor="fullName">Nombre Completo</label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.selectGroup}>
                  <label htmlFor="idType">Tipo de Identificación</label>
                  <select id="idType" value={idType} onChange={(e) => setIdType(e.target.value)} required>
                    <option value="">Seleccione</option>
                    <option value="cedula">Cédula</option>
                    <option value="permiso">Permiso por Protección Temporal</option>
                    <option value="pasaporte">Pasaporte</option>
                    <option value="cedula-extranjeria">Cédula de Extranjería</option>
                  </select>
                </div>

              <div className={styles.inputGroup}>
                <label htmlFor="idNumber">Número de Identificación</label>
                <input
                  type="text"
                  id="idNumber"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="confirmEmail">Confirmar Correo</label>
                <input
                  type="email"
                  id="confirmEmail"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                  disabled={loading}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength="6"
                  disabled={loading}
                />
              </div>
              <div className={styles.selectGroup}>
                <label htmlFor="rol">Rol</label>
                <select id="rol" value={rol} onChange={(e) => setRol(e.target.value)} required disabled={loading}>
                  <option value="caficultor">Caficultor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className={styles.links}>
                <button type="submit" className={styles.loginButton} disabled={loading}>
                  {loading ? 'Registrando...' : 'Registrarse'}
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

export default Register;