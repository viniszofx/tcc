import type { BemCopia } from "@/lib/interface"
import { formatDate } from "@/utils/data-utils"

/**
 * Generate a PDF from inventory data
 * @param items Inventory items to include in the PDF
 * @param fileName Name for the downloaded file
 */
export function exportToPdf(items: BemCopia[], fileName = "inventario"): void {
  import("jspdf").then(({ default: jsPDF }) => {
    import("jspdf-autotable").then(({ default: autoTable }) => {
      const doc = new jsPDF({
        orientation: "landscape",
      })

      doc.setFontSize(18)
      doc.text("Relatório de Inventário", 14, 22)

      doc.setFontSize(10)
      doc.text(`Data de Exportação: ${formatDate(new Date().toISOString())}`, 14, 30)
      doc.text(`Total de Itens: ${items.length}`, 14, 35)

      const columns = [
        { header: "Número", dataKey: "NUMERO" },
        { header: "Status", dataKey: "STATUS" },
        { header: "Descrição", dataKey: "DESCRICAO" },
        { header: "Responsável", dataKey: "RESPONSABILIDADE_ATUAL" },
        { header: "Setor", dataKey: "SETOR_DO_RESPONSAVEL" },
        { header: "Campus", dataKey: "CAMPUS_DA_LOTACAO_DO_BEM" },
        { header: "Sala", dataKey: "SALA" },
        { header: "Conservação", dataKey: "ESTADO_DE_CONSERVACAO" },
        { header: "ED", dataKey: "ED" },
        { header: "Rótulos", dataKey: "ROTULOS" },
      ]

      const tableData = items.map((item) => {
        return {
          NUMERO: item.NUMERO || "",
          STATUS: item.STATUS || "",
          DESCRICAO: item.DESCRICAO
            ? item.DESCRICAO.length > 40
              ? item.DESCRICAO.substring(0, 40) + "..."
              : item.DESCRICAO
            : "",
          RESPONSABILIDADE_ATUAL: item.RESPONSABILIDADE_ATUAL || "",
          SETOR_DO_RESPONSAVEL: item.SETOR_DO_RESPONSAVEL || "",
          CAMPUS_DA_LOTACAO_DO_BEM: item.CAMPUS_DA_LOTACAO_DO_BEM || "",
          SALA: item.SALA || "",
          ESTADO_DE_CONSERVACAO: item.ESTADO_DE_CONSERVACAO || "",
          ED: item.ED || "",
          ROTULOS: item.ROTULOS || "",
        }
      })

      autoTable(doc, {
        startY: 40,
        head: [columns.map((col) => col.header)],
        body: tableData.map((item) => columns.map((col) => item[col.dataKey as keyof typeof item])),
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        columnStyles: {
          DESCRICAO: { cellWidth: 50 },
          RESPONSABILIDADE_ATUAL: { cellWidth: 40 },
          SETOR_DO_RESPONSAVEL: { cellWidth: 30 },
        },
      })

      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.text(
          `Página ${i} de ${pageCount}`,
          doc.internal.pageSize.getWidth() - 30,
          doc.internal.pageSize.getHeight() - 10,
        )
      }

      doc.save(`${fileName}_${new Date().toISOString().split("T")[0]}.pdf`)
    })
  })
}
