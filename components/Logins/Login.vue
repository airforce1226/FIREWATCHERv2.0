<template>
	<div
		class="w-[550px] h-full absolute right-0 z-10 flex flex-col justify-center items-center login-form-cover"
	>
		<div v-if="SITE === '강원도청'" class="flex flex-col items-center">
			<img src="@/assets/svgs/gwd-logo.svg" class="w-60 mb-10" />
		</div>

		<div v-else class="flex flex-col items-center">
			<img src="@/assets/svgs/dara-logo.svg" class="w-48" />
			<span class="d-block my-3">for</span>
			<img src="@/assets/svgs/firewatcher-text-logo.svg" class="w-48 mb-14" />
		</div>

		<label class="relative block">
			<span class="absolute inset-y-0 left-0 flex items-center pl-3">
				<el-icon color="#ffffff"><User /></el-icon>
			</span>
			<input
				v-model="id"
				class="placeholder:text-[#ffffffab] placeholder:text-sm text-white block bg-[#FFFFFF4D] w-[310px] py-2.5 pl-9 pr-3 rounded focus:outline-none focus:border-[#cd4c54] focus:ring-[#cd4c54] focus:ring-1"
				readonly
				onfocus="this.removeAttribute('readonly');"
				placeholder="아이디"
				type="text"
			/>
		</label>
		<label class="relative block mt-2.5 mb-10">
			<span class="absolute inset-y-0 left-0 flex items-center pl-3">
				<el-icon color="#ffffff"><Lock /></el-icon>
			</span>
			<input
				v-model="pw"
				class="placeholder:text-[#ffffffab] placeholder:text-sm text-white block bg-[#FFFFFF4D] w-[310px] py-2.5 pl-9 pr-3 rounded focus:outline-none focus:border-[#cd4c54] focus:ring-[#cd4c54] focus:ring-1"
				readonly
				onfocus="this.removeAttribute('readonly');"
				placeholder="비밀번호"
				type="password"
				@keydown.enter="login"
			/>
		</label>

		<el-button
			type="primary"
			style="width: 310px"
			size="large"
			@click="login"
			:disabled="!id || !pw"
		>
			로그인
		</el-button>
		<br />
	</div>
</template>
<script setup>
import { User, Lock } from '@element-plus/icons-vue';
import cryptojs from 'crypto-js';

const router = useRouter();
const { message } = useAlarm();

const id = ref('');
const pw = ref('');
const encryptedID = ref('');
const encryptedPW = ref('');

sessionStorage.clear();

const login = async () => {
	if (!id.value || !pw.value) {
		message.error('ID/PW 미입력');
	} else {
		encryptedID.value = cryptojs.AES.encrypt(id.value, 'idSalt').toString();
		encryptedPW.value = cryptojs.AES.encrypt(pw.value, '').toString();
		try {
			const res = await $fetch.raw(`${BASE_URL}/master/signin/1`, {
				method: 'POST',
				body: {
					ID: encryptedID.value,
					PASSWORD: encryptedPW.value,
				},
			});
			if (res.status === 200) {
				sessionStorage.setItem('isActive', res._data.isActive);
				sessionStorage.setItem('smsActive', res._data.smsActive); // true -> 도청, 지역 둘다 사용// false -> 지역 시
				sessionStorage.setItem('ID', res._data.id);
				sessionStorage.setItem('USER', JSON.stringify(res));
				message.success('로그인 성공');
				sessionStorage.setItem('login', true);
				if (res._data.address) {
					sessionStorage.setItem('L2Login', JSON.stringify(res._data.address));
				}
				SOCKET.emit('login', res);
				router.push('/dashboard');
			}
		} catch (error) {
			if (error.status === 401) {
				message.error('아이디 또는 비밀번호 오류.');
				id.value = '';
				pw.value = '';
			}
			console.log(error);
		}
	}
};
</script>
<style scoped>
.login-form-cover {
	border-radius: 0 8px 8px 0;
	background-color: rgba(255, 255, 255, 0.05);
	backdrop-filter: blur(52px);
	border: 1px solid #9c9c9c1e;
}
</style>
