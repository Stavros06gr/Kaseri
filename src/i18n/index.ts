import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 1. Εισαγωγή όλων των μεταφράσεων (και των νέων)
import en from './locales/en.json';
import el from './locales/el.json';
import de from './locales/de.json'; // 👈 Γερμανικά
import es from './locales/es.json'; // 👈 Ισπανικά
import pt from './locales/pt.json'; // 👈 Πορτογαλικά

const resources = {
  en: { translation: en },
  el: { translation: el }, // 👈 Αλλαγή από 'gr' σε 'el' για να ταιριάζει με το i18nCode mapping του Store
  de: { translation: de }, // 👈 Προσθήκη Γερμανικών
  es: { translation: es }, // 👈 Προσθήκη Ισπανικών
  pt: { translation: pt }  // 👈 Προσθήκη Πορτογαλικών
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Προεπιλεγμένη γλώσσα της εφαρμογής
    fallbackLng: 'en', // 👈 Αλλαγή σε 'en' (είναι ασφαλέστερο αν λείπει κάποιο key σε άλλες γλώσσες)
    interpolation: {
      escapeValue: false // Το React προστατεύει ήδη από XSS επιθέσεις
    }
  });

export default i18n;