import React from 'react';
import Plot from 'react-plotly.js';
import styles from '../styles/GraficoShapiro.module.css';

const GraficoShapiro = ({ datos, resultadosShapiro }) => {
  if (!datos || !resultadosShapiro) {
    return null;
  }

  // Extraer valores numéricos
  const valores = datos
    .map(item => parseFloat(item.resultado))
    .filter(val => !isNaN(val))
    .sort((a, b) => a - b);

  if (valores.length === 0) {
    return null;
  }

  // Calcular estadísticas básicas con validaciones
  const n = valores.length;
  
  // Validar tamaño mínimo de muestra
  if (n < 3) {
    console.warn('Muestra muy pequeña para análisis de Shapiro-Wilk (n < 3)');
    return (
      <div className={styles.graficosContainer}>
        <h4>Análisis de Normalidad - Prueba de Shapiro-Wilk</h4>
        <div className={styles.errorMessage}>
          <p>⚠️ Muestra insuficiente: Se requieren al menos 3 observaciones para realizar el análisis de normalidad.</p>
        </div>
      </div>
    );
  }
  
  const media = valores.reduce((sum, val) => sum + val, 0) / n;
  const varianza = n > 1 ? valores.reduce((sum, val) => sum + Math.pow(val - media, 2), 0) / (n - 1) : 0;
  const desviacionEstandar = Math.sqrt(Math.max(0, varianza)); // Evitar raíz de número negativo
  
  // Validar que la desviación estándar no sea cero
  if (desviacionEstandar === 0) {
    return (
      <div className={styles.graficosContainer}>
        <h4>Análisis de Normalidad - Prueba de Shapiro-Wilk</h4>
        <div className={styles.errorMessage}>
          <p>⚠️ Todos los valores son idénticos. No es posible realizar el análisis de normalidad.</p>
        </div>
      </div>
    );
  }

  // Calcular cuantiles teóricos para Q-Q plot (mejorado)
  const cuantilesTeóricos = valores.map((_, i) => {
    const p = (i + 0.375) / (n + 0.25); // Fórmula de Blom para mejor aproximación
    // Usar la función inversa de la distribución normal estándar
    return media + desviacionEstandar * normalInv(p);
  });

  // Función para calcular la inversa de la distribución normal estándar
  function normalInv(p) {
    // Aproximación de Beasley-Springer-Moro para la inversa de la normal estándar
    if (p <= 0 || p >= 1) {
      throw new Error('p debe estar entre 0 y 1');
    }
    
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
    
    const pLow = 0.02425;
    const pHigh = 1 - pLow;
    
    let x, q, r;
    
    if (p < pLow) {
      q = Math.sqrt(-2 * Math.log(p));
      x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    } else if (p <= pHigh) {
      q = p - 0.5;
      r = q * q;
      x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    } else {
      q = Math.sqrt(-2 * Math.log(1 - p));
      x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    
    return x;
  }

  // Calcular residuos estandarizados
  const residuosEstandarizados = valores.map(val => (val - media) / desviacionEstandar);

  // Generar curva normal teórica para el histograma con validaciones
  const rangoX = Math.max(...valores) - Math.min(...valores);
  const extension = Math.max(rangoX * 0.1, desviacionEstandar * 0.5); // Extensión mínima
  const minX = Math.min(...valores) - extension;
  const maxX = Math.max(...valores) + extension;
  const puntosX = [];
  const puntosY = [];
  
  for (let i = 0; i <= 100; i++) {
    const x = minX + (maxX - minX) * i / 100;
    const z = (x - media) / desviacionEstandar;
    // Evitar overflow en la exponencial
    const y = Math.abs(z) > 10 ? 0 : (1 / (desviacionEstandar * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
    puntosX.push(x);
    puntosY.push(y * n * (maxX - minX) / 20); // Escalar para que coincida con el histograma
  }

  // Calcular coeficiente de correlación para Q-Q plot
  const correlacionQQ = calcularCorrelacion(cuantilesTeóricos, valores);

  function calcularCorrelacion(x, y) {
    const n = x.length;
    const mediaX = x.reduce((sum, val) => sum + val, 0) / n;
    const mediaY = y.reduce((sum, val) => sum + val, 0) / n;
    
    let numerador = 0;
    let denominadorX = 0;
    let denominadorY = 0;
    
    for (let i = 0; i < n; i++) {
      const diffX = x[i] - mediaX;
      const diffY = y[i] - mediaY;
      numerador += diffX * diffY;
      denominadorX += diffX * diffX;
      denominadorY += diffY * diffY;
    }
    
    const denominador = Math.sqrt(denominadorX * denominadorY);
    return denominador === 0 ? 0 : numerador / denominador;
  }

  return (
    <div className={styles.graficosContainer}>
      <h4>Análisis de Normalidad - Prueba de Shapiro-Wilk</h4>
      
      <div className={styles.graficosGrid}>
        {/* Q-Q Plot Mejorado */}
        <div className={styles.graficoIndividual}>
          <h5>Q-Q Plot Normal (r = {correlacionQQ.toFixed(3)})</h5>
          <Plot
            data={[
              {
                x: cuantilesTeóricos,
                y: valores,
                mode: 'markers',
                type: 'scatter',
                name: 'Datos observados',
                marker: { 
                  color: '#2E86AB', 
                  size: 8,
                  line: { color: '#1B4F72', width: 1 }
                }
              },
              {
                x: [Math.min(...cuantilesTeóricos), Math.max(...cuantilesTeóricos)],
                y: [Math.min(...cuantilesTeóricos), Math.max(...cuantilesTeóricos)],
                mode: 'lines',
                type: 'scatter',
                name: 'Línea de normalidad',
                line: { color: '#E74C3C', width: 2, dash: 'solid' }
              },
              {
                x: cuantilesTeóricos,
                y: cuantilesTeóricos.map(x => x + desviacionEstandar * 0.5),
                mode: 'lines',
                type: 'scatter',
                name: 'Banda de confianza (+)',
                line: { color: '#F39C12', width: 1, dash: 'dot' },
                showlegend: false
              },
              {
                x: cuantilesTeóricos,
                y: cuantilesTeóricos.map(x => x - desviacionEstandar * 0.5),
                mode: 'lines',
                type: 'scatter',
                name: 'Banda de confianza (-)',
                line: { color: '#F39C12', width: 1, dash: 'dot' },
                showlegend: false
              }
            ]}
            layout={{
              title: 'Gráfico Cuantil-Cuantil Normal',
              xaxis: { title: 'Cuantiles Teóricos Normales' },
              yaxis: { title: 'Cuantiles Observados' },
              width: 450,
              height: 350,
              margin: { l: 60, r: 50, t: 60, b: 60 },
              showlegend: true,
              legend: { x: 0.02, y: 0.98 }
            }}
          />
        </div>

        {/* Histograma con Curva Normal Superpuesta */}
        <div className={styles.graficoIndividual}>
          <h5>Histograma vs Distribución Normal Teórica</h5>
          <Plot
            data={[
              {
                x: valores,
                type: 'histogram',
                name: 'Datos observados',
                marker: { 
                  color: '#A569BD', 
                  opacity: 0.7,
                  line: { color: '#6C3483', width: 1 }
                },
                nbinsx: Math.max(8, Math.ceil(Math.sqrt(n))),
                yaxis: 'y'
              },
              {
                x: puntosX,
                y: puntosY,
                mode: 'lines',
                type: 'scatter',
                name: 'Curva normal teórica',
                line: { color: '#E74C3C', width: 3 },
                yaxis: 'y'
              }
            ]}
            layout={{
              title: 'Distribución de Datos vs Normal Teórica',
              xaxis: { title: 'Valores' },
              yaxis: { title: 'Frecuencia / Densidad' },
              width: 450,
              height: 350,
              margin: { l: 60, r: 50, t: 60, b: 60 },
              showlegend: true,
              legend: { x: 0.02, y: 0.98 }
            }}
          />
        </div>

        {/* Gráfico de Residuos Estandarizados */}
        <div className={styles.graficoIndividual}>
          <h5>Residuos Estandarizados</h5>
          <Plot
            data={[
              {
                x: Array.from({length: n}, (_, i) => i + 1),
                y: residuosEstandarizados,
                mode: 'markers',
                type: 'scatter',
                name: 'Residuos estandarizados',
                marker: { 
                  color: '#16A085', 
                  size: 8,
                  line: { color: '#0E6655', width: 1 }
                }
              },
              {
                x: [1, n],
                y: [0, 0],
                mode: 'lines',
                type: 'scatter',
                name: 'Línea de referencia',
                line: { color: '#34495E', width: 2, dash: 'solid' }
              },
              {
                x: [1, n],
                y: [2, 2],
                mode: 'lines',
                type: 'scatter',
                name: 'Limite +2sigma',
                line: { color: '#E67E22', width: 1, dash: 'dash' },
                showlegend: false
              },
              {
                x: [1, n],
                y: [-2, -2],
                mode: 'lines',
                type: 'scatter',
                name: 'Limite -2sigma',
                line: { color: '#E67E22', width: 1, dash: 'dash' },
                showlegend: false
              }
            ]}
            layout={{
              title: 'Análisis de Residuos Estandarizados',
              xaxis: { title: 'Orden de Observación' },
              yaxis: { title: 'Residuos Estandarizados' },
              width: 450,
              height: 350,
              margin: { l: 60, r: 50, t: 60, b: 60 },
              showlegend: true,
              legend: { x: 0.02, y: 0.98 }
            }}
          />
        </div>
      </div>


    </div>
  );
};

export default GraficoShapiro;