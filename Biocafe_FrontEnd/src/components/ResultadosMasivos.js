import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/Resultados.module.css";
import HeaderMenu from "../components/HeaderMenu";
import GraficoShapiro from "../components/GraficoShapiro";
import GraficoLevene from "../components/GraficoLevene";
import GraficoAnova from "../components/GraficoAnova";
import GraficoDuncan from "../components/GraficoDuncan";
import Plot from "react-plotly.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { FaImage, FaFilePdf, FaFileExcel, FaArrowLeft } from "react-icons/fa";
import pruebasService from "../services/pruebasService";

const ResultadosMasivos = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const modalRef = useRef();
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const procesarResultados = async () => {
      if (!location.state?.tratamientos) {
        navigate("/");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const tratamientos = location.state.tratamientos;
        
        // Obtener pruebas estadísticas reales del backend
        const pruebasEstadisticas = await pruebasService.procesarResultadosCompletos(tratamientos);
        
        // Formatear resultados para el componente
        const resultadosFormateados = {
          tratamientos: tratamientos.map((t) => ({
            ...t,
            resultado: Number(t.valortto) // Usar el valor real, no simulado
          })),
          shapiro: pruebasEstadisticas.estadisticas.shapiro, // Objeto completo de Shapiro
          levene: pruebasEstadisticas.estadisticas.levene?.pValor || 0,
          anova: pruebasEstadisticas.estadisticas.anova?.pValor || 0,
          duncan: pruebasEstadisticas.estadisticas.duncan?.grupos || []
        };
        
        setResultados(resultadosFormateados);
      } catch (error) {
        console.error('Error al procesar resultados masivos:', error);
        setError('Error al obtener las pruebas estadísticas: ' + error.message);
        // No usar datos simulados - mostrar error al usuario
      } finally {
        setLoading(false);
      }
    };

    procesarResultados();
  }, [location, navigate]);

  const exportToImage = async () => {
    const canvas = await html2canvas(modalRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imgData;
    link.download = "resultados-masivos.png";
    link.click();
  };

  const exportToPDF = async () => {
    const canvas = await html2canvas(modalRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const w = pdf.internal.pageSize.getWidth() - 20;
    const imgProps = pdf.getImageProperties(imgData);
    const h = (imgProps.height * w) / imgProps.width;
    pdf.addImage(imgData, "PNG", 10, 10, w, h);
    pdf.save("resultados-masivos.pdf");
  };

  const exportToExcel = () => {
    if (!resultados.duncan || resultados.duncan.length === 0) {
      alert('No hay datos de Duncan para exportar');
      return;
    }
    
    const wsData = [
      ["Tratamiento", "Media", "Grupo"],
      ...resultados.duncan.map((d) => [
        d.tratamiento, 
        typeof d.media === 'number' ? Math.round(d.media) : 'N/A', 
        d.grupo || 'N/A'
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Duncan");
    XLSX.writeFile(wb, "resultados-masivos.xlsx");
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <HeaderMenu />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Procesando pruebas estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <HeaderMenu />
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{error}</p>
          <button 
            className={styles.backButton}
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft /> Volver
          </button>
        </div>
      </div>
    );
  }

  if (!resultados) return null;

  return (
    <>
      <HeaderMenu />
      <div className={styles.resultadosContainer}>
        <div ref={modalRef} className={styles.resultadosContenido}>
          <h2>Resultados Estadísticos - Carga Masiva</h2>
          
          <h3>Pruebas de Normalidad y Homogeneidad</h3>
          
          {/* Shapiro-Wilk Test */}
          <div className={styles.pruebaDetalle}>
            <h4>Prueba de Shapiro-Wilk</h4>
            <div className={styles.shapiroResultados}>
              <div className={styles.estadisticos}>
                <span><strong>W (Estadístico de Shapiro-Wilk) = {typeof resultados.shapiro?.W === 'number' ? resultados.shapiro.W.toFixed(4) : resultados.shapiro?.W || 'N/A'}</strong></span>
                <span><strong>n (Tamaño de la Muestra) = {resultados.shapiro?.n || resultados.tratamientos?.length || 'N/A'}</strong></span>
                <span><strong>Resultado: {typeof resultados.shapiro?.pValor === 'number' ? resultados.shapiro.pValor.toFixed(4) : resultados.shapiro?.pValor || 'N/A'}</strong></span>
              </div>
              <div className={styles.resultado}>
                <div className={`${styles.interpretacion} ${
                  resultados.shapiro?.pValor > 0.05 ? styles.exito : styles.advertencia
                }`}>
                  <strong>Interpretación:</strong> {resultados.shapiro?.mensaje || 'Análisis no disponible'}
                </div>
              </div>
            </div>
            
            {/* Gráfico de Shapiro-Wilk */}
            <GraficoShapiro 
              datos={resultados.tratamientos}
              resultadosShapiro={resultados.shapiro}
            />
          </div>
          
          {/* Levene Test */}
          <div className={styles.pruebaDetalle}>
            <h4>Prueba de Levene</h4>
            <div className={styles.shapiroResultados}>
              <div className={styles.estadisticos}>
                <span><strong>Resultado: {typeof resultados.levene === 'number' ? resultados.levene.toFixed(2) : resultados.levene}</strong></span>
              </div>
              <div className={styles.resultado}>
                <div className={`${styles.interpretacion} ${
                  resultados.levene > 0.05 ? styles.exito : styles.advertencia
                }`}>
                  <strong>Interpretación:</strong> {resultados.levene > 0.05 ? "Los grupos tienen varianzas homogéneas" : "Los grupos no tienen varianzas homogéneas"}
                </div>
              </div>
            </div>
            
            {/* Gráfico de Levene */}
            <GraficoLevene 
              datos={resultados.tratamientos}
              resultadosLevene={{
                pValor: resultados.levene
              }}
            />
          </div>
          
          <h3>Análisis de Varianza</h3>
          
          {/* ANOVA Test */}
          <div className={styles.pruebaDetalle}>
            <h4>Prueba ANOVA</h4>
            <div className={styles.shapiroResultados}>
              <div className={styles.estadisticos}>
                <span><strong>Resultado: {typeof resultados.anova === 'number' ? resultados.anova.toFixed(2) : resultados.anova}</strong></span>
              </div>
              <div className={styles.resultado}>
                <div className={`${styles.interpretacion} ${
                  resultados.anova < 0.05 ? styles.exito : styles.advertencia
                }`}>
                  <strong>Interpretación:</strong> {resultados.anova < 0.05 ? "Existen diferencias significativas entre los tratamientos" : "No existen diferencias significativas entre los tratamientos"}
                </div>
              </div>
            </div>
            
            {/* Gráfico de ANOVA */}
            <GraficoAnova 
              datos={resultados.tratamientos}
              resultadosAnova={{
                F: resultados.anovaF,
                pValor: resultados.anova
              }}
            />
          </div>
          

          {/* Informe de Duncan */}
          {resultados.duncan && resultados.duncan.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <GraficoDuncan 
                datos={resultados.tratamientos} 
                resultadosDuncan={resultados.duncan}
              />
            </div>
          )}

          <h3>Gráfico de Dispersión</h3>
          <Plot
            data={[
              {
                x: resultados.tratamientos.map((t) => t.nombretto),
                y: resultados.tratamientos.map((t) => t.resultado),
                mode: "markers",
                type: "scatter",
              },
            ]}
            layout={{ width: 500, height: 400, title: "Dispersión Tratamientos vs Resultado" }}
          />

          <h3>Boxplot</h3>
          <Plot
            data={[
              {
                x: resultados.tratamientos.map((t) => t.nombretto),
                y: resultados.tratamientos.map((t) => t.resultado),
                type: "box",
                boxpoints: "all",
              },
            ]}
            layout={{ width: 500, height: 400, title: "Distribución por Tratamiento" }}
          />
        </div>

        <div className={styles.botonesExportacion}>
          <button onClick={exportToImage}>
            <FaImage /> Imagen
          </button>
          <button onClick={exportToPDF}>
            <FaFilePdf /> PDF
          </button>
          <button onClick={exportToExcel}>
            <FaFileExcel /> Excel
          </button>
          <button onClick={() => navigate(-1)}>
            <FaArrowLeft /> Volver
          </button>
        </div>
      </div>
    </>
  );
};

export default ResultadosMasivos;