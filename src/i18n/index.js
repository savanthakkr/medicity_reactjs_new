import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import languageDetector from 'i18next-browser-languagedetector';
import settingsBn from './locales/bn/settings.json';
import settingsEn from './locales/en/settings.json';
import settingsEs from './locales/es/settings.json';
import settingsHi from './locales/hi/settings.json';

i18next
	.use(initReactI18next)
	.use(languageDetector)
	.init({
		fallbackLng: 'en',
		resources: {
			en: {
				settings: settingsEn
			},
			bn: {
				settings: settingsBn
			},
			hi: {
				settings: settingsHi
			},
			es: {
				settings: settingsEs
			}
		}
	});
