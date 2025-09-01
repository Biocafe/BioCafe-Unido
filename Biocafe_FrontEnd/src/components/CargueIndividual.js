import React, { useState } from "react";
import styles from "../styles/CargueIndividual.module.css";
import HeaderMenu from "../components/HeaderMenu";
import { FaFlask, FaPlus, FaChartBar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import datosService from "../services/datosService";

const CargueIndividual = () => {
  const [tratamientos, setTratamientos] = useState([
    { nombretto: "", valortto: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const nuevos = [...tratamientos];
    nuevos[index][name] = value;
    setTratamientos(nuevos);
  };

  const agregarTratamiento = () => {
    setTratamientos([...tratamientos, { nombretto: "", valortto: "" }]);
  };

  const validarCampos = () => {
    // Validar que hay al menos 3 tratamientos para análisis estadístico
    if (tratamientos.length < 3) {
      setError("Se requieren al menos 3 tratamientos para realizar análisis estadístico completo.");
      return false;
    }
    
    // Validar que todos los campos estén completos
    const camposCompletos = tratamientos.every((t) => t.nombretto.trim() && t.valortto);
    if (!camposCompletos) {
      setError("Todos los tratamientos deben tener nombre y valor.");
      return false;
    }
    
    // Validar que los valores sean números válidos
    const valoresValidos = tratamientos.every((t) => !isNaN(parseFloat(t.valortto)) && isFinite(parseFloat(t.valortto)));
    if (!valoresValidos) {
      setError("Todos los valores deben ser números válidos.");
      return false;
    }
    
    // Validar nombres únicos de tratamientos
    const nombres = tratamientos.map(t => t.nombretto.trim().toLowerCase());
    const nombresUnicos = new Set(nombres);
    if (nombres.length !== nombresUnicos.size) {
      setError("Los nombres de los tratamientos deben ser únicos.");
      return false;
    }
    
    setError(""); // Limpiar errores si todo está bien
    return true;
  };

  const handleMostrarResultado = async () => {
    if (!validarCampos()) {
      return; // El error ya se muestra en validarCampos
    }
    
    setLoading(true);
    setError("");
    
    try {
      // Convertir valores a números y enviar al backend
      const tratamientosFormateados = tratamientos.map(t => ({
        nombretto: t.nombretto,
        valortto: parseFloat(t.valortto),
        resultado: parseFloat(t.valortto) // El resultado es el mismo valor para carga individual
      }));
      
      // Enviar datos al backend usando DatosDto
      const datosGuardados = await datosService.crearMultiples(tratamientosFormateados);
      
      // Navegar a resultados con los datos guardados
      navigate("/resultados", { 
        state: { 
          tratamientos: tratamientosFormateados,
          datosBackend: datosGuardados
        } 
      });
    } catch (error) {
      setError("Error al guardar los datos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <HeaderMenu />
      <div className={styles.content}>
        <h1>
          <FaFlask className={styles.icon} /> Registro de Tratamientos
        </h1>
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        {tratamientos.map((tto, index) => (
          <fieldset key={index} className={styles.fieldset}>
            <legend>
              <FaFlask /> Tratamiento #{index + 1}
            </legend>
            <input
              type="text"
              name="nombretto"
              placeholder="Nombre del tratamiento"
              value={tto.nombretto}
              onChange={(e) => handleChange(index, e)}
            />
            <input
              type="number"
              name="valortto"
              placeholder="Valor"
              value={tto.valortto}
              onChange={(e) => handleChange(index, e)}
            />
          </fieldset>
        ))}

        <button onClick={agregarTratamiento} className={styles.addBtn} disabled={loading}>
          <FaPlus /> Agregar Tratamiento
        </button>
        <button
          className={styles.resultadoBtn}
          onClick={handleMostrarResultado}
          disabled={loading}
        >
          <FaChartBar /> {loading ? 'Procesando...' : 'Resultado'}
        </button>
      </div>
    </div>
  );
};

export default CargueIndividual;