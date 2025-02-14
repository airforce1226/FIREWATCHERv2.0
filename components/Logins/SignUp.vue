<template>
	<div
		class="w-[550px] h-full absolute right-0 z-10 flex flex-col justify-center items-center login-form-cover"
	>
		<div v-if="registered" class="flex flex-col justify-center items-center">
			<h2 class="text-3xl font-bold mb-1 page-transition">회원 가입 완료!</h2>
			<el-button
				@click="goLoginPage"
				type="primary"
				size="large"
				style="width: 310px"
				class="mt-5"
				>로그인 화면으로</el-button
			>
		</div>
		<div
			v-else
			class="flex flex-col justify-center items-center page-transition"
		>
			<h2 class="text-3xl font-bold mb-1">회원 가입</h2>
			<span class="block mb-5">회원 가입에 필요한 정보를 입력해 주세요</span>

			<Form @submit="signup" :validation-schema="schema">
				<Field name="id" v-slot="{ field, handleChange, errors }" v-model="id">
					<label class="relative block mt-2.5">
						<span class="absolute inset-y-0 left-0 flex items-center pl-3">
							<el-icon color="#ffffff"><User /></el-icon>
						</span>
						<input
							type="text"
							class="placeholder:text-[#ffffffab] placeholder:text-sm text-white block bg-[#FFFFFF4D] w-[310px] py-2.5 pl-9 pr-3 rounded focus:outline-none focus:border-[#cd4c54] focus:ring-[#cd4c54] focus:ring-1"
							autofocus
							placeholder="아이디"
							:value="field.value"
							@input="handleChange($event.target.value)"
						/>
					</label>
					<span v-if="errors.length" class="text-xs text-[#ff9ba1]">
						{{ errors[0] }}
					</span>
				</Field>
				<Field name="pw" v-slot="{ field, handleChange, errors }" v-model="pw">
					<label class="relative block mt-2.5">
						<span class="absolute inset-y-0 left-0 flex items-center pl-3">
							<el-icon color="#ffffff"><Lock /></el-icon>
						</span>
						<input
							type="password"
							class="placeholder:text-[#ffffffab] placeholder:text-sm text-white block bg-[#FFFFFF4D] w-[310px] py-2.5 pl-9 pr-3 rounded focus:outline-none focus:border-[#cd4c54] focus:ring-[#cd4c54] focus:ring-1"
							placeholder="비밀번호"
							:value="field.value"
							@input="handleChange($event.target.value)"
						/>
					</label>
					<span v-if="errors.length" class="text-xs text-[#ff9ba1]">
						{{ errors[0] }}
					</span>
				</Field>
				<Field
					name="pwCheck"
					v-slot="{ field, handleChange, errors }"
					v-model="pwCheck"
				>
					<label class="relative block mt-2.5">
						<span class="absolute inset-y-0 left-0 flex items-center pl-3">
							<el-icon color="#ffffff"><Lock /></el-icon>
						</span>
						<input
							type="password"
							class="placeholder:text-[#ffffffab] placeholder:text-sm text-white block bg-[#FFFFFF4D] w-[310px] py-2.5 pl-9 pr-3 rounded focus:outline-none focus:border-[#cd4c54] focus:ring-[#cd4c54] focus:ring-1"
							placeholder="비밀번호 확인"
							:value="field.value"
							@input="handleChange($event.target.value)"
						/>
					</label>
					<span v-if="errors.length" class="text-xs text-[#ff9ba1]">
						{{ errors[0] }}
					</span>
				</Field>
				<Field
					name="name"
					v-slot="{ field, handleChange, errors }"
					v-model="name"
				>
					<label class="relative block mt-2.5">
						<span class="absolute inset-y-0 left-0 flex items-center pl-3">
							<el-icon color="#ffffff"><EditPen /></el-icon>
						</span>
						<input
							type="text"
							class="placeholder:text-[#ffffffab] placeholder:text-sm text-white block bg-[#FFFFFF4D] w-[310px] py-2.5 pl-9 pr-3 rounded focus:outline-none focus:border-[#cd4c54] focus:ring-[#cd4c54] focus:ring-1"
							:placeholder="t('name')"
							:value="field.value"
							@input="handleChange($event.target.value)"
						/>
					</label>
					<span v-if="errors.length" class="text-xs text-[#ff9ba1]">
						{{ errors[0] }}
					</span>
				</Field>
				<Field
					name="tel"
					v-slot="{ field, handleChange, errors }"
					v-model="tel"
				>
					<label class="relative block mt-2.5">
						<span class="absolute inset-y-0 left-0 flex items-center pl-3">
							<el-icon color="#ffffff"><Iphone /></el-icon>
						</span>
						<input
							type="text"
							class="placeholder:text-[#ffffffab] placeholder:text-sm text-white block bg-[#FFFFFF4D] w-[310px] py-2.5 pl-9 pr-3 rounded focus:outline-none focus:border-[#cd4c54] focus:ring-[#cd4c54] focus:ring-1"
							:placeholder="t('phone_number')"
							:value="field.value"
							@input="[handleChange($event.target.value)]"
						/>
					</label>
					<span v-if="errors.length" class="text-xs text-[#ff9ba1] absolute">
						{{ errors[0] }}
					</span>
				</Field>
				<button
					type="submit"
					class="bg-[#cd4c54] w-[310px] text-sm text-white rounded h-10 py-3 px-[19px] border border-[#cd4c54] font-medium flex items-center justify-center hover:bg-[#b25252] active:bg-[#f78989] mt-8"
				>
					<span class="items-center inline-flex"> 회원가입 </span>
				</button>
			</Form>
		</div>
	</div>
