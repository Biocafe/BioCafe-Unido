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

      <div className={styles.interpretacion}>
        <strong>F = {typeof resultadosAnova.F === 'number' ? resultadosAnova.F.toFixed(4) : 'N/A'}, p-valor = {typeof resultadosAnova.pValor === 'number' ? resultadosAnova.pValor.toFixed(4) : 'N/A'}</strong><br/>
        {typeof resultadosAnova.pValor === 'number' && resultadosAnova.pValor < 0.05 ? 
          '✅ Existen diferencias significativas entre los tratamientos (p < 0.05). Los tratamientos tienen efectos diferentes.' : 
          '❌ No hay diferencias significativas entre los tratamientos (p ≥ 0.05). Los tratamientos no muestran efectos diferentes.'}
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
        }}>📋 INFORME DETALLADO - ANÁLISIS DE VARIANZA (ANOVA)</h4>
        
        <div style={{ lineHeight: '1.6', fontSize: '14px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>🎯 ¿Qué es el Análisis de Varianza (ANOVA)?</h5>
            <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
              ANOVA es una técnica estadística que compara las medias de tres o más grupos para determinar 
              si existen diferencias significativas entre ellos. Descompone la variabilidad total de los datos 
              en variabilidad entre grupos (explicada por los tratamientos) y variabilidad dentro de los grupos 
              (error experimental). Es fundamental en la investigación experimental para evaluar el efecto de 
              diferentes tratamientos o condiciones.
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>🔬 ¿Cómo se Aplicó en sus Datos?</h5>
            <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
              Se analizaron <strong>{tratamientos.length} grupos de tratamiento</strong> con un total de <strong>{datos.length} observaciones</strong>. 
              ANOVA calculó el estadístico F comparando la varianza entre grupos con la varianza dentro de los grupos. 
              Los gráficos generados incluyen:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
              <li><strong>Box Plots:</strong> Distribución de cada tratamiento con mediana, cuartiles y outliers</li>
              <li><strong>Gráfico de Medias:</strong> Comparación visual de las medias con intervalos de confianza</li>
              <li><strong>Análisis visual:</strong> Permite identificar patrones y diferencias entre grupos</li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>📊 Interpretación de Resultados</h5>
            <div style={{ 
              padding: '15px', 
              backgroundColor: typeof resultadosAnova.pValor === 'number' && resultadosAnova.pValor < 0.05 ? '#e8f5e8' : '#ffebee',
              borderRadius: '8px',
              border: '2px solid ' + (typeof resultadosAnova.pValor === 'number' && resultadosAnova.pValor < 0.05 ? '#4caf50' : '#f44336'),
              marginBottom: '15px'
            }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
                {typeof resultadosAnova.pValor === 'number' && resultadosAnova.pValor < 0.05 ? 
                  '✅ CONCLUSIÓN: Existen diferencias significativas entre los tratamientos' : 
                  '❌ CONCLUSIÓN: No hay diferencias significativas entre los tratamientos'}
              </p>
              <p style={{ margin: '0', fontSize: '13px' }}>
                <strong>Estadístico F:</strong> {typeof resultadosAnova.F === 'number' ? resultadosAnova.F.toFixed(4) : 'N/A'} 
                (valores altos indican mayor diferencia entre grupos)<br/>
                <strong>P-valor:</strong> {typeof resultadosAnova.pValor === 'number' ? resultadosAnova.pValor.toFixed(4) : 'N/A'} 
                (si p menor que 0.05, hay diferencias significativas)<br/>
                <strong>Tratamientos comparados:</strong> {tratamientos.length} grupos
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>🎯 ¿Qué Significan estos Resultados?</h5>
            {typeof resultadosAnova.pValor === 'number' && resultadosAnova.pValor < 0.05 ? (
              <div>
                <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
                  <strong>HAY diferencias significativas</strong> entre al menos dos de sus tratamientos. Esto significa que:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
                  <li>Los tratamientos tienen efectos diferentes sobre la variable medida</li>
                  <li>La variabilidad entre grupos es mayor que la variabilidad dentro de los grupos</li>
                  <li>Al menos uno de los tratamientos produce resultados estadísticamente diferentes</li>
                  <li>Los efectos observados probablemente no se deben al azar</li>
                </ul>
                <p style={{ margin: '0 0 10px 0', textAlign: 'justify', fontWeight: 'bold', color: '#388e3c' }}>
                  ✅ IMPLICACIONES: Sus tratamientos son efectivos. Proceda con análisis post-hoc para identificar cuáles son diferentes.
                </p>
              </div>
            ) : (
              <div>
                <p style={{ margin: '0 0 10px 0', textAlign: 'justify' }}>
                  <strong>NO hay diferencias significativas</strong> entre sus tratamientos. Esto significa que:
                </p>
                <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
                  <li>Todos los tratamientos producen resultados similares estadísticamente</li>
                  <li>La variabilidad entre grupos no es mayor que la variabilidad natural</li>
                  <li>Las diferencias observadas pueden deberse al azar</li>
                  <li>Los tratamientos no muestran efectos diferenciales claros</li>
                </ul>
                <p style={{ margin: '0 0 10px 0', textAlign: 'justify', fontWeight: 'bold', color: '#d32f2f' }}>
                  ⚠️ IMPLICACIONES: Los tratamientos no muestran efectos diferentes. Considere revisar diseño experimental o aumentar tamaño de muestra.
                </p>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>📈 Análisis Detallado por Tratamiento</h5>
            <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              {tratamientos.map((tratamiento, index) => {
                const datosTratamiento = datos.filter(d => d.tratamiento === tratamiento).map(d => parseFloat(d.resultado)).filter(v => !isNaN(v));
                const media = datosTratamiento.reduce((a, b) => a + b, 0) / datosTratamiento.length;
                const varianza = datosTratamiento.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / (datosTratamiento.length - 1);
                const desviacion = Math.sqrt(varianza);
                const cv = (desviacion / media) * 100;
                
                return (
                  <div key={index} style={{ marginBottom: '10px', fontSize: '13px' }}>
                    <strong>{tratamiento}:</strong> n={datosTratamiento.length}, 
                    Media={media.toFixed(3)}, 
                    DE={desviacion.toFixed(3)}, 
                    CV={cv.toFixed(1)}%
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h5 style={{ color: '#6F4E37', marginBottom: '10px' }}>💡 Recomendaciones Específicas</h5>
            {typeof resultadosAnova.pValor === 'number' && resultadosAnova.pValor < 0.05 ? (
              <div style={{ backgroundColor: '#e8f5e8', padding: '15px', borderRadius: '8px', border: '1px solid #4caf50' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Dado que hay diferencias significativas:</p>
                <ul style={{ marginLeft: '20px', margin: '0' }}>
                  <li><strong>Análisis Post-hoc:</strong> Use pruebas de Tukey, Bonferroni, o Scheffé para comparaciones múltiples</li>
                  <li><strong>Identificar grupos:</strong> Determine cuáles tratamientos son diferentes entre sí</li>
                  <li><strong>Tamaño del efecto:</strong> Calcule eta cuadrado para medir la magnitud práctica</li>
                  <li><strong>Interpretación biológica:</strong> Relacione diferencias estadísticas con relevancia práctica</li>
                  <li><strong>Validación:</strong> Considere replicar el experimento para confirmar resultados</li>
                  <li><strong>Aplicación:</strong> Implemente el tratamiento más efectivo identificado</li>
                </ul>
              </div>
            ) : (
              <div style={{ backgroundColor: '#fff3e0', padding: '15px', borderRadius: '8px', border: '1px solid #ff9800' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Dado que no hay diferencias significativas:</p>
                <ul style={{ marginLeft: '20px', margin: '0' }}>
                  <li><strong>Revisar potencia:</strong> Calcule si el tamaño de muestra fue adecuado</li>
                  <li><strong>Análisis exploratorio:</strong> Examine patrones en los datos que ANOVA no detectó</li>
                  <li><strong>Considerar covariables:</strong> Use ANCOVA si hay variables confusoras</li>
                  <li><strong>Transformaciones:</strong> Evalúe si los datos necesitan transformación</li>
                  <li><strong>Diseño experimental:</strong> Revise si el diseño fue apropiado para detectar diferencias</li>
                  <li><strong>Equivalencia:</strong> Considere pruebas de equivalencia si los tratamientos deben ser similares</li>
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
              Verifique estos supuestos con las pruebas de Shapiro-Wilk y Levene incluidas en este análisis. 
              Si los supuestos no se cumplen, considere transformaciones de datos o pruebas no paramétricas 
              como Kruskal-Wallis. El análisis post-hoc solo es válido si ANOVA es significativa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraficoAnova;