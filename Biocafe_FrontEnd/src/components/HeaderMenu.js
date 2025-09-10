import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import styles from "../styles/HeaderMenu.module.css";
import headerImage from "../assets/images/image.png";
import authService from "../services/authService";

const HeaderMenu = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(`.${styles.userMenu}`)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    const loadUserData = () => {
      try {
        setLoading(true);
        
        // Verificar si hay usuario autenticado
        const isAuth = localStorage.getItem('isAuthenticated');
        const userInfo = localStorage.getItem('userInfo');
        const usuario = localStorage.getItem('usuario');
        
        if (isAuth === 'true' && (userInfo || usuario)) {
          let parsedUser = {};
          
          if (userInfo) {
            parsedUser = JSON.parse(userInfo);
          } else if (usuario) {
            parsedUser = JSON.parse(usuario);
          }
          
          setUserData({
            correo: parsedUser.email || parsedUser.correo || parsedUser.usuario || parsedUser.nombre || 'Usuario',
            cargo: parsedUser.role || parsedUser.cargo || parsedUser.tipo_usuario || parsedUser.rol || 'Caficultor'
          });
        } else {
          // Datos por defecto para usuario no autenticado
          setUserData({
            correo: 'Invitado',
            cargo: 'Visitante'
          });
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        // Datos por defecto en caso de error
        setUserData({
          correo: 'Usuario',
          cargo: 'Caficultor'
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMouseEnter = () => {
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300);
  };

  const handleDropdownMouseEnter = () => {
    setIsDropdownOpen(true);
  };

  const handleDropdownMouseLeave = () => {
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 100);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate("/");
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Fallback: limpiar localStorage manualmente
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userInfo");
      navigate("/");
    }
  };

  return (
    <>
      {/* Imagen de encabezado */}
      <div className={styles.headerImage}>
        <img src={headerImage} alt="Café Header" />
      </div>

      {/* Menú de navegación */}
      <nav className={styles.navbar}>
        <ul className={styles.navLinks}>
           <li className={styles.logoMenuItem}>
             <img src="/logo-biocafe.png" alt="BioCafé Logo" className={styles.logo} />
             <a href="/home">Inicio</a>
           </li>
           <li><a href="/cargue-masivo">Cargue Masivo</a></li>
           <li><a href="/cargue-individual">Cargue Individual</a></li>
           <li className={styles.userMenu} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <FaUser className={styles.userIcon} onClick={toggleDropdown} />
              <div 
                className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.dropdownOpen : ''}`}
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
              >
               {loading ? (
                 <div className={styles.userInfo}>
                   <div className={styles.userEmail}>☕ Cargando...</div>
                   <div className={styles.userRole}>⏳ Espere...</div>
                 </div>
               ) : (
                 <div className={styles.userInfo}>
                   <div className={styles.userEmail}>{userData?.correo || 'Usuario'}</div>
                   <div className={styles.userRole}>🌱 {userData?.cargo || 'Caficultor'}</div>
                 </div>
               )}
               <div className={styles.divider}></div>
               <button onClick={handleLogout} className={styles.logoutButton} title="Cerrar sesión">
                 <span className={styles.logoutIcon}>↩</span>
                 <span className={styles.logoutText}>Cerrar sesión</span>
               </button>
             </div>
           </li>
         </ul>
      </nav>
    </>
  );
};

export default HeaderMenu;