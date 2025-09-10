import React from 'react';
import Plot from 'react-plotly.js';
import styles from '../styles/GraficosEstadisticos.module.css';

const GraficoAnova = ({ datos, resultadosAnova }) => {
  if (!datos || !resultadosAnova) {
    return null;
  }

  // Agrupar datos por tratamiento
  const datosPorTratamiento = {};
  datos.forEach(item => {
    const tratamiento = item.tratamiento || 'Sin tratamiento';
    if (!datosPorTratamiento[tratamiento]) {
      datosPorTratamiento[tratamiento] = [];
    }
    const valor = parseFloat(item.resultado);
    if (!isNaN(valor)) {
      datosPorTratamiento[tratamiento].push(valor);
    }
  });

  const tratamientos = Object.keys(datosPorTratamiento);
  if (tratamientos.length === 0) {
    return null;
  }

  // Calcular medias y errores estándar
  const medias = tratamientos.map(tratamiento => {
    const valores = datosPorTratamiento[tratamiento];
    const media = valores.reduce((sum, val) => sum + val, 0) / valores.length;
    const varianza = valores.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / (valores.length - 1);
    const errorEstandar = Math.sqrt(varianza / valores.length);
    return {
      tratamiento,
      media,
      errorEstandar,
      n: valores.length
    };
  });

  return (
    <div className={styles.graficosContainer}>
      <h4>Gráficos de Análisis de Varianza (ANOVA)</h4>
      
      <div className={styles.graficosGrid}>
        {/* Box Plot comparativo */}
        <div className={styles.graficoIndividual}>
          <h5>Box Plot Comparativo</h5>
          <Plot
            data={tratamientos.map((tratamiento, index) => ({
              y: datosPorTratamiento[tratamiento],
              type: 'box',
              name: tratamiento,
              marker: { color: `hsl(${index * 360 / tratamientos.length}, 70%, 50%)` }
            }))}
            layout={{
              title: 'Comparación entre Tratamientos',
              xaxis: { title: 'Tratamientos' },
              yaxis: { title: 'Valores' },
              width: 400,
              height: 300,
              margin: { l: 50, r: 50, t: 50, b: 100 }
            }}
          />
        </div>

        {/* Gráfico de medias con intervalos de confianza */}
        <div className={styles.graficoIndividual}>
          <h5>Medias con Intervalos de Confianza</h5>
          <Plot
            data={[
              {
                x: medias.map(m => m.tratamiento),
                y: medias.map(m => m.media),
                error_y: {
                  type: 'data',
                  array: medias.map(m => m.errorEstandar * 1.96), // IC 95%
                  visible: true
                },
                type: 'scatter',
                mode: 'markers+lines',
                name: 'Medias',
                marker: { size: 10, color: '#FF6B6B' },
                line: { color: '#FF6B6B' }
              }
            ]}
            layout={{
              title: 'Medias por Tratamiento',
              xaxis: { title: 'Tratamientos' },
              yaxis: { title: 'Media ± IC 95%' },
              width: 400,
              height: 300,
              margin: { l: 50, r: 50, t: 50, b: 100 }
            }}
          />
        </div>
      </div>


    </div>
  );
};

export default GraficoAnova;