/**
 * Configurações padrão para templates de PDF
 * Padroniza formato A4 com bordas de 2cm para todos os relatórios
 */

import type { jsPDF } from 'jspdf';

// Configurações padrão do template A4
export const PDF_CONFIG = {
  // Formato e orientação
  orientation: 'portrait' as const,
  unit: 'pt' as const,
  format: 'a4' as const,
  
  // Margens padrão (2cm = 56.7 pontos)
  margin: 56.7,
  
  // Dimensões da página A4 em pontos
  pageSize: {
    width: 595.28,
    height: 841.89
  },
  
  // Estilos padrão
  fonts: {
    title: { family: 'helvetica', style: 'bold', size: 14 },
    subtitle: { family: 'helvetica', style: 'bold', size: 12 },
    normal: { family: 'helvetica', style: 'normal', size: 10 },
    small: { family: 'helvetica', style: 'normal', size: 9 },
    footer: { family: 'helvetica', style: 'normal', size: 9 }
  },
  
  // Cores padrão
  colors: {
    primary: [41, 128, 185] as [number, number, number],
    background: [245, 245, 245] as [number, number, number],
    text: [0, 0, 0] as [number, number, number],
    white: [255, 255, 255] as [number, number, number]
  }
};

/**
 * Interface para configurações de layout do PDF
 */
export interface PDFLayoutConfig {
  pageMargin: number;
  pageWidth: number;
  pageHeight: number;
  contentWidth: number;
  contentHeight: number;
}

/**
 * Calcula as dimensões e margens do layout do PDF
 */
export function calculatePDFLayout(doc: jsPDF): PDFLayoutConfig {
  const pageMargin = PDF_CONFIG.margin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - (2 * pageMargin);
  const contentHeight = pageHeight - (2 * pageMargin);
  
  return {
    pageMargin,
    pageWidth,
    pageHeight,
    contentWidth,
    contentHeight
  };
}

/**
 * Aplica configurações padrão de fonte
 */
export function applyFont(doc: jsPDF, fontType: keyof typeof PDF_CONFIG.fonts) {
  const font = PDF_CONFIG.fonts[fontType];
  doc.setFont(font.family, font.style);
  doc.setFontSize(font.size);
}

/**
 * Adiciona cabeçalho padrão ao PDF com quebra de linha automática
 */
export function addHeader(
  doc: jsPDF,
  layout: PDFLayoutConfig,
  title: string,
  subtitle?: string
) {
  applyFont(doc, 'title');
  
  // Verificar se o título cabe na página
  const titleWidth = doc.getTextWidth(title);
  const maxWidth = layout.contentWidth;
  
  if (titleWidth > maxWidth) {
    // Quebrar o título em múltiplas linhas
    const words = title.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = doc.getTextWidth(testLine);
      
      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Palavra muito longa, forçar quebra
          lines.push(word);
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // Renderizar múltiplas linhas centralizadas
    lines.forEach((line, index) => {
      const lineWidth = doc.getTextWidth(line);
      const lineX = (layout.pageWidth - lineWidth) / 2;
      doc.text(line, lineX, layout.pageMargin + 20 + (index * 16));
    });
    
    // Ajustar posição do subtítulo
    if (subtitle) {
      applyFont(doc, 'normal');
      const subtitleWidth = doc.getTextWidth(subtitle);
      const subtitleX = (layout.pageWidth - subtitleWidth) / 2;
      doc.text(subtitle, subtitleX, layout.pageMargin + 35 + ((lines.length - 1) * 16));
    }
  } else {
    // Título cabe em uma linha
    const titleX = (layout.pageWidth - titleWidth) / 2;
    doc.text(title, titleX, layout.pageMargin + 20);
    
    // Adicionar subtítulo se fornecido
    if (subtitle) {
      applyFont(doc, 'normal');
      const subtitleWidth = doc.getTextWidth(subtitle);
      const subtitleX = (layout.pageWidth - subtitleWidth) / 2;
      doc.text(subtitle, subtitleX, layout.pageMargin + 35);
    }
  }
}

/**
 * Adiciona informações de data no canto superior direito
 */
export function addDateInfo(
  doc: jsPDF,
  layout: PDFLayoutConfig,
  dateText1: string,
  dateText2?: string
) {
  applyFont(doc, 'normal');
  
  doc.text(
    dateText1,
    layout.pageWidth - layout.pageMargin - doc.getTextWidth(dateText1),
    layout.pageMargin + 10
  );
  
  if (dateText2) {
    doc.text(
      dateText2,
      layout.pageWidth - layout.pageMargin - doc.getTextWidth(dateText2),
      layout.pageMargin + 25
    );
  }
}

/**
 * Adiciona rodapé com numeração de páginas e informações do usuário
 */
export function addFooter(
  doc: jsPDF,
  layout: PDFLayoutConfig,
  currentPage: number,
  totalPages: number,
  userName?: string,
  userId?: string
) {
  applyFont(doc, 'footer');
  const footerY = layout.pageHeight - layout.pageMargin + 10;
  
  // Numeração de páginas no canto direito
  const pageText = `Página ${currentPage} de ${totalPages}`;
  doc.text(
    pageText,
    layout.pageWidth - layout.pageMargin - doc.getTextWidth(pageText),
    footerY
  );
  
  // Informações do usuário no canto esquerdo
  if (userName && userId) {
    const userText = `Gerado por: ${userName} (ID: ${userId})`;
    doc.text(userText, layout.pageMargin, footerY);
  }
}

/**
 * Cria uma nova instância de jsPDF com configurações padrão
 */
export function createStandardPDF(): Promise<jsPDF> {
  return import('jspdf').then(({ jsPDF }) => {
    return new jsPDF({
      orientation: PDF_CONFIG.orientation,
      unit: PDF_CONFIG.unit,
      format: PDF_CONFIG.format
    });
  });
}

/**
 * Configurações padrão para tabelas autoTable
 */
export const TABLE_CONFIG = {
  theme: 'grid' as const,
  headStyles: {
    fillColor: PDF_CONFIG.colors.primary,
    textColor: PDF_CONFIG.colors.white,
    font: PDF_CONFIG.fonts.normal.family,
    fontSize: PDF_CONFIG.fonts.normal.size
  },
  styles: {
    font: PDF_CONFIG.fonts.normal.family,
    fontSize: PDF_CONFIG.fonts.small.size,
    cellPadding: 4
  },
  alternateRowStyles: {
    fillColor: PDF_CONFIG.colors.background
  }
};

/**
 * Aplica margens padrão para tabelas autoTable
 */
export function getTableMargins(layout: PDFLayoutConfig) {
  return {
    left: layout.pageMargin,
    right: layout.pageMargin,
    top: layout.pageMargin,
    bottom: layout.pageMargin
  };
}