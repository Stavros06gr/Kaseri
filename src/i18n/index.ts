import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import el from './locales/el.json';

const resources = {
  en: { translation: en },
  gr: { translation: el } // Χρησιμοποιούμε το 'gr' όπως ορίστηκε στο Zustand store
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Προεπιλεγμένη γλώσσα βάσει των προδιαγραφών σου
    fallbackLng: 'gr',
    interpolation: {
      escapeValue: false // Το React προστατεύει ήδη από XSS επιθέσεις
    }
  });

export default i18n;