</template>
<script setup>
import { useI18n } from 'vue-i18n'; // Import useI18n

const { t } = useI18n(); // Destructure t from useI18n
import { EditPen, Iphone, User, Lock, Position } from '@element-plus/icons-vue';
import cryptojs from 'crypto-js';
import { Form, Field } from 'vee-validate';
import * as yup from 'yup';

const registered = ref(false);

const id = ref('');
const pw = ref('');
const pwCheck = ref('');
const encryptedID = ref('');
const encryptedPW = ref('');
const name = ref('');
const tel = ref('');

const signup = async () => {
	encryptedID.value = cryptojs.AES.encrypt(id.value, 'idSalt').toString();
	encryptedPW.value = cryptojs.AES.encrypt(pw.value, '').toString();

	try {
		const res = await $fetch.raw(`${BASE_URL}/master/create/1`, {
			method: 'POST',
			body: {
				ID: encryptedID.value,
				PASSWORD: encryptedPW.value,
				name: name.value,
				tel: tel.value,
			},
		});
		if (res.status === 200) {
			registered.value = true;
			location.reload();
		}
	} catch (error) {
		console.log(error);
	}
};

const goLoginPage = () => {
	location.reload();
};

const schema = yup.object({
	id: yup
		.string()
		.required()
		.min(4)
		.label('아이디를')
		.matches(/^[a-zA-Z]{1}[a-zA-Z0-9_]+$/, t('must_start_with_letter')),
	pw: yup
		.string()
		.required()
		.label('비밀번호를')
		.min(9)
		.matches(
			/^.*(?=^.{9,}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/,
			t('must_include_characters'),
		),
	pwCheck: yup
		.string()
		.required()
		.label('비밀번호를')
		.oneOf([yup.ref('pw')], '비밀번호가 일치하지 않습니다.'),
	name: yup.string().required().label('이름을'),
	tel: yup
		.string()
		.required()
		.label('전화번호를')
		.matches(
			/^\d{3}-\d{4}-\d{4}$/,
			'전화번호는 000-0000-0000 형식으로 입력해 주세요.',
		),
});
// 베트남 납품 시, 현지 휴대전화 번호 형식으로 validation 변경해야함!
</script>
<style scoped>
.login-form-cover {
	border-radius: 0 8px 8px 0;
	background-color: rgba(255, 255, 255, 0.05);
	backdrop-filter: blur(52px);
	border: 1px solid #9c9c9c1e;
}

@keyframes pageTransition {
	0% {
		transform: translateX(3%);
		opacity: 0;
	}
	100% {
		transform: translateX(0);
		opacity: 1;
	}
}
.page-transition {
	animation: pageTransition 1s;
}
</style>
