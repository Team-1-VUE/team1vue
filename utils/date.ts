/*
 * Get today's date as a string in YYYY-MM-DD format
 * @returns Today's date as a string
*/
export function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0] as string;
}