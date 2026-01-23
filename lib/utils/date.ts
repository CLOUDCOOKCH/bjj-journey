/**
 * Format a Date object to a YYYY-MM-DD string in local time (not UTC)
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get today's date as a YYYY-MM-DD string in local time
 */
export function getTodayAsYYYYMMDD(): string {
  return formatDateToYYYYMMDD(new Date())
}

/**
 * Format a date string (YYYY-MM-DD) for display, avoiding UTC conversion issues
 * @param dateString - Date string in YYYY-MM-DD format
 * @param options - Intl.DateTimeFormatOptions for custom formatting
 */
export function formatDateString(
  dateString: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const [year, month, day] = dateString.split('-').map(Number)

  // Create date at local noon to avoid any timezone issues
  const date = new Date(year, month - 1, day, 12, 0, 0)

  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }

  return date.toLocaleDateString('en-US', options || defaultOptions)
}

/**
 * Compare two date strings (YYYY-MM-DD format) and return the difference in days
 * @param dateStr1 - First date string
 * @param dateStr2 - Second date string
 * @returns Number of days between dates (positive if dateStr1 is later)
 */
export function compareDates(dateStr1: string, dateStr2: string): number {
  const [year1, month1, day1] = dateStr1.split('-').map(Number)
  const [year2, month2, day2] = dateStr2.split('-').map(Number)

  const date1 = new Date(year1, month1 - 1, day1)
  const date2 = new Date(year2, month2 - 1, day2)

  const diffTime = date1.getTime() - date2.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Check if a date string (YYYY-MM-DD) is on or after a given Date
 * @param dateStr - Date string to check
 * @param compareDate - Date to compare against
 */
export function isDateOnOrAfter(dateStr: string, compareDate: Date): boolean {
  const compareStr = formatDateToYYYYMMDD(compareDate)
  return dateStr >= compareStr
}

/**
 * Check if a date string (YYYY-MM-DD) is between two dates (inclusive)
 * @param dateStr - Date string to check
 * @param startDate - Start date
 * @param endDate - End date
 */
export function isDateBetween(dateStr: string, startDate: Date, endDate: Date): boolean {
  const startStr = formatDateToYYYYMMDD(startDate)
  const endStr = formatDateToYYYYMMDD(endDate)
  return dateStr >= startStr && dateStr <= endStr
}
