import React from 'react';
import Plot from 'react-plotly.js';
import styles from '../styles/GraficosEstadisticos.module.css';

const GraficoDuncan = ({ datos, resultadosDuncan }) => {
  if (!datos || !resultadosDuncan || !Array.isArray(resultadosDuncan) || resultadosDuncan.length === 0) {
    return (
      <div className={styles.graficosContainer}>
        <h4>Análisis Post-hoc - Prueba de Duncan</h4>
        <div className={styles.noData}>
          <p>No se pudieron obtener los resultados de la prueba de Duncan.</p>
          <p>Asegúrese de que ANOVA sea significativa antes de realizar análisis post-hoc.</p>
        </div>
      </div>
    );
  }

  // Procesar datos de Duncan
  const tratamientos = resultadosDuncan.map(d => d.tratamiento);
  const medias = resultadosDuncan.map(d => typeof d.media === 'number' ? d.media : 0);
  const grupos = resultadosDuncan.map(d => d.grupo || 'N/A');

  // Crear colores únicos para cada grupo
  const gruposUnicos = [...new Set(grupos)];
  const coloresGrupos = {
    'A': '#2ecc71',  // Verde para el mejor grupo
    'B': '#3498db', 
    'C': '#e74c3c',  // Rojo movido al grupo C
    'D': '#f39c12',
    'E': '#9b59b6',
    'F': '#1abc9c',
    'G': '#34495e',
    'H': '#e67e22'
  };



  // Ordenar por media (descendente)
  const datosOrdenados = resultadosDuncan
    .map((item, index) => ({ ...item, index }))
    .sort((a, b) => (b.media || 0) - (a.media || 0));

  return (
    <div className={styles.graficosContainer}>
      <h4>Análisis Post-hoc - Prueba de Duncan</h4>
      
      <div className={styles.graficosGrid}>
        {/* Gráfico de Barras con Grupos */}
        <div className={styles.graficoIndividual}>
          <h5>Medias por Tratamiento (Grupos Duncan)</h5>
          <Plot
            data={[
              {
                x: datosOrdenados.map(d => d.tratamiento),
                y: datosOrdenados.map(d => d.media || 0),
                type: 'bar',
                name: 'Media por tratamiento',
                marker: {
                  color: datosOrdenados.map(d => coloresGrupos[d.grupo] || '#95a5a6'),
                  line: { color: '#2c3e50', width: 1 }
                },
                text: datosOrdenados.map(d => `Grupo ${d.grupo}`),
                textposition: 'outside',
                textfont: { size: 12, color: '#2c3e50' }
              }
            ]}
            layout={{
              title: 'Comparación de Medias - Grupos Homogéneos',
              xaxis: { 
                title: 'Tratamientos',
                tickangle: -45
              },
              yaxis: { title: 'Media' },
              width: 500,
              height: 400,
              margin: { l: 60, r: 50, t: 80, b: 100 },
              showlegend: false
            }}
          />
        </div>

        {/* Gráfico de Intervalos de Confianza */}
        <div className={styles.graficoIndividual}>
          <h5>Intervalos de Confianza por Grupo</h5>
          <Plot
            data={gruposUnicos.map(grupo => {
              const tratamientosGrupo = resultadosDuncan.filter(d => d.grupo === grupo);
              return {
                x: tratamientosGrupo.map(d => d.tratamiento),
                y: tratamientosGrupo.map(d => d.media || 0),
                mode: 'markers',
                type: 'scatter',
                name: `Grupo ${grupo}`,
                marker: {
                  color: coloresGrupos[grupo] || '#95a5a6',
                  size: 12,
                  line: { color: '#2c3e50', width: 2 }
                }
              };
            })}
            layout={{
              title: 'Grupos Homogéneos Duncan',
              xaxis: { 
                title: 'Tratamientos',
                tickangle: -45
              },
              yaxis: { title: 'Media' },
              width: 500,
              height: 400,
              margin: { l: 60, r: 50, t: 80, b: 100 },
              showlegend: true,
              legend: { x: 0.02, y: 0.98 }
            }}
          />
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className={styles.tablaContainer} style={{
        marginTop: '20px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h5 style={{ color: '#6F4E37', marginBottom: '15px' }}>Resultados de la Prueba de Duncan</h5>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'white'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#ECB176' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', color: '#6F4E37' }}>Tratamiento</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', color: '#6F4E37' }}>Media</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', color: '#6F4E37' }}>Grupo Duncan</th>
            </tr>
          </thead>
          <tbody>
            {datosOrdenados.map((d, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#f8f9fa' : 'white' }}>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  <strong>{d.tratamiento}</strong>
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {typeof d.media === 'number' ? d.media.toFixed(3) : 'N/A'}
                </td>
                <td style={{ 
                  padding: '10px', 
                  border: '1px solid #ddd', 
                  textAlign: 'center',
                  backgroundColor: coloresGrupos[d.grupo] || '#95a5a6',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  {d.grupo || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


    </div>
  );
};

export default GraficoDuncan;