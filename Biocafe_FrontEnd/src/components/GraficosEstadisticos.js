import React from 'react';
import Plot from 'react-plotly.js';
import styles from '../styles/GraficosEstadisticos.module.css';

const GraficosEstadisticos = ({ datos, resultadosShapiro, resultadosLevene, resultadosAnova }) => {
  if (!datos) return null;

  // Extraer valores numéricos de los tratamientos
  const valores = datos.map(d => Number(d.resultado || d.valortto || 0));
  const tratamientos = datos.map(d => d.tratamiento || d.nombretto);

  return (
    <div className={styles.graficosContainer}>
      <h3>Gráficos Estadísticos Interpretativos</h3>
      
      {/* Sección Shapiro-Wilk */}
      {resultadosShapiro && (
        <div className={styles.seccionGraficos}>
          <div className={styles.tituloSeccion}>Prueba de Shapiro-Wilk - Normalidad</div>
          <div className={styles.graficosGrid}>
            
            {/* Histograma con curva normal */}
            <div className={styles.graficoContainer}>
              <h4>Histograma de Datos</h4>
              <Plot
                data={[
                  {
                    x: valores,
                    type: 'histogram',
                    name: 'Datos observados',
                    opacity: 0.7,
                    marker: { color: '#ECB176' }
                  }
                ]}
                layout={{
                  width: 500,
                  height: 350,
                  title: 'Distribución de los Datos',
                  xaxis: { title: 'Valores' },
                  yaxis: { title: 'Frecuencia' },
                  showlegend: false
                }}
              />
              <div className={styles.interpretacion}>
                 <strong>W = {typeof resultadosShapiro.W === 'number' ? resultadosShapiro.W.toFixed(4) : 'N/A'}, p-valor = {typeof resultadosShapiro.pValor === 'number' ? resultadosShapiro.pValor.toFixed(4) : 'N/A'}</strong><br/>
                 {typeof resultadosShapiro.pValor === 'number' && resultadosShapiro.pValor > 0.05 ? 
                   'Los datos siguen una distribución normal (p > 0.05)' : 
                   'Los datos NO siguen una distribución normal (p ≤ 0.05)'}
               </div>
            </div>
            
            {/* Q-Q Plot simplificado */}
            <div className={styles.graficoContainer}>
              <h4>Gráfico Q-Q</h4>
              <Plot
                data={[
                  {
                    x: valores.sort((a,b) => a-b),
                    y: valores.sort((a,b) => a-b),
                    mode: 'markers',
                    type: 'scatter',
                    name: 'Datos vs Normal',
                    marker: { color: '#6F4E37', size: 8 }
                  },
                  {
                    x: [Math.min(...valores), Math.max(...valores)],
                    y: [Math.min(...valores), Math.max(...valores)],
                    mode: 'lines',
                    type: 'scatter',
                    name: 'Línea de referencia',
                    line: { color: 'red', dash: 'dash' }
                  }
                ]}
                layout={{
                  width: 500,
                  height: 350,
                  title: 'Q-Q Plot (Cuantiles)',
                  xaxis: { title: 'Cuantiles Observados' },
                  yaxis: { title: 'Cuantiles Teóricos' },
                  showlegend: false
                }}
              />
              <div className={styles.interpretacion}>
                <strong>Interpretación:</strong> Si los puntos siguen la línea roja, los datos son normales.
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Sección Levene */}
      {resultadosLevene && (
        <div className={styles.seccionGraficos}>
          <div className={styles.tituloSeccion}>Prueba de Levene - Homogeneidad de Varianzas</div>
          <div className={styles.graficosGrid}>
            
            {/* Boxplot por grupos */}
            <div className={styles.graficoContainer}>
              <h4>Boxplot por Tratamientos</h4>
              <Plot
                data={[
                  {
                    x: tratamientos,
                    y: valores,
                    type: 'box',
                    boxpoints: 'all',
                    name: 'Distribución por grupo',
                    marker: { color: '#ECB176' }
                  }
                ]}
                layout={{
                  width: 500,
                  height: 350,
                  title: 'Variabilidad por Tratamiento',
                  xaxis: { title: 'Tratamientos' },
                  yaxis: { title: 'Valores' },
                  showlegend: false
                }}
              />
              <div className={styles.interpretacion}>
                 <strong>p-valor = {typeof resultadosLevene.pValor === 'number' ? resultadosLevene.pValor.toFixed(4) : 'N/A'}</strong><br/>
                 {typeof resultadosLevene.pValor === 'number' && resultadosLevene.pValor > 0.05 ? 
                   'Las varianzas son homogéneas entre grupos (p > 0.05)' : 
                   'Las varianzas NO son homogéneas entre grupos (p ≤ 0.05)'}
               </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Sección ANOVA */}
      {resultadosAnova && (
        <div className={styles.seccionGraficos}>
          <div className={styles.tituloSeccion}>ANOVA - Análisis de Varianza</div>
          <div className={styles.graficosGrid}>
            
            {/* Gráfico de medias */}
            <div className={styles.graficoContainer}>
              <h4>Medias por Tratamiento</h4>
              <Plot
                data={[
                  {
                    x: [...new Set(tratamientos)],
                    y: [...new Set(tratamientos)].map(t => {
                      const valoresTrat = valores.filter((v, i) => tratamientos[i] === t);
                      return valoresTrat.reduce((a, b) => a + b, 0) / valoresTrat.length;
                    }),
                    type: 'bar',
                    name: 'Medias',
                    marker: { color: '#6F4E37' }
                  }
                ]}
                layout={{
                  width: 500,
                  height: 350,
                  title: 'Comparación de Medias',
                  xaxis: { title: 'Tratamientos' },
                  yaxis: { title: 'Media' },
                  showlegend: false
                }}
              />
              <div className={styles.interpretacion}>
                 <strong>F = {typeof resultadosAnova.F === 'number' ? resultadosAnova.F.toFixed(4) : 'N/A'}, p-valor = {typeof resultadosAnova.pValor === 'number' ? resultadosAnova.pValor.toFixed(4) : 'N/A'}</strong><br/>
                 {typeof resultadosAnova.pValor === 'number' && resultadosAnova.pValor < 0.05 ? 
                   'Existen diferencias significativas entre tratamientos (p < 0.05)' : 
                   'NO existen diferencias significativas entre tratamientos (p ≥ 0.05)'}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraficosEstadisticos;