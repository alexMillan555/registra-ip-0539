import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export const generarCertificado = async (obra) => {
  // ==========================================================
  // 1. GENERAR EL CÓDIGO QR
  // ==========================================================
  const contenidoQR = `Verificación de Obra\nFolio: ${obra.folio}\nTítulo: ${obra.titulo}\nAutor: ${obra.autor || 'Anónimo'}`;
  
  const qrDataUrl = await QRCode.toDataURL(contenidoQR, {
    width: 400,
    margin: 2,
    color: { dark: '#050539', light: '#FFFFFF' }
  });

  // ==========================================================
  // 2. CONFIGURACIÓN DEL DOCUMENTO Y VARIABLES DE DISEÑO
  // ==========================================================
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const ancho = doc.internal.pageSize.getWidth();   // 210mm
  const alto = doc.internal.pageSize.getHeight();   // 297mm

  // -- Paleta de Colores --
  const colorAzul = '#050539';
  const colorAmarillo = '#FCD34D';
  const colorGrisOscuro = '#4B5563';
  const colorGrisClaro = '#9CA3AF';
  const colorFondoBeige = '#FFFBEB';

  // -- Escala Tipográfica (Jerarquía Visual) --
  const fontTituloPrincipal = 24;
  const fontSubtitulo = 14;
  const fontObra = 36;
  const fontCuerpo = 12;
  const fontPie = 9;

  // -- Alineaciones Consistentes (Retícula) --
  const xCentro = ancho / 2;
  const xLabelIzq = 45;   // Para las etiquetas (Autor, Fecha...)
  const xValorIzq = 85;   // Para los valores
  
  // ==========================================================
  // 3. FONDO Y DECORACIONES (Formas orgánicas)
  // ==========================================================
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, ancho, alto, 'F');

  doc.setFillColor(colorFondoBeige);
  doc.circle(ancho, 0, 80, 'F');
  doc.circle(0, alto, 70, 'F');

  // ==========================================================
  // 4. MARCO EXTERIOR Y ESQUINAS
  // ==========================================================
  doc.setDrawColor(colorAzul);
  doc.setLineWidth(1.5);
  doc.rect(10, 10, ancho - 20, alto - 20);

  // Esquinas decorativas
  const dibujarEsquinas = () => {
    doc.setFillColor(colorAmarillo); doc.rect(12, 12, 3, 3, 'F');
    doc.setFillColor(colorAzul); doc.rect(12, 17, 3, 3, 'F');
    doc.setFillColor(colorAzul); doc.rect(ancho - 15, 12, 3, 3, 'F');
    doc.setFillColor(colorAmarillo); doc.rect(ancho - 15, 17, 3, 3, 'F');
    doc.setFillColor(colorAmarillo); doc.rect(12, alto - 15, 3, 3, 'F');
    doc.setFillColor(colorAzul); doc.rect(12, alto - 20, 3, 3, 'F');
    doc.setFillColor(colorAzul); doc.rect(ancho - 15, alto - 15, 3, 3, 'F');
    doc.setFillColor(colorAmarillo); doc.rect(ancho - 15, alto - 20, 3, 3, 'F');
  };
  dibujarEsquinas();

  // ==========================================================
  // 5. JERARQUÍA TIPOGRÁFICA: TÍTULO Y SUBTÍTULO
  // ==========================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(fontTituloPrincipal);
  doc.setTextColor(colorAzul);
  doc.text('CERTIFICADO DE REGISTRO DE AUTORÍA', xCentro, 40, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSubtitulo);
  doc.setTextColor(colorGrisOscuro);
  doc.text('Sistema de Gestión de Obras', xCentro, 50, { align: 'center' });

  // Línea decorativa
  doc.setDrawColor(colorAmarillo);
  doc.setLineWidth(1);
  doc.line(xCentro - 20, 56, xCentro + 20, 56);

  // ==========================================================
  // 6. TEXTO INTRODUCTORIO (Cuerpo)
  // ==========================================================
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontCuerpo);
  doc.setTextColor(colorGrisOscuro);
  doc.text('Se hace constar que la siguiente obra ha sido registrada', xCentro, 70, { align: 'center' });
  doc.text('correctamente en el sistema institucional.', xCentro, 76, { align: 'center' });

  // ==========================================================
  // 7. NOMBRE DE LA OBRA (Jerarquía Máxima)
  // ==========================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(fontObra);
  doc.setTextColor(colorAzul);
  
  const titulo = `"${obra.titulo}"`;
  const tituloDividido = doc.splitTextToSize(titulo, ancho - 70);
  
  let yTitulo = 100;
  doc.text(tituloDividido, xCentro, yTitulo, { align: 'center' });

  // Adornos amarillos
  const anchoTexto = doc.getTextWidth(tituloDividido[0]);
  const xAdornoIzq = xCentro - (anchoTexto / 2) - 15;
  const xAdornoDer = xCentro + (anchoTexto / 2) + 15;
  
  doc.setDrawColor(colorAmarillo);
  doc.setLineWidth(1.5);
  doc.line(xAdornoIzq, yTitulo - 3, xAdornoIzq + 4, yTitulo - 3);
  doc.line(xAdornoIzq + 2, yTitulo + 2, xAdornoIzq + 6, yTitulo + 2);
  doc.line(xAdornoDer - 4, yTitulo - 3, xAdornoDer, yTitulo - 3);
  doc.line(xAdornoDer - 6, yTitulo + 2, xAdornoDer - 2, yTitulo + 2);

  // ==========================================================
  // 8. METADATOS (Alineación Izquierda Consistente)
  // ==========================================================
  let yDatos = yTitulo + (tituloDividido.length * 10) + 15;
  doc.setFontSize(fontCuerpo);

  // -- Autor --
  doc.setFont('helvetica', 'bold'); doc.setTextColor(colorAzul);
  doc.text('Autor:', xLabelIzq, yDatos);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(colorGrisOscuro);
  doc.text(obra.autor || 'Anónimo', xValorIzq, yDatos);
  doc.setFillColor(colorAzul);
  doc.circle(xLabelIzq - 8, yDatos - 1.5, 1.5, 'F');
  doc.circle(xLabelIzq - 8, yDatos + 2, 3, 'F');

  yDatos += 12;

  // -- Categoría --
  doc.setFont('helvetica', 'bold'); doc.setTextColor(colorAzul);
  doc.text('Categoría:', xLabelIzq, yDatos);
  doc.setFillColor(colorAmarillo);
  doc.roundedRect(xValorIzq - 2, yDatos - 6, doc.getTextWidth(obra.categoria) + 10, 8, 4, 4, 'F');
  doc.setTextColor(colorAzul);
  doc.text(obra.categoria, xValorIzq + 3, yDatos);
  doc.setFillColor(colorAzul);
  doc.rect(xLabelIzq - 10, yDatos - 4, 4, 3, 'F');
  doc.triangle(xLabelIzq - 10, yDatos - 1, xLabelIzq - 6, yDatos - 1, xLabelIzq - 8, yDatos + 1, 'F');

  yDatos += 12;

  // -- Fecha --
  const fecha = new Date(obra.fechaRegistro || Date.now()).toLocaleDateString('es-MX');
  doc.setFont('helvetica', 'bold'); doc.setTextColor(colorAzul);
  doc.text('Fecha de registro:', xLabelIzq, yDatos);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(colorGrisOscuro);
  doc.text(fecha, xValorIzq, yDatos);
  doc.setFillColor(colorAzul);
  doc.rect(xLabelIzq - 11, yDatos - 4, 5, 5, 'F');
  doc.setFillColor(255, 255, 255);
  doc.rect(xLabelIzq - 10, yDatos - 2, 3, 2, 'F');

  yDatos += 12;

  // -- Descripción --
  if (obra.descripcion && obra.descripcion.trim()) {
    doc.setFont('helvetica', 'bold'); doc.setTextColor(colorAzul);
    doc.text('Descripción:', xLabelIzq, yDatos);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(colorGrisOscuro);
    const descDividida = doc.splitTextToSize(obra.descripcion, ancho - xValorIzq - 45);
    doc.text(descDividida, xValorIzq, yDatos);
    doc.setFillColor(colorAzul);
    doc.rect(xLabelIzq - 10, yDatos - 4, 4, 5, 'F');
  }

  // ==========================================================
  // 9. LEYENDA PERSONALIZADA
  // ==========================================================
  const yLeyenda = 195;
  let nombreRegistrador = "Admin Registra-IP";
  try {
    const userStr = localStorage.getItem('registraUsuarioIp');
    if (userStr) nombreRegistrador = JSON.parse(userStr).nombre || nombreRegistrador;
  } catch (e) {}

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(11);
  doc.setTextColor(colorGrisOscuro);
  doc.text(`Registrado por: ${nombreRegistrador}`, xCentro, yLeyenda, { align: 'center' });

  // ==========================================================
  // 10. FOLIO
  // ==========================================================
  const yFolio = 215;
  const textFolio = `Folio: ${obra.folio}`;
  const anchoFolio = doc.getTextWidth(textFolio) + 20;

  doc.setFillColor(colorAzul);
  doc.roundedRect((ancho - anchoFolio) / 2, yFolio - 6, anchoFolio, 12, 6, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(textFolio, xCentro, yFolio + 1, { align: 'center' });

  // ==========================================================
  // 11. CÓDIGO QR
  // ==========================================================
  const qrSize = 35;
  const qrX = ancho - 25 - qrSize;
  const qrY = alto - 25 - qrSize;

  doc.setFillColor(255, 248, 220);
  doc.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 12, 3, 3, 'F');
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  doc.setFontSize(fontPie);
  doc.setTextColor(colorGrisOscuro);
  doc.text('Escanea para verificar', qrX + qrSize / 2, qrY + qrSize + 5, { align: 'center' });

  // ==========================================================
  // 12. FIRMA
  // ==========================================================
  const firmaX = 45;
  const firmaY = alto - 40;

  doc.setDrawColor(colorGrisClaro);
  doc.setLineWidth(0.5);
  doc.line(firmaX, firmaY, firmaX + 70, firmaY);

  doc.setFontSize(10);
  doc.setTextColor(colorGrisOscuro);
  doc.text('Firma / Validación institucional', firmaX + 35, firmaY + 6, { align: 'center' });

  // ==========================================================
  // 13. GUARDAR / DESCARGAR PDF (🔑 REQUISITO DE LA PRÁCTICA)
  // ==========================================================
  // Nombre exacto solicitado: "certificado-<folio>.pdf"
  doc.save(`certificado-${obra.folio}.pdf`);
};