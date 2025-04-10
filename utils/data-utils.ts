/**
 * Formats a date string to a localized format
 * @param dateString Date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date): string {
    if (!dateString) return "-"
  
    const date = typeof dateString === "string" ? new Date(dateString) : dateString

    if (isNaN(date.getTime())) return "-"
  
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }
  
  /**
   * Formats a date string to a localized format with time
   * @param dateString Date string to format
   * @returns Formatted date string with time
   */
  export function formatDateTime(dateString: string | Date): string {
    if (!dateString) return "-"
  
    const date = typeof dateString === "string" ? new Date(dateString) : dateString

    if (isNaN(date.getTime())) return "-"
  
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }
  