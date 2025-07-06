import { BemCopia, Campus, Comissao, EstadoConservacao, StatusBem, Usuario } from '@/types/legacy';
import {
  calculatePDFLayout,
  addHeader,
  addDateInfo,
  addFooter,
  applyFont,
  createStandardPDF,
  TABLE_CONFIG,
  getTableMargins
} from './pdf-template';

export async function exportToPdfStyled(
  items: BemCopia[],
  fileName = "inventario",
  comissao: Comissao,
  campus: Campus,
  presidente: Usuario,
  inventariante: Usuario,
  dataAbertura: Date,
  dataFechamento: Date,
  displayFields: string[],
  commissionId?: string,
  currentUser?: { id: string; name?: string; email?: string }
): Promise<void> {
  const { default: autoTable } = await import("jspdf-autotable");
  
  // Criar PDF com configurações padrão
  const doc = await createStandardPDF();
  const layout = calculatePDFLayout(doc);

  // Gerar número único do relatório
  const reportNumber = `REL-${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}-${Date.now().toString().slice(-6)}`;

  // Buscar dados reais da comissão, campus e membros se commissionId for fornecido
  let realComissao = comissao;
  let realCampus = campus;
  let realPresidente = presidente;
  let realInventariante = inventariante;
  
  if (commissionId) {
    try {
      // Buscar dados da comissão
      const commissionResponse = await fetch(`/api/commission?id=${commissionId}`);
      if (commissionResponse.ok) {
        const commissionData = await commissionResponse.json();
        if (commissionData) {
          realComissao = {
            comissao_id: commissionData.id,
            nome: commissionData.name || "Comissão Desconhecida",
            tipo: commissionData.type || "Desconhecida",
            campus_id: commissionData.campusId || ""
          };
          
          // Buscar dados do campus se temos o campusId
          if (commissionData.campusId) {
            const campusResponse = await fetch(`/api/campus?id=${commissionData.campusId}`);
            if (campusResponse.ok) {
              const campusData = await campusResponse.json();
              if (campusData) {
                realCampus = {
                  campus_id: campusData.id,
                  nome: campusData.name || "Campus Desconhecido",
                  campus_codigo: campusData.code || "",
                  campus_ativo: campusData.active ?? true
                };
              }
            }
          }
        }
      }
      
      // Buscar dados dos membros da comissão
      const membersResponse = await fetch(`/api/commission-member?commissionId=${commissionId}`);
      if (membersResponse.ok) {
        const members = await membersResponse.json();
        const presidenteMember = members.find((m: any) => m.roleInCommission === "Presidente");
        const inventarianteMember = members.find((m: any) => m.roleInCommission === "Membro" || m.roleInCommission === "Secretário");
        
        if (presidenteMember) {
          realPresidente = {
            usuario_id: presidenteMember.user.id,
            nome: presidenteMember.user.name || presidenteMember.user.email,
            papel: "Presidente",
            email: presidenteMember.user.email,
            habilitado: true,
            organizacao_id: ""
          };
        }
        
        if (inventarianteMember) {
          realInventariante = {
            usuario_id: inventarianteMember.user.id,
            nome: inventarianteMember.user.name || inventarianteMember.user.email,
            papel: "Inventariante",
            email: inventarianteMember.user.email,
            habilitado: true,
            organizacao_id: ""
          };
        }
      }
    } catch (error) {
      console.warn("Erro ao buscar dados da comissão, campus ou membros:", error);
    }
  }

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

  // Cabeçalho do relatório com número único
  const title = `Relatório da Comissão ${realComissao.nome || 'Desconhecida'} do ${realCampus.nome}`;
  const subtitle = `ID: ${realComissao.comissao_id} | Relatório Nº: ${reportNumber}`;
  addHeader(doc, layout, title, subtitle);

  // Calcular altura do cabeçalho dinamicamente
  applyFont(doc, 'title');
  const titleWidth = doc.getTextWidth(title);
  const titleLines = titleWidth > layout.contentWidth ? Math.ceil(titleWidth / layout.contentWidth) : 1;
  const headerHeight = 35 + ((titleLines - 1) * 16) + (subtitle ? 15 : 0);

  // Informações de data no canto superior direito (posicionadas abaixo do cabeçalho)
  const dateText1 = `Aberto em ${formatDate(dataAbertura)} às ${formatTime(dataAbertura)}`;
  const dateText2 = `Fechado em ${formatDate(dataFechamento)} às ${formatTime(dataFechamento)}`;
  
  applyFont(doc, 'small');
  const dateY1 = layout.pageMargin + headerHeight + 10;
  const dateY2 = layout.pageMargin + headerHeight + 25;
  
  doc.text(
    dateText1,
    layout.pageWidth - layout.pageMargin - doc.getTextWidth(dateText1),
    dateY1
  );
  
  doc.text(
    dateText2,
    layout.pageWidth - layout.pageMargin - doc.getTextWidth(dateText2),
    dateY2
  );

  // Lista dos participantes
  const participantesY = layout.pageMargin + headerHeight + 45;
  applyFont(doc, 'normal');
  doc.text("Lista dos Participantes:", layout.pageMargin, participantesY);
  doc.text(`- Presidente: ${realPresidente.nome}`, layout.pageMargin + 10, participantesY + 15);
  
  // Verificar se há inventariante válido
  const inventarianteNome = realInventariante.nome && realInventariante.nome !== "Inventariante Desconhecido" 
    ? realInventariante.nome 
    : "Sem inventariantes";
  
  doc.text(`- Inventariante: ${inventarianteNome}`, layout.pageMargin + 10, participantesY + 30);

  // Seção de análise geral
  const analiseY = participantesY + 55;
  applyFont(doc, 'subtitle');
  doc.text("Análise geral", layout.pageMargin, analiseY);

  const boxY = analiseY + 20;
  const boxWidth = (layout.contentWidth - 60) / 3; // Dividir igualmente com espaçamento
  const boxHeight = 60;
  const spacing = 30;
  const startX = layout.pageMargin;

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
      startY = layout.pageMargin + 20;
    }

    applyFont(doc, 'subtitle');
    doc.text(`Local: ${local}`, layout.pageMargin, startY);

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
      ...TABLE_CONFIG,
      margin: getTableMargins(layout),
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
      }
    });
  });

  // Adicionar rodapé com numeração de páginas e informações do usuário
  const pageCount = doc.getNumberOfPages();
  const userName = currentUser?.name || currentUser?.email || 'Usuário Desconhecido';
  const userId = currentUser?.id || 'ID Desconhecido';
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter(doc, layout, i, pageCount, userName, userId);
  }

  const today = new Date();
  doc.save(
    `${fileName}_${reportNumber}_${realComissao.comissao_id}_${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}.pdf`
  );
}