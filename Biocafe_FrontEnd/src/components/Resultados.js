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

const Resultados = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const modalRef = useRef();
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const procesarResultados = async () => {
      if (!location.state || !location.state.tratamientos) {
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
        console.error('Error al procesar resultados:', error);
        setError('Error al obtener las pruebas estadísticas: ' + error.message);
        // No usar datos simulados - mostrar error al usuario
      } finally {
        setLoading(false);
      }
    };

    procesarResultados();
  }, [location, navigate]);

  const exportToImage = async () => {
    const canvas = await html2canvas(modalRef.current, {
      useCORS: true,
      allowTaint: true,
      scale: 2,
    });
    const imgData = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imgData;
    link.download = "resultados.png";
    link.click();
  };

  const exportToPDF = async () => {
    const canvas = await html2canvas(modalRef.current, {
      useCORS: true,
      allowTaint: true,
      scale: 2,
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    // Calcula dimensiones para no recortar
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);
    pdf.save("resultados.pdf");
  };

  const exportToExcel = () => {
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
    XLSX.utils.book_append_sheet(wb, ws, "Resultados Duncan");
    XLSX.writeFile(wb, "resultados.xlsx");
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
          <h2>Resultados Estadísticos</h2>
          <div className={styles.pruebasEstadisticas}>
            <h3>Pruebas de Normalidad y Homogeneidad</h3>
            <div className={styles.pruebaDetalle}>
              <h4>📊 Prueba de Shapiro-Wilk (Normalidad)</h4>
              {resultados.shapiro?.W ? (
                <div className={styles.shapiroResultados}>
                  <div className={styles.estadisticos}>
                    <span><strong>W (Estadístico de Shapiro-Wilk) = {typeof resultados.shapiro.W === 'number' ? resultados.shapiro.W.toFixed(4) : resultados.shapiro.W}</strong></span>
                    <span><strong>n (Tamaño de la Muestra) = {resultados.shapiro.n}</strong></span>
                    <span><strong>Resultado: {typeof resultados.shapiro.pValor === 'number' ? resultados.shapiro.pValor.toFixed(4) : resultados.shapiro.pValor}</strong></span>
                  </div>
                  <div className={styles.resultado}>
                    {resultados.shapiro.pValor > 0.05 ? (
                      <span className={styles.exito}>Los datos siguen una distribución normal</span>
                    ) : (
                      <span className={styles.advertencia}>Los datos NO siguen una distribución normal</span>
                    )}
            </div>
            
            {/* Gráfico de Shapiro-Wilk */}
            <GraficoShapiro 
              datos={resultados.tratamientos}
              resultadosShapiro={resultados.shapiro}
            />
                </div>
              ) : (
                <div className={styles.shapiroError}>
                  <span className={styles.mensaje}>{resultados.shapiro?.mensaje || 'No disponible'}</span>
                  <span className={styles.conclusion}>{resultados.shapiro?.conclusion || 'No se pudo evaluar'}</span>
                </div>
              )}
            </div>
            <div className={styles.pruebaDetalle}>
              <h4>📊 Prueba de Levene (Homogeneidad)</h4>
              <div className={styles.shapiroResultados}>
                <div className={styles.estadisticos}>
                  <span><strong>Resultado: {typeof resultados.levene === 'number' ? resultados.levene.toFixed(2) : resultados.levene}</strong></span>
                </div>
                <div className={styles.resultado}>
                  {resultados.levene > 0.05 ? (
                    <span className={styles.exito}>Homogeneidad confirmada</span>
                  ) : (
                    <span className={styles.advertencia}>Varianzas heterogéneas</span>
                  )}
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

          <div className={styles.pruebasEstadisticas}>
            <h3>Análisis de Varianza (ANOVA)</h3>
            <div className={styles.pruebaDetalle}>
              <h4>📊 ANOVA</h4>
              <div className={styles.shapiroResultados}>
                <div className={styles.estadisticos}>
                  <span><strong>Resultado: {typeof resultados.anova === 'number' ? resultados.anova.toFixed(2) : resultados.anova}</strong></span>
                </div>
                <div className={styles.resultado}>
                  {resultados.anova < 0.05 ? (
                    <span className={styles.advertencia}>Hay diferencias significativas</span>
                  ) : (
                    <span className={styles.exito}>No hay diferencias significativas</span>
                  )}
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
                y: resultados.tratamientos.map((t) => Number(t.resultado)),
                mode: "markers",
                type: "scatter",
              },
            ]}
            layout={{
              width: 500,
              height: 400,
              title: "Dispersión Tratamientos vs Resultado",
            }}
          />

          <h3>Boxplot</h3>
          <Plot
            data={[
              {
                y: resultados.tratamientos.map((t) => Number(t.resultado)),
                x: resultados.tratamientos.map((t) => t.nombretto),
                type: "box",
                boxpoints: "all",
              },
            ]}
            layout={{
              width: 500,
              height: 400,
              title: "Distribución por Tratamiento",
            }}
          />
        </div>

        <div className={styles.botonesExportacion}>
          <button onClick={exportToImage}>
            <FaImage /> Exportar Imagen
          </button>
          <button onClick={exportToPDF}>
            <FaFilePdf /> Exportar PDF
          </button>
          <button onClick={exportToExcel}>
            <FaFileExcel /> Exportar Excel
          </button>
          <button onClick={() => navigate(-1)}>
            <FaArrowLeft /> Volver
          </button>
        </div>
      </div>
    </>
  );
};

export default Resultados;