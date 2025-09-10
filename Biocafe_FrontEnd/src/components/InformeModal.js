import React, { useRef } from 'react';
import styles from '../styles/InformeModal.module.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { FaImage, FaFilePdf, FaFileExcel, FaTimes } from 'react-icons/fa';

const InformeModal = ({ isOpen, onClose, title, children, testType }) => {
  const modalContentRef = useRef();

  if (!isOpen) return null;

  const exportToImage = async () => {
    const element = modalContentRef.current;
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
    const imgData = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `informe_${testType}.png`;
    link.click();
  };

  const exportToPDF = async () => {
    const element = modalContentRef.current;
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
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
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
      pdf.addImage(imgData, 'PNG', margin, margin, scaledWidth, scaledHeight);
    } else {
      // Dividir en múltiples páginas
      const maxHeightPerPage = pageHeight - margin * 2;
      const totalPages = Math.ceil(scaledHeight / maxHeightPerPage);
      
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) pdf.addPage();
        
        const yOffset = i * maxHeightPerPage;
        const remainingHeight = Math.min(maxHeightPerPage, scaledHeight - yOffset);
        
        // Crear canvas temporal para esta sección
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = imgWidth;
        tempCanvas.height = (remainingHeight / ratio);
        
        const img = new Image();
        img.onload = () => {
          tempCtx.drawImage(img, 0, -(yOffset / ratio), imgWidth, imgHeight);
          const sectionImgData = tempCanvas.toDataURL('image/png');
          pdf.addImage(sectionImgData, 'PNG', margin, margin, scaledWidth, remainingHeight);
          
          if (i === totalPages - 1) {
            pdf.save(`informe_${testType}.pdf`);
          }
        };
        img.src = imgData;
        
        if (i === totalPages - 1 && img.complete) {
          pdf.save(`informe_${testType}.pdf`);
        }
      }
      
      // Fallback si no hay onload
      setTimeout(() => {
        pdf.save(`informe_${testType}.pdf`);
      }, 1000);
    }
    
    if (scaledHeight <= pageHeight - margin * 2) {
      pdf.save(`informe_${testType}.pdf`);
    }
  };

  const exportToExcel = () => {
    // Extraer texto del contenido del modal
    const element = modalContentRef.current;
    const textContent = element ? element.innerText : '';
    
    // Dividir el contenido en líneas y procesar
    const lines = textContent.split('\n').filter(line => line.trim() !== '');
    
    const data = [
      ['INFORME DE ANÁLISIS ESTADÍSTICO'],
      ['Tipo de Prueba:', title],
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
    
    // Aplicar estilos básicos
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = XLSX.utils.encode_cell({ c: C, r: R });
        if (!ws[cell_address]) continue;
        
        // Estilo para encabezados
        if (R === 0 || R === 5) {
          ws[cell_address].s = {
            font: { bold: true, sz: 14 },
            alignment: { horizontal: 'center' }
          };
        }
      }
    }
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Informe Detallado');
    XLSX.writeFile(wb, `informe_detallado_${testType}.xlsx`);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className={styles.modalBody} ref={modalContentRef}>
          {children}
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.exportButton} onClick={exportToImage}>
            <FaImage /> PNG
          </button>
          <button className={styles.exportButton} onClick={exportToPDF}>
            <FaFilePdf /> PDF
          </button>
          <button className={styles.exportButton} onClick={exportToExcel}>
            <FaFileExcel /> Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InformeModal;