// plugins/i18n.js
import { createI18n } from 'vue-i18n';
import en from '../locales/en.json';
import ko from '../locales/ko.json';
import vi from '../locales/vi.json';

const messages = {
	en,
	ko,
	vi,
};

const i18n = createI18n({
	locale: 'vi', // 기본 언어 설정
	messages,
});

export default defineNuxtPlugin(nuxtApp => {
	nuxtApp.vueApp.use(i18n); // i18n을 Vue 애플리케이션에 등록
});
