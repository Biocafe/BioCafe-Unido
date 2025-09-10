import React from 'react';
import Plot from 'react-plotly.js';
import styles from '../styles/GraficosEstadisticos.module.css';

const GraficoLevene = ({ datos, resultadosLevene }) => {
  if (!datos || !resultadosLevene) {
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

  // Calcular estadísticas por grupo
  const estadisticasPorGrupo = tratamientos.map(tratamiento => {
    const valores = datosPorTratamiento[tratamiento];
    const n = valores.length;
    const media = valores.reduce((sum, val) => sum + val, 0) / n;
    const varianza = valores.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / (n - 1);
    const desviacionEstandar = Math.sqrt(varianza);
    const coeficienteVariacion = (desviacionEstandar / media) * 100;
    
    // Calcular residuos absolutos desde la mediana (para Levene)
    const mediana = [...valores].sort((a, b) => a - b)[Math.floor(n / 2)];
    const residuosAbsolutos = valores.map(val => Math.abs(val - mediana));
    
    return {
      tratamiento,
      valores,
      n,
      media,
      mediana,
      varianza,
      desviacionEstandar,
      coeficienteVariacion,
      residuosAbsolutos
    };
  });

  // Preparar datos para gráfico de dispersión de residuos
  const datosResiduos = [];
  const coloresGrupos = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#1ABC9C', '#E67E22', '#34495E'];
  
  estadisticasPorGrupo.forEach((grupo, index) => {
    grupo.residuosAbsolutos.forEach((residuo, i) => {
      datosResiduos.push({
        x: grupo.valores[i],
        y: residuo,
        tratamiento: grupo.tratamiento,
        color: coloresGrupos[index % coloresGrupos.length]
      });
    });
  });

  // Calcular intervalos de confianza para varianzas (aproximación)
  const varianzasConIC = estadisticasPorGrupo.map(grupo => {
    const chi2_lower = grupo.n - 1; // Aproximación simple
    const chi2_upper = grupo.n - 1;
    const ic_lower = (grupo.n - 1) * grupo.varianza / (chi2_upper + 1.96 * Math.sqrt(2 * (grupo.n - 1)));
    const ic_upper = (grupo.n - 1) * grupo.varianza / (chi2_lower - 1.96 * Math.sqrt(2 * (grupo.n - 1)));
    
    return {
      tratamiento: grupo.tratamiento,
      varianza: grupo.varianza,
      ic_lower: Math.max(0, ic_lower),
      ic_upper: ic_upper,
      cv: grupo.coeficienteVariacion
    };
  });

  return (
    <div className={styles.graficosContainer}>
      <h4>Análisis de Homogeneidad de Varianzas - Prueba de Levene</h4>
      
      <div className={styles.graficosGrid}>
        {/* Box Plot Mejorado con Estadísticas */}
        <div className={styles.graficoIndividual}>
          <h5>Box Plot Comparativo con Estadísticas</h5>
          <Plot
            data={tratamientos.map((tratamiento, index) => ({
              y: datosPorTratamiento[tratamiento],
              type: 'box',
              name: tratamiento + ' (CV: ' + estadisticasPorGrupo[index].coeficienteVariacion.toFixed(1) + '%)',
              marker: { 
                color: coloresGrupos[index % coloresGrupos.length],
                line: { color: '#2C3E50', width: 1 }
              },
              boxpoints: 'outliers',
              jitter: 0.3,
              pointpos: -1.8,
              boxmean: 'sd'
            }))}
            layout={{
              title: 'Distribución y Variabilidad por Tratamiento',
              xaxis: { title: 'Tratamientos' },
              yaxis: { title: 'Valores' },
              width: 500,
              height: 400,
              margin: { l: 60, r: 50, t: 80, b: 120 },
              showlegend: true,
              legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(255,255,255,0.8)' }
            }}
          />
        </div>

        {/* Gráfico de Dispersión de Residuos Absolutos */}
        <div className={styles.graficoIndividual}>
          <h5>Residuos Absolutos vs Valores Predichos</h5>
          <Plot
            data={tratamientos.map((tratamiento, index) => {
              const grupoData = datosResiduos.filter(d => d.tratamiento === tratamiento);
              return {
                x: grupoData.map(d => d.x),
                y: grupoData.map(d => d.y),
                mode: 'markers',
                type: 'scatter',
                name: tratamiento,
                marker: {
                  color: coloresGrupos[index % coloresGrupos.length],
                  size: 8,
                  opacity: 0.7,
                  line: { color: '#2C3E50', width: 1 }
                }
              };
            })}
            layout={{
              title: 'Análisis de Residuos para Homogeneidad',
              xaxis: { title: 'Valores Observados' },
              yaxis: { title: 'Residuos Absolutos desde la Mediana' },
              width: 500,
              height: 400,
              margin: { l: 60, r: 50, t: 80, b: 60 },
              showlegend: true,
              legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(255,255,255,0.8)' }
            }}
          />
        </div>

        {/* Gráfico de Varianzas con Intervalos de Confianza */}
        <div className={styles.graficoIndividual}>
          <h5>Varianzas por Grupo con Intervalos de Confianza</h5>
          <Plot
            data={[
              {
                x: varianzasConIC.map(v => v.tratamiento),
                y: varianzasConIC.map(v => v.varianza),
                error_y: {
                  type: 'data',
                  symmetric: false,
                  array: varianzasConIC.map(v => v.ic_upper - v.varianza),
                  arrayminus: varianzasConIC.map(v => v.varianza - v.ic_lower),
                  visible: true,
                  color: '#E74C3C',
                  thickness: 2
                },
                type: 'scatter',
                mode: 'markers',
                name: 'Varianzas',
                marker: {
                  size: 12,
                  color: varianzasConIC.map((_, i) => coloresGrupos[i % coloresGrupos.length]),
                  line: { color: '#2C3E50', width: 2 }
                }
              },
              {
                x: varianzasConIC.map(v => v.tratamiento),
                y: Array(varianzasConIC.length).fill(varianzasConIC.reduce((sum, v) => sum + v.varianza, 0) / varianzasConIC.length),
                mode: 'lines',
                type: 'scatter',
                name: 'Varianza promedio',
                line: { color: '#95A5A6', width: 2, dash: 'dash' }
              }
            ]}
            layout={{
              title: 'Comparación de Varianzas entre Grupos',
              xaxis: { title: 'Tratamientos' },
              yaxis: { title: 'Varianza ± IC 95%' },
              width: 500,
              height: 400,
              margin: { l: 60, r: 50, t: 80, b: 100 },
              showlegend: true,
              legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(255,255,255,0.8)' }
            }}
          />
        </div>

        {/* Gráfico de Coeficientes de Variación */}
        <div className={styles.graficoIndividual}>
          <h5>Coeficientes de Variación por Grupo</h5>
          <Plot
            data={[
              {
                x: estadisticasPorGrupo.map(g => g.tratamiento),
                y: estadisticasPorGrupo.map(g => g.coeficienteVariacion),
                type: 'bar',
                name: 'Coeficiente de Variación (%)',
                marker: {
                  color: estadisticasPorGrupo.map((_, i) => coloresGrupos[i % coloresGrupos.length]),
                  opacity: 0.8,
                  line: { color: '#2C3E50', width: 1 }
                },
                text: estadisticasPorGrupo.map(g => g.coeficienteVariacion.toFixed(1) + '%'),
                textposition: 'auto'
              },
              {
                x: estadisticasPorGrupo.map(g => g.tratamiento),
                y: Array(estadisticasPorGrupo.length).fill(30),
                mode: 'lines',
                type: 'scatter',
                name: 'Límite recomendado (30%)',
                line: { color: '#E74C3C', width: 2, dash: 'dash' }
              }
            ]}
            layout={{
              title: 'Variabilidad Relativa por Grupo',
              xaxis: { title: 'Tratamientos' },
              yaxis: { title: 'Coeficiente de Variación (%)' },
              width: 500,
              height: 400,
              margin: { l: 60, r: 50, t: 80, b: 100 },
              showlegend: true,
              legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(255,255,255,0.8)' }
            }}
          />
        </div>
      </div>


    </div>
  );
};

export default GraficoLevene;