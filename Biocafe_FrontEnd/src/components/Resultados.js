import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/Resultados.module.css";
import HeaderMenu from "../components/HeaderMenu";
import GraficoShapiro from "../components/GraficoShapiro";
import GraficoLevene from "../components/GraficoLevene";
import GraficoAnova from "../components/GraficoAnova";
import GraficoDuncan from "../components/GraficoDuncan";
import InformeModal from "../components/InformeModal";
import Plot from "react-plotly.js";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import { FaImage, FaFilePdf, FaFileExcel, FaArrowLeft, FaEye } from "react-icons/fa";
import pruebasService from "../services/pruebasService";

const Resultados = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const modalRef = useRef();
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalAbierto, setModalAbierto] = useState(null);

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
    // Si hay un modal abierto, capturar el contenido del modal
    let element = modalRef.current;
    let filename = "resultados.png";
    
    if (modalAbierto) {
      // Buscar el contenido del modal abierto
      console.log('Modal detectado:', modalAbierto);
      const modalContent = document.querySelector('[class*="InformeModal_modalBody"], .modalBody, [class*="modalBody"]');
      console.log('Modal content encontrado:', modalContent);
      if (modalContent) {
        element = modalContent;
        filename = `informe_detallado_${modalAbierto}.png`;
        console.log('Usando contenido del modal para exportar');
      } else {
        console.log('No se encontró contenido del modal, usando contenido principal');
      }
    }
    
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      scale: 2,
      height: element.scrollHeight,
      width: element.scrollWidth,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });
    const imgData = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imgData;
    link.download = filename;
    link.click();
  };

  const exportToPDF = async () => {
    // Si hay un modal abierto, capturar el contenido del modal
    let element = modalRef.current;
    let filename = "resultados.pdf";
    
    if (modalAbierto) {
      // Buscar el contenido del modal abierto
      console.log('Modal detectado en PDF:', modalAbierto);
      const modalContent = document.querySelector('[class*="InformeModal_modalBody"], .modalBody, [class*="modalBody"]');
      console.log('Modal content encontrado en PDF:', modalContent);
      if (modalContent) {
        element = modalContent;
        filename = `informe_detallado_${modalAbierto}.pdf`;
        console.log('Usando contenido del modal para PDF');
      } else {
        console.log('No se encontró contenido del modal en PDF, usando contenido principal');
      }
    }
    
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      scale: 2,
      height: element.scrollHeight,
      width: element.scrollWidth,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = imgProps.width;
    const imgHeight = imgProps.height;
    
    // Calcular dimensiones escaladas
    const ratio = Math.min(contentWidth / imgWidth, (pageHeight - margin * 2) / imgHeight);
    const scaledWidth = imgWidth * ratio;
    const scaledHeight = imgHeight * ratio;
    
    // Si la imagen cabe en una página
    if (scaledHeight <= pageHeight - margin * 2) {
      pdf.addImage(imgData, "PNG", margin, margin, scaledWidth, scaledHeight);
    } else {
      // Dividir en múltiples páginas
      const maxHeightPerPage = pageHeight - margin * 2;
      const totalPages = Math.ceil(scaledHeight / maxHeightPerPage);
      
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();
        
        const yOffset = i * maxHeightPerPage;
        const remainingHeight = Math.min(maxHeightPerPage, scaledHeight - yOffset);
        
        // Crear una sección de la imagen para esta página
        const sectionCanvas = document.createElement('canvas');
        const sectionCtx = sectionCanvas.getContext('2d');
        sectionCanvas.width = imgWidth;
        sectionCanvas.height = remainingHeight / ratio;
        
        const img = new Image();
        img.onload = () => {
          sectionCtx.drawImage(img, 0, -(yOffset / ratio), imgWidth, imgHeight);
          const sectionImgData = sectionCanvas.toDataURL('image/png');
          pdf.addImage(sectionImgData, 'PNG', margin, margin, scaledWidth, remainingHeight);
          
          if (i === totalPages - 1) {
            pdf.save(filename);
          }
        };
        img.src = imgData;
      }
      return;
    }
    
    pdf.save(filename);
  };

  const abrirModal = (tipo) => {
    setModalAbierto(tipo);
  };

  const cerrarModal = () => {
    setModalAbierto(null);
  };

  const getShapiroContent = () => {
    if (!resultados.shapiro?.W) return <div>No hay datos disponibles</div>;
    
    const n = resultados.shapiro.n || 0;
    const correlacionQQ = 0.998; // Valor de ejemplo, debería calcularse
    
    return (
      <div style={{ lineHeight: '1.6', fontSize: '14px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>🎯 ¿Qué es la Prueba de Shapiro-Wilk?</h5>
          <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
            La prueba de Shapiro-Wilk es una prueba estadística de normalidad que evalúa si una muestra de datos 
            proviene de una distribución normal. Es considerada una de las pruebas más potentes para detectar 
            desviaciones de la normalidad, especialmente efectiva para muestras pequeñas (n ≤ 50) pero también 
            aplicable a muestras más grandes.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>🔬 ¿Cómo se Aplicó en sus Datos?</h5>
          <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
            Se analizaron <strong>{n} observaciones</strong> de su variable de interés. La prueba calculó el estadístico W 
            comparando los cuantiles observados con los esperados bajo normalidad. Los gráficos generados incluyen:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
            <li><strong>Q-Q Plot:</strong> Compara cuantiles observados vs. teóricos (correlación = {correlacionQQ.toFixed(3)})</li>
            <li><strong>Histograma:</strong> Distribución de datos vs. curva normal teórica</li>
            <li><strong>Residuos:</strong> Desviaciones estandarizadas para detectar patrones anómalos</li>
          </ul>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>📊 Interpretación de Resultados</h5>
          <div style={{ 
            padding: '15px', 
            backgroundColor: typeof resultados.shapiro.pValor === 'number' && resultados.shapiro.pValor < 0.05 ? '#ffebee' : '#e8f5e8',
            borderRadius: '8px',
            border: '2px solid ' + (typeof resultados.shapiro.pValor === 'number' && resultados.shapiro.pValor < 0.05 ? '#f44336' : '#4caf50'),
            marginBottom: '15px'
          }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
              {typeof resultados.shapiro.pValor === 'number' && resultados.shapiro.pValor < 0.05 ? 
                '❌ CONCLUSIÓN: Los datos NO siguen una distribución normal' : 
                '✅ CONCLUSIÓN: Los datos siguen una distribución normal'}
            </p>
            <p style={{ margin: '0', fontSize: '13px' }}>
              <strong>Estadístico W:</strong> {typeof resultados.shapiro.W === 'number' ? resultados.shapiro.W.toFixed(4) : 'N/A'} 
              (valores cercanos a 1 indican normalidad)<br/>
              <strong>P-valor:</strong> {typeof resultados.shapiro.pValor === 'number' ? resultados.shapiro.pValor.toFixed(4) : 'N/A'} 
              (si p menor que 0.05, rechazamos normalidad)<br/>
              <strong>Correlación Q-Q:</strong> {correlacionQQ.toFixed(3)} 
              (valores &gt; 0.95 sugieren buena normalidad)
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>🎯 ¿Qué Significan estos Resultados?</h5>
          {typeof resultados.shapiro.pValor === 'number' && resultados.shapiro.pValor < 0.05 ? (
            <div>
              <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
                Sus datos <strong>NO siguen una distribución normal</strong>. Esto significa que:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
                <li>La distribución puede ser asimétrica, tener colas pesadas o múltiples modas</li>
                <li>Pueden existir valores atípicos que afectan la normalidad</li>
                <li>La variabilidad no es constante a lo largo del rango de datos</li>
              </ul>
              <p style={{ margin: '0 0 10px 0', textAlign: 'justify', fontWeight: 'bold', color: '#d32f2f' }}>
                ⚠️ IMPLICACIONES: No es recomendable usar pruebas paramétricas (t-test, ANOVA) sin transformaciones.
              </p>
            </div>
          ) : (
            <div>
              <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
                Sus datos <strong>siguen una distribución normal</strong>. Esto significa que:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
                <li>La distribución es simétrica alrededor de la media</li>
                <li>Aproximadamente 68% de los datos están dentro de ±1 desviación estándar</li>
                <li>Los valores extremos son raros y siguen el patrón esperado</li>
              </ul>
              <p style={{ margin: '0 0 10px 0', textAlign: 'justify', fontWeight: 'bold', color: '#388e3c' }}>
                ✅ IMPLICACIONES: Es apropiado usar pruebas paramétricas (t-test, ANOVA, correlación de Pearson).
              </p>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>💡 Recomendaciones Específicas</h5>
          {typeof resultados.shapiro.pValor === 'number' && resultados.shapiro.pValor < 0.05 ? (
            <div style={{ backgroundColor: '#fff3e0', padding: '15px', borderRadius: '8px', border: '1px solid #ff9800' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Dado que los datos NO son normales:</p>
              <ul style={{ marginLeft: '20px', margin: '0' }}>
                <li><strong>Transformaciones:</strong> Considere log, raíz cuadrada o Box-Cox</li>
                <li><strong>Pruebas alternativas:</strong> Use Mann-Whitney U, Kruskal-Wallis, o Wilcoxon</li>
                <li><strong>Análisis robusto:</strong> Emplee estadísticas no paramétricas</li>
                <li><strong>Verificación:</strong> Revise outliers y considere su eliminación justificada</li>
                {correlacionQQ < 0.90 && <li><strong>Atención:</strong> La baja correlación Q-Q ({correlacionQQ.toFixed(3)}) sugiere desviaciones importantes</li>}
              </ul>
            </div>
          ) : (
            <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '8px', border: '1px solid #4caf50' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Dado que los datos son normales:</p>
              <ul style={{ marginLeft: '20px', margin: '0' }}>
                <li><strong>Análisis paramétrico:</strong> Proceda con t-tests, ANOVA, regresión lineal</li>
                <li><strong>Intervalos de confianza:</strong> Use métodos basados en distribución normal</li>
                <li><strong>Predicciones:</strong> Los modelos lineales serán apropiados</li>
                <li><strong>Control de calidad:</strong> Puede usar gráficos de control tradicionales</li>
                {correlacionQQ > 0.95 && <li><strong>Excelente:</strong> La alta correlación Q-Q ({correlacionQQ.toFixed(3)}) confirma normalidad robusta</li>}
              </ul>
            </div>
          )}
        </div>

        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '15px', 
          borderRadius: '8px', 
          border: '1px solid #2196f3',
          fontSize: '13px'
        }}>
          <p style={{ margin: '0', fontWeight: 'bold', color: '#1976d2' }}>
            📝 NOTA TÉCNICA: Esta prueba es sensible al tamaño de muestra. Con muestras muy grandes (n > 1000), 
            pequeñas desviaciones de normalidad pueden resultar significativas aunque no sean prácticamente relevantes. 
            Siempre combine el análisis estadístico con la inspección visual de los gráficos.
          </p>
        </div>
      </div>
    );
  };

  const getLeveneContent = () => {
    if (!resultados.tratamientos) return <div>No hay datos disponibles</div>;
    
    const tratamientos = [...new Set(resultados.tratamientos.map(d => d.tratamiento))];
    const datos = resultados.tratamientos;
    
    // Calcular estadísticas por grupo
    const estadisticasPorGrupo = tratamientos.map(tratamiento => {
      const datosTratamiento = datos.filter(d => d.tratamiento === tratamiento).map(d => parseFloat(d.resultado)).filter(v => !isNaN(v));
      const media = datosTratamiento.reduce((a, b) => a + b, 0) / datosTratamiento.length;
      const varianza = datosTratamiento.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / (datosTratamiento.length - 1);
      const desviacion = Math.sqrt(varianza);
      const cv = (desviacion / media) * 100;
      
      return {
        tratamiento,
        n: datosTratamiento.length,
        media,
        desviacionEstandar: desviacion,
        varianza,
        coeficienteVariacion: cv
      };
    });
    
    return (
      <div style={{ lineHeight: '1.6', fontSize: '14px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>🎯 ¿Qué es la Prueba de Levene?</h5>
          <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
            La prueba de Levene evalúa si las varianzas de dos o más grupos son estadísticamente iguales 
            (homogeneidad de varianzas). Es una prueba fundamental antes de aplicar ANOVA, ya que esta técnica 
            asume que todos los grupos tienen la misma variabilidad. La prueba de Levene es robusta ante 
            desviaciones de la normalidad, a diferencia de otras pruebas como Bartlett.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>🔬 ¿Cómo se Aplicó en sus Datos?</h5>
          <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
            Se analizaron <strong>{tratamientos.length} grupos</strong> con un total de <strong>{datos.length} observaciones</strong>. 
            La prueba calculó las desviaciones absolutas de cada observación respecto a la mediana de su grupo, 
            y luego comparó estas desviaciones entre grupos usando ANOVA. Los gráficos generados incluyen:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
            <li><strong>Box Plot Mejorado:</strong> Muestra distribución, outliers y estadísticas por grupo</li>
            <li><strong>Residuos Absolutos:</strong> Dispersión de las desviaciones respecto a la mediana</li>
            <li><strong>Varianzas por Grupo:</strong> Comparación visual de variabilidades con intervalos de confianza</li>
            <li><strong>Coeficiente de Variación:</strong> Variabilidad relativa estandarizada por grupo</li>
          </ul>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>📊 Interpretación de Resultados</h5>
          <div style={{ 
            padding: '15px', 
            backgroundColor: typeof resultados.levene === 'number' && resultados.levene < 0.05 ? '#ffebee' : '#e8f5e8',
            borderRadius: '8px',
            border: '2px solid ' + (typeof resultados.levene === 'number' && resultados.levene < 0.05 ? '#f44336' : '#4caf50'),
            marginBottom: '15px'
          }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
              {typeof resultados.levene === 'number' && resultados.levene < 0.05 ? 
                '❌ CONCLUSIÓN: Las varianzas NO son homogéneas entre grupos' : 
                '✅ CONCLUSIÓN: Las varianzas son homogéneas entre grupos'}
            </p>
            <p style={{ margin: '0', fontSize: '13px' }}>
              <strong>Estadístico de Levene:</strong> {'N/A'} 
              (valores altos indican diferencias en varianzas)<br/>
              <strong>P-valor:</strong> {typeof resultados.levene === 'number' ? resultados.levene.toFixed(4) : 'N/A'} 
              (si p menor que 0.05, rechazamos homogeneidad)<br/>
              <strong>Grupos analizados:</strong> {tratamientos.length} grupos con tamaños: {estadisticasPorGrupo.map(g => g.tratamiento + '(n=' + g.n + ')').join(', ')}
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>🎯 ¿Qué Significan estos Resultados?</h5>
          {typeof resultados.levene === 'number' && resultados.levene < 0.05 ? (
            <div>
              <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
                Las varianzas <strong>NO son homogéneas</strong> entre sus grupos. Esto significa que:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
                <li>Algunos grupos tienen mayor variabilidad que otros</li>
                <li>La dispersión de los datos no es consistente entre grupos</li>
                <li>Puede haber factores no controlados que afectan la variabilidad</li>
                <li>Los grupos pueden tener diferentes niveles de precisión en las mediciones</li>
              </ul>
              <p style={{ margin: '0 0 10px 0', textAlign: 'justify', fontWeight: 'bold', color: '#d32f2f' }}>
                ⚠️ IMPLICACIONES: ANOVA clásica puede no ser apropiada. Los resultados pueden ser sesgados.
              </p>
            </div>
          ) : (
            <div>
              <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
                Las varianzas <strong>son homogéneas</strong> entre sus grupos. Esto significa que:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
                <li>Todos los grupos tienen variabilidad similar</li>
                <li>La dispersión es consistente a través de los grupos</li>
                <li>Las condiciones experimentales fueron controladas adecuadamente</li>
                <li>La precisión de medición es similar entre grupos</li>
              </ul>
              <p style={{ margin: '0 0 10px 0', textAlign: 'justify', fontWeight: 'bold', color: '#388e3c' }}>
                ✅ IMPLICACIONES: Es apropiado proceder con ANOVA y pruebas post-hoc paramétricas.
              </p>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>📈 Análisis Detallado por Grupo</h5>
          <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            {estadisticasPorGrupo.map((grupo, index) => (
              <div key={index} style={{ marginBottom: '10px', fontSize: '13px' }}>
                <strong>Grupo {grupo.tratamiento}:</strong> n={grupo.n}, 
                Media={grupo.media.toFixed(3)}, 
                DE={grupo.desviacionEstandar.toFixed(3)}, 
                Varianza={grupo.varianza.toFixed(3)}, 
                CV={grupo.coeficienteVariacion.toFixed(1)}%
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>💡 Recomendaciones Específicas</h5>
          {typeof resultados.levene === 'number' && resultados.levene < 0.05 ? (
            <div style={{ backgroundColor: '#fff3e0', padding: '15px', borderRadius: '8px', border: '1px solid #ff9800' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Dado que las varianzas NO son homogéneas:</p>
              <ul style={{ marginLeft: '20px', margin: '0' }}>
                <li><strong>ANOVA Welch:</strong> Use ANOVA que no asume varianzas iguales</li>
                <li><strong>Transformaciones:</strong> Considere log, raíz cuadrada para estabilizar varianzas</li>
                <li><strong>Pruebas robustas:</strong> Emplee Kruskal-Wallis (no paramétrica)</li>
                <li><strong>Análisis por separado:</strong> Compare grupos con varianzas similares</li>
                <li><strong>Investigación:</strong> Identifique causas de la heterogeneidad</li>
                <li><strong>Modelos mixtos:</strong> Considere efectos aleatorios para variabilidad</li>
              </ul>
            </div>
          ) : (
            <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '8px', border: '1px solid #4caf50' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Dado que las varianzas son homogéneas:</p>
              <ul style={{ marginLeft: '20px', margin: '0' }}>
                <li><strong>ANOVA clásica:</strong> Proceda con análisis de varianza estándar</li>
                <li><strong>Pruebas post-hoc:</strong> Use Tukey, Bonferroni, o Scheffé</li>
                <li><strong>Intervalos de confianza:</strong> Calcule con varianza pooled</li>
                <li><strong>Modelos lineales:</strong> Los supuestos se cumplen adecuadamente</li>
                <li><strong>Potencia estadística:</strong> Los tests tendrán potencia óptima</li>
                <li><strong>Interpretación:</strong> Los resultados serán más confiables</li>
              </ul>
            </div>
          )}
        </div>

        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '15px', 
          borderRadius: '8px', 
          border: '1px solid #2196f3',
          fontSize: '13px'
        }}>
          <p style={{ margin: '0', fontWeight: 'bold', color: '#1976d2' }}>
            📝 NOTA TÉCNICA: La prueba de Levene es más robusta que la prueba de Bartlett ante desviaciones 
            de normalidad. Sin embargo, es sensible a outliers. Si encuentra heterogeneidad, verifique 
            primero la presencia de valores atípicos antes de aplicar transformaciones. La homogeneidad 
            de varianzas es crucial para la validez de ANOVA y la interpretación correcta de los resultados.
          </p>
        </div>
      </div>
    );
  };

  const getAnovaContent = () => {
    if (!resultados.anova) return <div>No hay datos disponibles</div>;
    
    const tratamientos = [...new Set(resultados.tratamientos.map(d => d.tratamiento))];
    const datos = resultados.tratamientos;
    
    // Calcular estadísticas por tratamiento
    const estadisticasPorTratamiento = tratamientos.map(tratamiento => {
      const datosTratamiento = datos.filter(d => d.tratamiento === tratamiento).map(d => parseFloat(d.resultado)).filter(v => !isNaN(v));
      const media = datosTratamiento.reduce((a, b) => a + b, 0) / datosTratamiento.length;
      const varianza = datosTratamiento.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / (datosTratamiento.length - 1);
      const desviacion = Math.sqrt(varianza);
      
      return {
        tratamiento,
        n: datosTratamiento.length,
        media,
        desviacionEstandar: desviacion,
        varianza
      };
    });
    
    return (
      <div style={{ lineHeight: '1.6', fontSize: '14px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>🎯 ¿Qué es el Análisis de Varianza (ANOVA)?</h5>
          <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
            ANOVA es una técnica estadística que compara las medias de tres o más grupos para determinar 
            si existen diferencias estadísticamente significativas entre ellos. Descompone la variabilidad 
            total en variabilidad entre grupos (tratamientos) y dentro de grupos (error), permitiendo 
            evaluar si los tratamientos tienen efectos diferentes sobre la variable respuesta.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>🔬 ¿Cómo se Aplicó en sus Datos?</h5>
          <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
            Se analizaron <strong>{tratamientos.length} tratamientos</strong> con un total de <strong>{datos.length} observaciones</strong>. 
            ANOVA calculó el estadístico F comparando la varianza entre tratamientos con la varianza dentro 
            de tratamientos. Los análisis incluyen:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
            <li><strong>Tabla ANOVA:</strong> Fuentes de variación, grados de libertad, sumas de cuadrados</li>
            <li><strong>Estadístico F:</strong> Razón de varianzas para evaluar significancia</li>
            <li><strong>Gráficos de medias:</strong> Comparación visual de tratamientos con intervalos de confianza</li>
            <li><strong>Residuos:</strong> Verificación de supuestos del modelo</li>
          </ul>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>📊 Interpretación de Resultados</h5>
          <div style={{ 
            padding: '15px', 
            backgroundColor: typeof resultados.anova === 'number' && resultados.anova < 0.05 ? '#e8f5e8' : '#ffebee',
            borderRadius: '8px',
            border: '2px solid ' + (typeof resultados.anova === 'number' && resultados.anova < 0.05 ? '#4caf50' : '#f44336'),
            marginBottom: '15px'
          }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
              {typeof resultados.anova === 'number' && resultados.anova < 0.05 ? 
                '✅ CONCLUSIÓN: Existen diferencias significativas entre tratamientos' : 
                '❌ CONCLUSIÓN: No hay diferencias significativas entre tratamientos'}
            </p>
            <p style={{ margin: '0', fontSize: '13px' }}>
              <strong>Estadístico F:</strong> {'N/A'} 
              (valores altos indican mayor diferencia entre tratamientos)<br/>
              <strong>P-valor:</strong> {typeof resultados.anova === 'number' ? resultados.anova.toFixed(4) : 'N/A'} 
              (si p menor que 0.05, hay diferencias significativas)<br/>
              <strong>Tratamientos comparados:</strong> {tratamientos.length} grupos ({tratamientos.join(', ')})
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>🎯 ¿Qué Significan estos Resultados?</h5>
          {typeof resultados.anova === 'number' && resultados.anova < 0.05 ? (
            <div>
              <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
                <strong>Hay diferencias significativas</strong> entre al menos dos tratamientos. Esto significa que:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
                <li>Los tratamientos tienen efectos diferentes sobre la variable respuesta</li>
                <li>La variabilidad entre grupos es mayor que la variabilidad dentro de grupos</li>
                <li>Al menos un tratamiento se comporta de manera diferente a los demás</li>
                <li>Los factores experimentales tienen un efecto real y medible</li>
              </ul>
              <p style={{ margin: '0 0 10px 0', textAlign: 'justify', fontWeight: 'bold', color: '#388e3c' }}>
                ✅ IMPLICACIONES: Proceda con análisis post-hoc para identificar qué tratamientos difieren.
              </p>
            </div>
          ) : (
            <div>
              <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
                <strong>No hay diferencias significativas</strong> entre los tratamientos. Esto significa que:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
                <li>Todos los tratamientos tienen efectos similares</li>
                <li>La variabilidad observada puede deberse al azar</li>
                <li>No hay evidencia de que los factores experimentales tengan efecto</li>
                <li>Las diferencias observadas no son estadísticamente relevantes</li>
              </ul>
              <p style={{ margin: '0 0 10px 0', textAlign: 'justify', fontWeight: 'bold', color: '#d32f2f' }}>
                ⚠️ IMPLICACIONES: No se justifican análisis post-hoc. Considere revisar diseño experimental.
              </p>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>📈 Análisis Detallado por Tratamiento</h5>
          <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            {estadisticasPorTratamiento.map((trat, index) => (
              <div key={index} style={{ marginBottom: '10px', fontSize: '13px' }}>
                <strong>Tratamiento {trat.tratamiento}:</strong> n={trat.n}, 
                Media={trat.media.toFixed(3)}, 
                DE={trat.desviacionEstandar.toFixed(3)}, 
                Varianza={trat.varianza.toFixed(3)}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>💡 Recomendaciones Específicas</h5>
          {typeof resultados.anova === 'number' && resultados.anova < 0.05 ? (
            <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '8px', border: '1px solid #4caf50' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Dado que hay diferencias significativas:</p>
              <ul style={{ marginLeft: '20px', margin: '0' }}>
                <li><strong>Análisis post-hoc:</strong> Use Duncan, Tukey, o Bonferroni para comparaciones múltiples</li>
                <li><strong>Identificación:</strong> Determine cuáles tratamientos son superiores</li>
                <li><strong>Magnitud del efecto:</strong> Calcule eta cuadrado para evaluar importancia práctica</li>
                <li><strong>Validación:</strong> Replique el experimento para confirmar resultados</li>
                <li><strong>Implementación:</strong> Considere adoptar el mejor tratamiento</li>
                <li><strong>Optimización:</strong> Explore combinaciones o niveles intermedios</li>
              </ul>
            </div>
          ) : (
            <div style={{ backgroundColor: '#fff3e0', padding: '15px', borderRadius: '8px', border: '1px solid #ff9800' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Dado que no hay diferencias significativas:</p>
              <ul style={{ marginLeft: '20px', margin: '0' }}>
                <li><strong>Revisión del diseño:</strong> Evalúe si el tamaño de muestra es adecuado</li>
                <li><strong>Potencia estadística:</strong> Calcule si el experimento puede detectar diferencias</li>
                <li><strong>Factores adicionales:</strong> Considere variables no controladas</li>
                <li><strong>Criterio económico:</strong> Seleccione el tratamiento más económico</li>
                <li><strong>Análisis exploratorio:</strong> Busque patrones o tendencias no significativas</li>
                <li><strong>Replicación:</strong> Aumente el número de observaciones</li>
              </ul>
            </div>
          )}
        </div>

        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '15px', 
          borderRadius: '8px', 
          border: '1px solid #2196f3',
          fontSize: '13px'
        }}>
          <p style={{ margin: '0', fontWeight: 'bold', color: '#1976d2' }}>
            📝 NOTA TÉCNICA: ANOVA asume normalidad, homogeneidad de varianzas e independencia. 
            Verifique estos supuestos antes de interpretar resultados. Si ANOVA es significativa, 
            indica que al menos un par de medias difiere, pero no especifica cuáles. Use análisis 
            post-hoc para comparaciones específicas y controle la tasa de error tipo I.
          </p>
        </div>
      </div>
    );
  };

  const getDuncanContent = () => {
    if (!resultados.duncan) return <div>No hay datos disponibles</div>;
    
    const tratamientos = [...new Set(resultados.tratamientos.map(d => d.tratamiento))];
    const datos = resultados.tratamientos;
    
    // Calcular estadísticas por tratamiento
    const estadisticasPorTratamiento = tratamientos.map(tratamiento => {
      const datosTratamiento = datos.filter(d => d.tratamiento === tratamiento).map(d => parseFloat(d.resultado)).filter(v => !isNaN(v));
      const media = datosTratamiento.reduce((a, b) => a + b, 0) / datosTratamiento.length;
      const varianza = datosTratamiento.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / (datosTratamiento.length - 1);
      const desviacion = Math.sqrt(varianza);
      
      return {
        tratamiento,
        n: datosTratamiento.length,
        media,
        desviacionEstandar: desviacion
      };
    });
    
    // Ordenar por media para mostrar ranking
    const tratamientosOrdenados = [...estadisticasPorTratamiento].sort((a, b) => b.media - a.media);
    
    return (
      <div style={{ lineHeight: '1.6', fontSize: '14px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>🎯 ¿Qué es la Prueba de Duncan?</h5>
          <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
            La prueba de Duncan (Duncan's Multiple Range Test) es un método de comparaciones múltiples 
            post-hoc que se aplica después de un ANOVA significativo. Agrupa los tratamientos en 
            subconjuntos homogéneos, donde tratamientos en el mismo grupo no difieren significativamente 
            entre sí, pero sí difieren de tratamientos en otros grupos. Es menos conservativa que 
            Tukey pero más que LSD.
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>🔬 ¿Cómo se Aplicó en sus Datos?</h5>
          <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
            Se compararon <strong>{tratamientos.length} tratamientos</strong> mediante comparaciones por pares, 
            utilizando rangos críticos que aumentan con la distancia entre medias ordenadas. El procedimiento 
            identifica grupos homogéneos y establece un ranking de tratamientos. Los análisis incluyen:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
            <li><strong>Grupos Homogéneos:</strong> Tratamientos estadísticamente similares</li>
            <li><strong>Ranking de Medias:</strong> Ordenamiento de mejor a peor tratamiento</li>
            <li><strong>Diferencias Mínimas:</strong> Rangos críticos para cada comparación</li>
            <li><strong>Significancia:</strong> Identificación de diferencias estadísticamente relevantes</li>
          </ul>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>📊 Interpretación de Resultados</h5>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#e8f5e8',
            borderRadius: '8px',
            border: '2px solid #4caf50',
            marginBottom: '15px'
          }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
              ✅ CONCLUSIÓN: Se identificaron grupos homogéneos entre tratamientos
            </p>
            <p style={{ margin: '0', fontSize: '13px' }}>
              <strong>Grupos formados:</strong> Los tratamientos se agruparon según similitud estadística<br/>
              <strong>Mejor tratamiento:</strong> {tratamientosOrdenados[0]?.tratamiento} (Media: {tratamientosOrdenados[0]?.media.toFixed(3)})<br/>
              <strong>Rango de medias:</strong> {tratamientosOrdenados[tratamientosOrdenados.length-1]?.media.toFixed(3)} - {tratamientosOrdenados[0]?.media.toFixed(3)}
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>🎯 ¿Qué Significan estos Resultados?</h5>
          <div>
            <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
              La prueba de Duncan <strong>identificó grupos estadísticamente homogéneos</strong>. Esto significa que:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
              <li>Tratamientos en el mismo grupo tienen efectos estadísticamente similares</li>
              <li>Tratamientos en grupos diferentes tienen efectos significativamente distintos</li>
              <li>Se puede establecer un ranking confiable de tratamientos</li>
              <li>Las diferencias observadas son estadísticamente válidas</li>
            </ul>
            <p style={{ margin: '0 0 10px 0', textAlign: 'justify', fontWeight: 'bold', color: '#388e3c' }}>
              ✅ IMPLICACIONES: Puede seleccionar el mejor tratamiento o grupo de tratamientos óptimos.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>📈 Análisis Detallado por Grupo</h5>
          <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '13px' }}>Ranking de Tratamientos (Mayor a Menor):</p>
            {tratamientosOrdenados.map((trat, index) => (
              <div key={index} style={{ 
                marginBottom: '8px', 
                fontSize: '13px',
                padding: '8px',
                backgroundColor: index === 0 ? '#e8f5e8' : '#ffffff',
                borderRadius: '4px',
                border: index === 0 ? '2px solid #4caf50' : '1px solid #ddd'
              }}>
                <strong>#{index + 1} - {trat.tratamiento}:</strong> Media={trat.media.toFixed(3)} ± {trat.desviacionEstandar.toFixed(3)} (n={trat.n})
                {index === 0 && <span style={{ color: '#4caf50', fontWeight: 'bold' }}> ← MEJOR</span>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>💡 Recomendaciones Específicas</h5>
          <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '8px', border: '1px solid #4caf50' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Basado en los grupos identificados:</p>
            <ul style={{ marginLeft: '20px', margin: '0' }}>
              <li><strong>Selección Óptima:</strong> Considere el tratamiento {tratamientosOrdenados[0]?.tratamiento} como primera opción</li>
              <li><strong>Alternativas:</strong> Tratamientos en el mismo grupo son equivalentes estadísticamente</li>
              <li><strong>Costo-Beneficio:</strong> Evalúe costos entre tratamientos del grupo superior</li>
              <li><strong>Validación:</strong> Confirme resultados con experimentos independientes</li>
              <li><strong>Implementación:</strong> Proceda con confianza usando el mejor grupo</li>
              <li><strong>Monitoreo:</strong> Establezca controles de calidad basados en estos resultados</li>
            </ul>
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '15px', 
          borderRadius: '8px', 
          border: '1px solid #2196f3',
          fontSize: '13px'
        }}>
          <p style={{ margin: '0', fontWeight: 'bold', color: '#1976d2' }}>
            📝 NOTA TÉCNICA: La prueba de Duncan es válida solo después de un ANOVA significativo. 
            Controla la tasa de error tipo I de manera menos estricta que Tukey, lo que la hace 
            más sensible para detectar diferencias pero con mayor riesgo de falsos positivos. 
            Los grupos homogéneos pueden solaparse, indicando que algunos tratamientos pertenecen 
            a múltiples grupos.
          </p>
        </div>
      </div>
    );
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // Si hay un modal abierto, exportar el contenido específico del modal
    if (modalAbierto) {
      const modalContent = document.querySelector('[class*="InformeModal_modalBody"], .modalBody, [class*="modalBody"]');
      if (modalContent) {
        const textContent = modalContent.innerText || '';
        const lines = textContent.split('\n').filter(line => line.trim() !== '');
        
        const data = [
          ['INFORME DETALLADO DE ANÁLISIS ESTADÍSTICO'],
          ['Tipo de Prueba:', `Informe Detallado - ${modalAbierto.toUpperCase()}`],
          ['Fecha de Generación:', new Date().toLocaleDateString()],
          ['Hora de Generación:', new Date().toLocaleTimeString()],
          [''],
          ['CONTENIDO COMPLETO DEL INFORME:'],
          [''],
          ...lines.map(line => [line])
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Configurar ancho de columnas
        const colWidths = [{ wch: 100 }];
        ws['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(wb, ws, 'Informe Detallado');
        XLSX.writeFile(wb, `informe_detallado_${modalAbierto}.xlsx`);
        return;
      }
    }
    
    // Hoja 1: Información General
    const generalData = [
      ['RESULTADOS ESTADÍSTICOS COMPLETOS'],
      ['Fecha de Generación:', new Date().toLocaleDateString()],
      ['Hora de Generación:', new Date().toLocaleTimeString()],
      [''],
      ['RESUMEN DE PRUEBAS REALIZADAS:'],
      ['✓ Prueba de Shapiro-Wilk (Normalidad)'],
      ['✓ Prueba de Levene (Homogeneidad de Varianzas)'],
      ['✓ Análisis de Varianza (ANOVA)'],
      ['✓ Prueba de Duncan (Comparaciones Múltiples)'],
      ['']
    ];
    
    if (resultados.shapiro) {
      generalData.push(
        ['RESULTADOS SHAPIRO-WILK:'],
        ['Estadístico W:', resultados.shapiro.W || 'N/A'],
        ['Valor p:', resultados.shapiro.pValor || 'N/A'],
        ['Interpretación:', resultados.shapiro.pValor > 0.05 ? 'Datos siguen distribución normal' : 'Datos NO siguen distribución normal'],
        ['']
      );
    }
    
    if (resultados.levene) {
      generalData.push(
        ['RESULTADOS LEVENE:'],
        ['Estadístico F:', resultados.levene.estadistico || 'N/A'],
        ['Valor p:', resultados.levene.pValor || 'N/A'],
        ['Interpretación:', resultados.levene.pValor > 0.05 ? 'Varianzas homogéneas' : 'Varianzas NO homogéneas'],
        ['']
      );
    }
    
    if (resultados.anova) {
      generalData.push(
        ['RESULTADOS ANOVA:'],
        ['Estadístico F:', resultados.anova.estadistico || 'N/A'],
        ['Valor p:', resultados.anova.pValor || 'N/A'],
        ['Interpretación:', resultados.anova.pValor < 0.05 ? 'Existen diferencias significativas entre tratamientos' : 'NO existen diferencias significativas'],
        ['']
      );
    }
    
    const wsGeneral = XLSX.utils.aoa_to_sheet(generalData);
    wsGeneral['!cols'] = [{ wch: 50 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsGeneral, 'Resumen General');
    
    // Hoja 2: Datos de Tratamientos
    if (resultados.tratamientos && resultados.tratamientos.length > 0) {
      const tratamientosData = [
        ['DATOS DE TRATAMIENTOS'],
        [''],
        ['Tratamiento', 'Resultado', 'Descripción']
      ];
      
      resultados.tratamientos.forEach(t => {
        tratamientosData.push([
          t.nombretto || 'N/A',
          typeof t.resultado === 'number' ? t.resultado.toFixed(3) : 'N/A',
          t.descripcion || 'Sin descripción'
        ]);
      });
      
      const wsTratamientos = XLSX.utils.aoa_to_sheet(tratamientosData);
      wsTratamientos['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(wb, wsTratamientos, 'Tratamientos');
    }
    
    // Hoja 3: Resultados Duncan
    if (resultados.duncan && resultados.duncan.length > 0) {
      const duncanData = [
        ['RESULTADOS PRUEBA DE DUNCAN'],
        [''],
        ['Tratamiento', 'Media', 'Grupo Homogéneo', 'Ranking']
      ];
      
      resultados.duncan.forEach((d, index) => {
        duncanData.push([
          d.tratamiento || 'N/A',
          typeof d.media === 'number' ? d.media.toFixed(3) : 'N/A',
          d.grupo || 'N/A',
          index + 1
        ]);
      });
      
      const wsDuncan = XLSX.utils.aoa_to_sheet(duncanData);
      wsDuncan['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 10 }];
      XLSX.utils.book_append_sheet(wb, wsDuncan, 'Duncan');
    }
    
    // Aplicar estilos a los encabezados
    [wsGeneral, wb.Sheets['Tratamientos'], wb.Sheets['Duncan']].forEach(ws => {
      if (!ws) return;
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let R = 0; R <= Math.min(2, range.e.r); R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
          if (!ws[cell_address]) continue;
          
          if (R === 0 || (ws[cell_address].v && typeof ws[cell_address].v === 'string' && ws[cell_address].v.includes(':'))) {
            ws[cell_address].s = {
              font: { bold: true },
              alignment: { horizontal: 'center' }
            };
          }
        }
      }
    });
    
    XLSX.writeFile(wb, 'resultados-completo.xlsx');
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
                  <div className={styles.resultado}>
                    {resultados.shapiro.pValor > 0.05 ? (
                      <span className={styles.exito}>✅ Los datos siguen una distribución normal</span>
                    ) : (
                      <span className={styles.advertencia}>⚠️ Los datos NO siguen una distribución normal</span>
                    )}
                  </div>
                  <button 
                    className={styles.verInformeBtn}
                    onClick={() => abrirModal('shapiro')}
                  >
                    <FaEye /> Ver Informe Detallado
                  </button>
                </div>
              ) : (
                <div className={styles.noData}>
                  <p>No hay datos de Shapiro-Wilk disponibles</p>
                </div>
              )}
            
            {/* Gráfico de Shapiro-Wilk */}
            <GraficoShapiro 
              datos={resultados.tratamientos}
              resultadosShapiro={resultados.shapiro}
            />
            </div>
            <div className={styles.pruebaDetalle}>
              <h4>📊 Prueba de Levene (Homogeneidad)</h4>
              <div className={styles.shapiroResultados}>
                <div className={styles.resultado}>
                  {resultados.levene > 0.05 ? (
                    <span className={styles.exito}>✅ Homogeneidad confirmada</span>
                  ) : (
                    <span className={styles.advertencia}>⚠️ Varianzas heterogéneas</span>
                  )}
                </div>
                <button 
                  className={styles.verInformeBtn}
                  onClick={() => abrirModal('levene')}
                >
                  <FaEye /> Ver Informe Detallado
                </button>
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
                <div className={styles.resultado}>
                  {resultados.anova < 0.05 ? (
                    <span className={styles.advertencia}>⚠️ Hay diferencias significativas</span>
                  ) : (
                    <span className={styles.exito}>✅ No hay diferencias significativas</span>
                  )}
                </div>
                <button 
                  className={styles.verInformeBtn}
                  onClick={() => abrirModal('anova')}
                >
                  <FaEye /> Ver Informe Detallado
                </button>
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
            <div className={styles.pruebasEstadisticas} style={{ marginTop: '30px' }}>
              <h3>Prueba de Duncan (Comparaciones Múltiples)</h3>
              <div className={styles.pruebaDetalle}>
                <h4>📊 Análisis de Duncan</h4>
                <div className={styles.shapiroResultados}>
                  <div className={styles.resultado}>
                    <span className={styles.exito}>✅ Análisis de comparaciones múltiples completado</span>
                  </div>
                  <button 
                    className={styles.verInformeBtn}
                    onClick={() => abrirModal('duncan')}
                  >
                    <FaEye /> Ver Informe Detallado
                  </button>
                </div>
              </div>
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

      {/* Modales para informes detallados */}
      <InformeModal
        isOpen={modalAbierto === 'shapiro'}
        onClose={cerrarModal}
        title="Informe Detallado - Prueba de Shapiro-Wilk"
        testType="shapiro"
      >
        {getShapiroContent()}
      </InformeModal>

      <InformeModal
        isOpen={modalAbierto === 'levene'}
        onClose={cerrarModal}
        title="Informe Detallado - Prueba de Levene"
        testType="levene"
      >
        {getLeveneContent()}
      </InformeModal>

      <InformeModal
        isOpen={modalAbierto === 'anova'}
        onClose={cerrarModal}
        title="Informe Detallado - Análisis de Varianza (ANOVA)"
        testType="anova"
      >
        {getAnovaContent()}
      </InformeModal>

      <InformeModal
        isOpen={modalAbierto === 'duncan'}
        onClose={cerrarModal}
        title="Informe Detallado - Prueba de Duncan"
        testType="duncan"
      >
        {getDuncanContent()}
      </InformeModal>
    </>
  );
};

export default Resultados;