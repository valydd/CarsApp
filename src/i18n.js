import ro from './locales/ro.json';
import en from './locales/en.json';
import de from './locales/de.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import tr from './locales/tr.json';
import hu from './locales/hu.json';
import cs from './locales/cs.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import languages from './locales/languages.json';

export const AVAILABLE_LANGUAGES = languages;

export const translations = {
  ro,
  en,
  de,
  fr,
  it,
  es,
  pt,
  nl,
  pl,
  tr,
  hu,
  cs,
  zh,
  ja,
  ko
};

export const getLanguageConfig = (code = 'ro') => {
  return AVAILABLE_LANGUAGES.find(l => l.code === code) || AVAILABLE_LANGUAGES[0];
};

export const getTranslation = (lang = 'ro', key, fallback = '') => {
  const dict = translations[lang] || translations.ro || translations.en;
  if (!dict) return fallback || key;
  return dict[key] || (translations.ro && translations.ro[key]) || (translations.en && translations.en[key]) || fallback || key;
};

