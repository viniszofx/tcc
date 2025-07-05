import { BemCopia, Campus, Comissao, EstadoConservacao, StatusBem, Usuario } from '@/types/legacy';

export async function exportToPdfStyled(
  items: BemCopia[],
  fileName = "inventario",
  comissao: Comissao,
  campus: Campus,
  presidente: Usuario,
  inventariante: Usuario,
  dataAbertura: Date,
  dataFechamento: Date,
  displayFields: string[]
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const fieldLabels: Record<string, string> = {
    NUMERO: "Número",
    MARCA_MODELO: "Marca/Modelo",
    RESPONSABILIDADE_ATUAL: "Responsável",
    SETOR_DO_RESPONSAVEL: "Setor",
    CAMPUS_DA_LOTACAO_DO_BEM: "Campus",
    SALA: "Sala",
    ESTADO_DE_CONSERVACAO: "Estado de Conservação",
    data_ultima_atualizacao: "Data de Atualização",
    ED: "ED",
    ROTULOS: "Rótulos",
    DESCRICAO: "Descrição",
    STATUS: "Status"
  };

  const formatDate = (date: Date) => date.toLocaleDateString('pt-BR');
  const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(
    `Relatório da Comissão nº ${comissao.comissao_id} do Campus ${campus.nome}`,
    40,
    40
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Aberto em ${formatDate(dataAbertura)} às ${formatTime(dataAbertura)}`, 400, 30);
  doc.text(`Fechado em ${formatDate(dataFechamento)} às ${formatTime(dataFechamento)}`, 400, 45);

  doc.text("Lista dos Participantes:", 40, 65);
  doc.text(`- Presidente: ${presidente.nome}`, 50, 80);
  doc.text(`- Inventariante: ${inventariante.nome}`, 50, 95);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Análise geral", 40, 130);

  const boxY = 140;
  const boxWidth = 150;
  const boxHeight = 60;
  const spacing = 30;
  const startX = 40;

  const totalItens = items.length;
  const encontrados = items.filter(
    (i) => i.STATUS !== StatusBem.BAIXADO
  ).length;
  const inserviveis = items.filter(
    (i) => i.ESTADO_DE_CONSERVACAO === EstadoConservacao.INSERVIVEL
  ).length;

  const drawBox = (x: number, title: string, value: string) => {
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(x, boxY, boxWidth, boxHeight, 6, 6, "F");
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text(title, x + 10, boxY + 20);
    doc.setFontSize(16);
    doc.text(value, x + 10, boxY + 45);
  };

  drawBox(startX, "Total de Itens", `${totalItens}`);
  drawBox(startX + boxWidth + spacing, "Itens Encontrados", `${encontrados}`);
  drawBox(startX + 2 * (boxWidth + spacing), "Itens Inservíveis", `${inserviveis}`);

  const grouped = items.reduce((acc, item) => {
    const key = item.SALA || item.SETOR_DO_RESPONSAVEL || "SEM LOCALIZAÇÃO";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, BemCopia[]>);

  const sortedLocais = Object.keys(grouped).sort();
  let startY = boxY + boxHeight + 40;

  const defaultFields = ['DESCRICAO', 'STATUS'];

  const allFieldsToDisplay = [...new Set([...defaultFields, ...displayFields])];

  const tableHeaders = allFieldsToDisplay.map(field => fieldLabels[field] || field);

  sortedLocais.forEach((local, index) => {
    if (index !== 0) {
      doc.addPage();
      startY = 40;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Local: ${local}`, 40, startY);

    const truncateDescription = (description: string) => {
      const index = description.indexOf('[');
      return index >= 0 ? description.substring(0, index).trim() : description;
    };

    const getItemField = (item: BemCopia, field: string): string => {
      switch (field) {
        case 'NUMERO': return item.NUMERO;
        case 'MARCA_MODELO': return item.MARCA_MODELO;
        case 'RESPONSABILIDADE_ATUAL': return item.RESPONSABILIDADE_ATUAL;
        case 'SETOR_DO_RESPONSAVEL': return item.SETOR_DO_RESPONSAVEL;
        case 'CAMPUS_DA_LOTACAO_DO_BEM': return item.CAMPUS_DA_LOTACAO_DO_BEM;
        case 'SALA': return item.SALA;
        case 'ESTADO_DE_CONSERVACAO': return item.ESTADO_DE_CONSERVACAO;
        case 'data_ultima_atualizacao':
          return item.data_ultima_atualizacao ? new Date(item.data_ultima_atualizacao).toLocaleDateString('pt-BR') : '-';
        case 'ED': return item.ED;
        case 'ROTULOS': return item.ROTULOS;
        case 'DESCRICAO': return truncateDescription(item.DESCRICAO);
        case 'STATUS': return item.STATUS;
        default: return '-';
      }
    };

    const tableBody = grouped[local].map((item) => {
      return allFieldsToDisplay.map(field => getItemField(item, field));
    });

    autoTable(doc, {
      startY: startY + 10,
      head: [tableHeaders],
      body: tableBody,
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
      },
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: 40, right: 40 },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
      }
    });
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() - 80,
      doc.internal.pageSize.getHeight() - 20
    );
  }

  const today = new Date();
  doc.save(
    `${fileName}_${comissao.comissao_id}_${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}.pdf`
  );
}