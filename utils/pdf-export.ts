// Define the BemCopia type if not imported from elsewhere
type BemCopia = {
  NOME?: string;
  LOCALIZACAO?: string;
  ESTADO_DE_CONSERVACAO?: string;
  STATUS?: string;
};

export function exportToPdfStyled(
  items: BemCopia[],
  fileName = "inventario",
  comissao: number,
  campus: string,
  presidente: string,
  inventariante: string,
  dataAbertura: string,
  dataFechamento: string
): void {
  import("jspdf").then(({ default: jsPDF }) => {
    import("jspdf-autotable").then((autoTableModule) => {
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" })
      const autoTable = autoTableModule.default

      // Título
      doc.setFont("helvetica", "bold")
      doc.setFontSize(14)
      doc.text(`Relatório da Comissão nº ${comissao} do Campus ${campus}`, 40, 40)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`Aberto em ${dataAbertura} às xx:xx`, 400, 30)
      doc.text(`Fechado em ${dataFechamento} às xx:xx`, 400, 45)

      // Participantes
      doc.text("Lista dos Participantes:", 40, 65)
      doc.text(`- Presidente: ${presidente}`, 50, 80)
      doc.text(`- Inventariante: ${inventariante}`, 50, 95)

      // Resumo
      doc.setFont("helvetica", "bold")
      doc.setFontSize(12)
      doc.text("Análise geral", 40, 130)

      const boxY = 140
      const boxWidth = 150
      const boxHeight = 60
      const spacing = 30
      const startX = 40

      const totalItens = items.length
      const encontrados = items.filter((i) => i.STATUS !== "NÃO ENCONTRADO").length
      const inserviveis = items.filter((i) =>
        i.ESTADO_DE_CONSERVACAO?.toLowerCase().includes("inserv")
      ).length

      const drawBox = (x: number, title: string, value: string) => {
        doc.setFillColor(245, 245, 245)
        doc.roundedRect(x, boxY, boxWidth, boxHeight, 6, 6, "F")
        doc.setTextColor(0)
        doc.setFontSize(10)
        doc.text(title, x + 10, boxY + 20)
        doc.setFontSize(16)
        doc.text(value, x + 10, boxY + 45)
      }

      drawBox(startX, "Total de Itens", `${totalItens}`)
      drawBox(startX + boxWidth + spacing, "Itens Encontrados", `${encontrados}`)
      drawBox(startX + 2 * (boxWidth + spacing), "Itens Inservíveis", `${inserviveis}`)

      // 🔠 Ordenar por LOCALIZACAO
      const grouped = items.reduce((acc, item) => {
        const key = item.LOCALIZACAO || "SEM LOCALIZAÇÃO"
        if (!acc[key]) acc[key] = []
        acc[key].push(item)
        return acc
      }, {} as Record<string, BemCopia[]>)

      const sortedLocais = Object.keys(grouped).sort()

      let startY = boxY + boxHeight + 40

      sortedLocais.forEach((local, index) => {
        if (index !== 0) {
          doc.addPage()
          startY = 40
        }

        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.text(`Local: ${local}`, 40, startY)

        autoTable(doc as import("jspdf").jsPDF, {
          startY: startY + 10,
          head: [["Nome", "Local", "Estado", "Status"]] as [string, string, string, string][],
          body: grouped[local].map((item: BemCopia): [string, string, string, string] => [
            item.NOME || "",
            item.LOCALIZACAO || "",
            item.ESTADO_DE_CONSERVACAO || "",
            item.STATUS || "",
          ]),
          theme: "grid" as "grid",
          headStyles: { fillColor: [41, 128, 185], textColor: 255 } as import("jspdf-autotable").Styles,
          styles: { font: "helvetica", fontSize: 9, cellPadding: 4 } as import("jspdf-autotable").Styles,
          alternateRowStyles: { fillColor: [245, 245, 245] } as import("jspdf-autotable").Styles,
          margin: { left: 40, right: 40 },
        })
      })

      // 📄 Número da página no rodapé
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(9)
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() - 80, doc.internal.pageSize.getHeight() - 20)
      }

      // 💾 Salvar
      doc.save(`${fileName}_${items.length}_itens_${new Date().toISOString().split("T")[0]}.pdf`)
    })
  })
}
