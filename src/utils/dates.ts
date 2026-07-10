import { format, isWithinInterval, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { el, enUS } from 'date-fns/locale';

/**
 * Μορφοποιεί μια ημερομηνία σε string ανάλογα με τη γλώσσα
 * Παράδειγμα: "dd MMM yyyy" -> "10 Ιουλ 2026" (για ελληνικά)
 */
export const formatDate = (date: Date | number, pattern = 'dd/MM/yyyy', lang: 'en' | 'gr' = 'gr'): string => {
  const currentLocale = lang === 'gr' ? el : enUS;
  try {
    return format(date, pattern, { locale: currentLocale });
  } catch (error) {
    return '';
  }
};

/**
 * Ελέγχει αν μια ημερομηνία (ή η σημερινή) βρίσκεται ανάμεσα σε δύο άλλες.
 * Χρησιμοποιείται για να δούμε αν ένα ταξίδι "τρέχει" αυτή τη στιγμή.
 */
export const isTripActive = (startDate: Date | number, endDate: Date | number): boolean => {
  try {
    const now = new Date();
    return isWithinInterval(now, { start: startDate, end: endDate });
  } catch (error) {
    return false;
  }
};

/**
 * Επιστρέφει την αρχή και το τέλος του μήνα για μια ημερομηνία.
 * Απαραίτητο για τα μηνιαία summaries και τα φίλτρα του ιστορικού.
 */
export const getMonthBounds = (date: Date = new Date()) => {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
};

/**
 * Μετατρέπει ένα string (π.χ. από API ή ISO string) σε αντικείμενο Date με ασφάλεια
 */
export const parseDateSafe = (dateStr: string): Date => {
  try {
    return parseISO(dateStr);
  } catch (error) {
    return new Date();
  }
};