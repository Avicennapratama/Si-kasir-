/**
 * Date utility functions for transaction handling
 */

export const todayString = (): string => new Date().toISOString().split('T')[0];

export const yesterdayString = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

export const parseDateString = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  const match = dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
  if (!match) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const formatDateForFirestore = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isFutureDate = (dateStr: string): boolean => {
  const date = parseDateString(dateStr);
  if (!date) return false;
  return date > new Date();
};

export const isPastDate = (dateStr: string, daysAgo = 3650): boolean => {
  const date = parseDateString(dateStr);
  if (!date) return false;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysAgo);
  return date < cutoff;
};