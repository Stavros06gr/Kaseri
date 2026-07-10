import Big from 'big.js';

/**
 * Ακριβής πρόσθεση δύο αριθμών
 */
export const add = (a: number, b: number): number => {
  return new Big(a).plus(b).toNumber();
};

/**
 * Ακριβής αφαίρεση δύο αριθμών (a - b)
 */
export const subtract = (a: number, b: number): number => {
  return new Big(a).minus(b).toNumber();
};

/**
 * Ακριβής πολλαπλασιασμός δύο αριθμών
 */
export const multiply = (a: number, b: number): number => {
  return new Big(a).times(b).toNumber();
};

/**
 * Ακριβής διαίρεση δύο αριθμών (a / b)
 */
export const divide = (a: number, b: number): number => {
  if (b === 0) return 0;
  return new Big(a).div(b).toNumber();
};

/**
 * Μορφοποίηση αριθμού σε string με 2 δεκαδικά ψηφία (π.χ. 1250.5 -> "1250.50")
 * Ιδανικό για εμφάνιση τιμών στο UI.
 */
export const formatMoney = (amount: number): string => {
  try {
    return new Big(amount).toFixed(2);
  } catch (error) {
    return '0.00';
  }
};