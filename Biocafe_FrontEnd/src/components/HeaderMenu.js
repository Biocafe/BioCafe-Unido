import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import styles from "../styles/HeaderMenu.module.css";
import headerImage from "../assets/images/image.png";

const HeaderMenu = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  return (
    <>
      {/* Imagen de encabezado */}
      <div className={styles.headerImage}>
        <img src={headerImage} alt="Café Header" />
      </div>

      {/* Menú de navegación */}
      <nav className={styles.navbar}>
        <ul>
          <li><a href="/home">Inicio</a></li>
          <li><a href="/cargue-masivo">Cargue Masivo</a></li>
          <li><a href="/cargue-individual">Cargue Individual</a></li>
          <li className={styles.userMenu}>
            <FaUser className={styles.userIcon} />
            <div className={styles.dropdownMenu}>
              <button onClick={handleLogout}>Cerrar sesión</button>
            </div>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default HeaderMenu;