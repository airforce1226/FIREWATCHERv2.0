<template>
	<div
		class="absolute translate-x-[-50%] translate-y-[-50%] top-1/2 left-1/2 flex items-center"
	>
		<div
			class="w-[1300px] h-[760px] bg-gradient-to-r from-[#343434] to-[#34343473] rounded-xl relative"
		>
			<img
				src="/login-logo.png"
				class="w-4/5 absolute top-1/2 left-[-5%] translate-y-[-50%]"
			/>
			<LoginsSignUp v-if="permission" />
			<LoginsLogin v-else />
		</div>
	</div>
</template>
<script setup>
import { useI18n } from 'vue-i18n'; // Import useI18n

const { t } = useI18n(); // Destructure t from useI18n
sessionStorage.clear();
definePageMeta({
	layout: '',
});

let temp = addressL1L2L3.filter(
	item =>
		item.L1 === '경상북도' ||
		item.L1 === '경상남도' ||
		item.L1 === '대구광역시',
);
let randomCity = temp[parseInt(Math.random() * (temp.length - 1))];
// console.log(`${randomCity.L1} ${randomCity.L2} ${randomCity.L3}`);

const { message } = useAlarm();
const permission = ref(false);

const checkAdminAccountExists = async () => {
	try {
		const res = await $fetch.raw(`${BASE_URL}/master/create/1`, {
			method: 'GET',
		});
		if (res.status === 204) {
			message.warning(t('no_accounts_created'));
			message.warning(t('create_account_first'));
			permission.value = true;
		}
	} catch (error) {
		console.log(error);
	}
};
checkAdminAccountExists();
</script>
<style scoped></style>
