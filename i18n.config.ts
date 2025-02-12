import { defineI18nConfig } from 'i18n';
export default defineI18nConfig(() => ({
	locales: [
		{ code: 'ko', name: '한국어', iso: 'ko-KR', file: 'ko.json' },
		{ code: 'en', name: 'English', iso: 'en-US', file: 'en.json' },
	],
	defaultLocale: 'ko',
	lazy: true,
	langDir: 'i18n/',
}));
