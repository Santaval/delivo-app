// import * as Localization from 'expo-localization'; // Use react-native-localize for bare apps
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import es from './locales/es.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // Detect system language
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
  });

export default i18n;