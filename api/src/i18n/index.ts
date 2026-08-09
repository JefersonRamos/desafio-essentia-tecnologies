import i18next from 'i18next';
import { LanguageDetector, handle } from 'i18next-http-middleware';
import { enUS } from './locales/en-US.js';
import { ptBR } from './locales/pt-BR.js';

export const SUPPORTED_LANGUAGES = ['pt-BR', 'pt', 'en-US', 'en'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export async function initI18n(): Promise<void> {
  await i18next.use(LanguageDetector).init({
    fallbackLng: 'pt-BR',
    supportedLngs: [...SUPPORTED_LANGUAGES],
    resources: {
      'pt-BR': { translation: ptBR },
      pt: { translation: ptBR },
      'en-US': { translation: enUS },
      en: { translation: enUS },
    },
    detection: {
      order: ['querystring', 'header'],
      lookupQuerystring: 'lang',
    },
    interpolation: { escapeValue: false },
  });
}

export const i18nMiddleware = handle(i18next);
