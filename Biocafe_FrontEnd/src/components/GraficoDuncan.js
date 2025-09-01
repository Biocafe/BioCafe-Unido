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
    'A': '#e74c3c',
    'B': '#3498db', 
    'C': '#2ecc71',
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

      {/* Interpretación Breve */}
      <div className={styles.interpretacion} style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#e8f4f8',
        borderRadius: '8px',
        border: '2px solid #3498db'
      }}>
        <strong>Interpretación:</strong> Tratamientos con la misma letra (grupo) no son significativamente diferentes entre sí.
        <br/>
        <strong>Grupos identificados:</strong> {gruposUnicos.length} grupos homogéneos ({gruposUnicos.join(', ')})
      </div>

      {/* Informe Detallado */}
      <div className={styles.informeDetallado} style={{
        marginTop: '30px',
        padding: '25px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '2px solid #ECB176',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        <h4 style={{
          color: '#6F4E37',
          marginBottom: '20px',
          textAlign: 'center',
          fontSize: '18px',
          borderBottom: '2px solid #ECB176',
          paddingBottom: '10px'
        }}>📋 INFORME DETALLADO - PRUEBA POST-HOC DE DUNCAN</h4>
        
        <div style={{ lineHeight: '1.6', fontSize: '14px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>🎯 ¿Qué es la Prueba de Duncan?</h5>
            <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
              La prueba de Duncan (Duncan's Multiple Range Test) es un análisis post-hoc que se realiza después 
              de un ANOVA significativo para identificar cuáles tratamientos específicos son diferentes entre sí. 
              Agrupa los tratamientos en conjuntos homogéneos, donde los tratamientos dentro del mismo grupo 
              no son significativamente diferentes, pero sí lo son respecto a otros grupos.
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>🔬 ¿Cómo se Aplicó en sus Datos?</h5>
            <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
              Se compararon <strong>{tratamientos.length} tratamientos</strong> mediante comparaciones múltiples controladas. 
              La prueba identificó <strong>{gruposUnicos.length} grupos homogéneos</strong> etiquetados con letras 
              ({gruposUnicos.join(', ')}). Los gráficos muestran:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
              <li><strong>Gráfico de barras:</strong> Medias ordenadas por grupo Duncan</li>
              <li><strong>Gráfico de puntos:</strong> Tratamientos agrupados por similitud estadística</li>
              <li><strong>Tabla de resultados:</strong> Clasificación completa por grupos</li>
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
                ✅ CONCLUSIÓN: Se identificaron {gruposUnicos.length} grupos homogéneos
              </p>
              <p style={{ margin: '0', fontSize: '13px' }}>
                <strong>Grupos encontrados:</strong> {gruposUnicos.join(', ')}<br/>
                <strong>Tratamientos analizados:</strong> {tratamientos.length}<br/>
                <strong>Rango de medias:</strong> {Math.min(...medias).toFixed(3)} - {Math.max(...medias).toFixed(3)}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>🎯 ¿Qué Significan estos Resultados?</h5>
            <div>
              <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
                <strong>Los tratamientos se agruparon</strong> según su similitud estadística:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
                <li>Tratamientos con la <strong>misma letra NO son diferentes</strong> estadísticamente</li>
                <li>Tratamientos con <strong>letras diferentes SÍ son diferentes</strong> estadísticamente</li>
                <li>Un tratamiento puede pertenecer a múltiples grupos si es intermedio</li>
                <li>Los grupos están ordenados por rendimiento (A = mejor, B = segundo, etc.)</li>
              </ul>
              <p style={{ margin: '0 0 10px 0', textAlign: 'justify', fontWeight: 'bold', color: '#388e3c' }}>
                ✅ IMPLICACIONES: Puede seleccionar cualquier tratamiento del grupo A como el más efectivo.
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>📈 Análisis Detallado por Grupo</h5>
            <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              {gruposUnicos.map((grupo, index) => {
                const tratamientosGrupo = resultadosDuncan.filter(d => d.grupo === grupo);
                const mediasGrupo = tratamientosGrupo.map(d => d.media || 0);
                const mediaPromedio = mediasGrupo.reduce((a, b) => a + b, 0) / mediasGrupo.length;
                
                return (
                  <div key={index} style={{ marginBottom: '10px', fontSize: '13px' }}>
                    <strong style={{ color: coloresGrupos[grupo] || '#95a5a6' }}>Grupo {grupo}:</strong> 
                    {tratamientosGrupo.map(t => t.tratamiento).join(', ')} 
                    (Media promedio: {mediaPromedio.toFixed(3)})
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>💡 Recomendaciones Específicas</h5>
            <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '8px', border: '1px solid #4caf50' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Basado en los grupos identificados:</p>
              <ul style={{ marginLeft: '20px', margin: '0' }}>
                <li><strong>Selección óptima:</strong> Use cualquier tratamiento del Grupo A para máximo rendimiento</li>
                <li><strong>Alternativas:</strong> Tratamientos del Grupo B son segunda opción viable</li>
                <li><strong>Evitar:</strong> Tratamientos de grupos inferiores si busca máximo rendimiento</li>
                <li><strong>Costo-beneficio:</strong> Compare costos entre tratamientos del mismo grupo</li>
                <li><strong>Validación:</strong> Confirme resultados con experimentos adicionales</li>
                <li><strong>Implementación:</strong> Considere factores prácticos además de la significancia estadística</li>
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
              📝 NOTA TÉCNICA: La prueba de Duncan solo es válida después de un ANOVA significativo. 
              Controla la tasa de error por familia pero es menos conservadora que Bonferroni. 
              Los grupos pueden solaparse, indicando que algunos tratamientos son estadísticamente 
              similares a múltiples grupos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficoDuncan;