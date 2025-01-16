import { setLocale } from 'yup';

export default defineNuxtPlugin(nuxtApp => {
	setLocale({
		string: {
			min: '${min}자리 이상 입력해 주세요',
		},
		number: {
			min: '${min} 이상의 값을 입력해 주세요.',
		},
		mixed: {
			required: '${label} 입력해 주세요.',
		},
	});
});
