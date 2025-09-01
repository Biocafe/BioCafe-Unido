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

      <div className={styles.interpretacion}>
        <strong>Estadístico de Levene = {typeof resultadosLevene.estadistico === 'number' ? resultadosLevene.estadistico.toFixed(4) : 'N/A'}, p-valor = {typeof resultadosLevene.pValor === 'number' ? resultadosLevene.pValor.toFixed(4) : 'N/A'}</strong><br/>
        <strong>Coeficientes de Variación:</strong> {estadisticasPorGrupo.map(g => g.tratamiento + ': ' + g.coeficienteVariacion.toFixed(1) + '%').join(', ')}<br/>
        {typeof resultadosLevene.pValor === 'number' && resultadosLevene.pValor < 0.05 ? 
          '❌ Las varianzas NO son homogéneas (p < 0.05). Los grupos presentan variabilidades significativamente diferentes.' : 
          '✅ Las varianzas son homogéneas (p ≥ 0.05). Es apropiado usar ANOVA y otras pruebas que asumen igualdad de varianzas.'}
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
        }}>📋 INFORME DETALLADO - PRUEBA DE HOMOGENEIDAD DE VARIANZAS (LEVENE)</h4>
        
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
              backgroundColor: typeof resultadosLevene.pValor === 'number' && resultadosLevene.pValor < 0.05 ? '#ffebee' : '#e8f5e8',
              borderRadius: '8px',
              border: '2px solid ' + (typeof resultadosLevene.pValor === 'number' && resultadosLevene.pValor < 0.05 ? '#f44336' : '#4caf50'),
              marginBottom: '15px'
            }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
                {typeof resultadosLevene.pValor === 'number' && resultadosLevene.pValor < 0.05 ? 
                  '❌ CONCLUSIÓN: Las varianzas NO son homogéneas entre grupos' : 
                  '✅ CONCLUSIÓN: Las varianzas son homogéneas entre grupos'}
              </p>
              <p style={{ margin: '0', fontSize: '13px' }}>
                <strong>Estadístico de Levene:</strong> {typeof resultadosLevene.estadistico === 'number' ? resultadosLevene.estadistico.toFixed(4) : 'N/A'} 
                (valores altos indican diferencias en varianzas)<br/>
                <strong>P-valor:</strong> {typeof resultadosLevene.pValor === 'number' ? resultadosLevene.pValor.toFixed(4) : 'N/A'} 
                (si p menor que 0.05, rechazamos homogeneidad)<br/>
                <strong>Grupos analizados:</strong> {tratamientos.length} grupos con tamaños: {estadisticasPorGrupo.map(g => g.tratamiento + '(n=' + g.n + ')').join(', ')}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>🎯 ¿Qué Significan estos Resultados?</h5>
            {typeof resultadosLevene.pValor === 'number' && resultadosLevene.pValor < 0.05 ? (
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
            {typeof resultadosLevene.pValor === 'number' && resultadosLevene.pValor < 0.05 ? (
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
      </div>
    </div>
  );
};

export default GraficoLevene;