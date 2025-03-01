<template>
	<div v-bind="$attrs">
		<div v-if="SITE === '강원도청'" class="flex items-center">
			<img
				v-if="isL2Login"
				:src="`/${siteName}.png`"
				class="mr-5"
				width="120"
				height="40"
			/>
			<img v-else src="/main.png" class="mr-5" width="120" height="40" />
			<img
				src="assets/svgs/gwd-logo.svg"
				class="cursor-pointer"
				@click="router.push('/dashboard')"
			/>
		</div>
		<img
			v-else
			src="assets/svgs/logo.svg"
			class="mr-5 cursor-pointer"
			@click="router.push('/dashboard')"
		/>
		<el-divider content-position="left">계정 관리</el-divider>

		<div class="flex justify-end items-center mb-5">
			<el-button :icon="Plus" type="primary" @click="openModal('등록')">
				{{ t('add_user_account') }}
			</el-button>
		</div>
		<el-row
			class="bg-[#26272A] border border-[#2F3031] rounded py-5 px-14 text-center mb-2.5"
		>
			<el-col :span="4">NO</el-col>
			<el-col :span="4">{{ t('name') }}</el-col>
			<el-col :span="4">ID</el-col>
			<el-col :span="4">{{ t('phone_number') }}</el-col>
			<el-col :span="4">{{ t('type') }}</el-col>
			<el-col :span="4">삭제</el-col>
		</el-row>
		<div class="h-[calc(100%-205px)] overflow-y-scroll">
			<el-row
				v-for="(user, index) in userList"
				class="bg-[#2E2F33] border border-[#333539] rounded flex items-center text-center py-4 px-14 mb-1 transition hover:bg-[#2C2023A8] hover:border-[#AB3D23]"
			>
				<el-col :span="4">{{ index + 1 }}</el-col>
				<el-col :span="4">{{ user.name }}</el-col>
				<el-col :span="4">{{ user.ID }}</el-col>
				<el-col :span="4">
					{{ user.tel || '-' }}
				</el-col>
				<el-col :span="4">
					{{ `${user.address.L1}/${user.address.L2}` }}
				</el-col>
				<el-col :span="4">
					<el-popconfirm
						width="220"
						confirm-button-text="삭제"
						cancel-button-text="{{ t('cancel') }}"
						:icon="WarnTriangleFilled"
						:title="t('confirm_delete')"
						@confirm="deleteUser(user)"
					>
						<template #reference>
							<el-button size="small">삭제</el-button>
						</template>
					</el-popconfirm>
					<!-- <el-button size="small" @click="openModal('수정', user)"
						>수정</el-button
					> -->
				</el-col>
			</el-row>
		</div>
	</div>
	<el-dialog
		v-model="dialogVisible"
		:title="`사용자 ${title}`"
		width="600"
		:close-on-click-modal="false"
		@open="resetForm(ruleFormRef, title)"
	>
		<el-row>
			<el-col :span="23">
				<el-form
					ref="ruleFormRef"
					:model="ruleForm"
					:rules="rules"
					status-icon
					label-width="auto"
				>
					<el-form-item label="아이디" prop="id">
						<el-input
							v-model="ruleForm.id"
							clearable
							style="width: 75%"
							:disabled="duplicateFlag"
						/>
						<el-button
							class="ml-1"
							type="primary"
							@click="fetchDuplicateCheck()"
							:disabled="duplicateFlag"
							>{{ t('check_duplicate_id') }}</el-button
						>
					</el-form-item>
					<el-form-item label="비밀번호" prop="pw">
						<el-input v-model="ruleForm.pw" type="password" clearable />
					</el-form-item>
					<el-form-item label="비밀번호 확인" prop="checkPw">
						<el-input v-model="ruleForm.checkPw" type="password" clearable />
					</el-form-item>
					<el-form-item label="이름" prop="name">
						<el-input v-model="ruleForm.name" clearable />
					</el-form-item>
					<el-form-item label="전화번호" prop="tel">
						<el-input v-model="ruleForm.tel" clearable />
					</el-form-item>
					<el-form-item label="도/특별시/광역시" prop="l1">
						<el-select
							v-model="ruleForm.l1"
							:placeholder="t('select_province')"
						>
							<el-option
								v-for="l1 in l1List"
								:key="l1"
								:label="l1"
								:value="l1"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item :label="t('city_county_district')" prop="l2">
						<el-select
							:disabled="ruleForm.l1 === ''"
							v-model="ruleForm.l2"
							:placeholder="t('select_city')"
						>
							<el-option
								v-for="l2 in l2List"
								:key="l2"
								:label="l2"
								:value="l2"
							></el-option>
						</el-select>
					</el-form-item>
					<el-form-item style="float: inline-end">
						<el-button @click="resetForm(ruleFormRef)">초기화</el-button>
						<el-tooltip
							class="box-item"
							effect="dark"
							content="아이디 중복 검사를 실시하세요."
							placement="bottom"
							:disabled="duplicateFlag"
						>
							<el-button
								type="primary"
								:disabled="!duplicateFlag"
								@click="submitForm(ruleFormRef)"
							>
								{{ title === '등록' ? '등록' : '수정' }}
							</el-button>
						</el-tooltip>
					</el-form-item>
				</el-form>
			</el-col>
		</el-row>
	</el-dialog>
</template>
<script setup>
import { useI18n } from 'vue-i18n'; // Import useI18n

const { t } = useI18n(); // Destructure t from useI18n
import { Plus, WarnTriangleFilled } from '@element-plus/icons-vue';
import cryptojs from 'crypto-js';

const isL2Login = ref(false);
const siteName = ref(null);

onMounted(() => {
	isL2Login.value = !!window.sessionStorage.getItem('L2Login');
	if (isL2Login.value) {
		siteName.value = userMap[JSON.parse(sessionStorage.getItem('L2Login')).L2];
	}
});

const router = useRouter();
const { message } = useAlarm();

const ruleFormRef = ref(null);

const updateUserInfo = ref('');
const title = ref('');
const dialogVisible = ref(false);

const userList = ref([]);

const updateFlag = ref(false);

const getUserList = () => {
	$fetch
		.raw(`${BASE_URL}/regional/info`, {
			method: 'GET',
		})
		.then(res => {
			message.success(t('user_info_retrieval_complete'));
			userList.value = res._data;
		})
		.catch(err => {
			message.error(t('user_info_retrieval_failed'));
		});
};
getUserList();

const userData = ref(null);
const openModal = (value, data) => {
	if (value === '수정') {
		userData.value = data;
		duplicateFlag.value = true;
	} else if (value === '등록') {
		duplicateFlag.value = false;
	}

	title.value = value;
	dialogVisible.value = true;
};

const ruleForm = reactive({
	id: '',
	pw: '',
	checkPw: '',
	name: '',
	tel: '',
	l1: '',
	l2: '',
});

watch(
	() => ruleForm.l1,
	newL1 => {
		if (newL1) {
			ruleForm.l2 = '';
			// l2List.value = ;
			l2List.value = [];
			cameraList.value.forEach(element => {
				if (element.cctv_address.L1 === newL1) {
					if (!l2List.value.some(item => item === element.cctv_address.L2)) {
						if (!element.cctv_address.L2.includes('청주시')) {
							l2List.value.push(element.cctv_address.L2);
						} else {
							l2List.value.push('청주시');
						}
					}
				}
			});
			l2List.value = [...new Set(l2List.value)];
		}
	},
);

const rules = reactive({
	id: [
		{ required: true, message: t('input_id'), trigger: 'blur' },
		{
			pattern: /^[a-zA-Z]{1}[a-zA-Z0-9_]+$/,
			message: t('must_start_with_letter'),
		},
		{
			min: 4,
			message: t('input_more_than_4'),
			trigger: 'blur',
		},
	],
	name: [{ required: true, message: t('input_name'), trigger: 'blur' }],
	pw: [
		{
			required: true,
			message: t('input_password'),
			trigger: 'blur',
		},
		{
			pattern: /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/,
			message: t('must_include_characters'),
		},
		{
			min: 9,
			message: t('input_more_than_9'),
			trigger: 'blur',
		},
	],
	checkPw: [
		{
			required: true,
			message: t('confirm_password'),
			trigger: 'blur',
		},
		{
			validator: (rule, value, callback) => {
				if (value !== ruleForm.pw) {
					callback(new Error('비밀번호가 일치하지 않습니다.'));
				} else {
					callback();
				}
			},
			trigger: 'blur',
		},
	],
	// tel: [
	// 	{
	// 		required: true,
	// 		message: '전화번호를 입력해주세요.',
	// 		trigger: 'blur',
	// 	},
	// 	{
	// 		pattern: /^\d{3}-\d{4}-\d{4}$/,
	// 		message: '전화번호는 000-0000-0000 형식으로 입력해주세요.',
	// 	},
	// ],
	l1: [
		{
			required: true,
			message: t('input_province'),
			trigger: 'change',
		},
	],
	l2: [{ required: true, message: t('input_city'), trigger: 'change' }],
});

const submitForm = async formEl => {
	if (!formEl) return;
	await formEl.validate((valid, fields) => {
		if (valid) {
			if (title.value === '등록') {
				fetchSignUp();
			} else {
				updateUser();
			}
		} else {
			console.log('error submit!', fields);
		}
	});
};

const resetForm = (formEl, title) => {
	if (!formEl) return;
	formEl.resetFields();
	if (title === '수정') {
		ruleForm.id = userData.value.ID;
		ruleForm.pw = '';
		ruleForm.checkPw = '';
		ruleForm.name = userData.value.name;
		ruleForm.tel = userData.value.tel;
		ruleForm.l1 = userData.value.address.L1;
		ruleForm.l2 = userData.value.address.L2;
	}
};

const cameraList = ref([]);
const l1List = ref([]);
const l2List = ref([]);
const fetchCCTVList = async () => {
	try {
		const data = await $fetch(`${BASE_URL}/cctv/read/1`, {
			method: 'GET',
		});
		cameraList.value = data;

		cameraList.value.forEach(element => {
			element.cctv_addressJoin = Object.values(element.cctv_address).join(' ');

			if (!l1List.value.some(item => item === element.cctv_address.L1)) {
				l1List.value.push(element.cctv_address.L1);
			}
		});
	} catch (error) {
		console.log(error);
	}
};

fetchCCTVList();

const fetchSignUp = () => {
	let encryptedID = cryptojs.AES.encrypt(ruleForm.id, 'idSalt').toString();
	let encryptedPW = cryptojs.AES.encrypt(ruleForm.pw, '').toString();
	$fetch
		.raw(`${BASE_URL}/regional/create`, {
			method: 'POST',
			body: {
				ID: encryptedID,
				PASSWORD: encryptedPW,
				name: ruleForm.name,
				tel: ruleForm.tel,
				address: {
					L1: ruleForm.l1,
					L2: ruleForm.l2,
				},
			},
		})
		.then(res => {
			dialogVisible.value = false;
			message.success(t('user_creation_complete'));
			getUserList();
		})
		.catch(err => {
			message.error(t('user_creation_failed'));
		});
};

const duplicateFlag = ref(false);
const fetchDuplicateCheck = () => {
	if (ruleForm.id !== '') {
		$fetch
			.raw(`${BASE_URL}/regional/check`, {
				method: 'POST',
				body: {
					ID: ruleForm.id,
				},
			})
			.then(res => {
				message.success(t('duplicate_check_complete'));
				duplicateFlag.value = true;
			})
			.catch(err => {
				message.error(t('duplicate_id_exists'));
			});
	} else {
		message.error(t('check_duplicate_id'));
	}
};

const deleteUser = user => {
	console.log(user);
	$fetch
		.raw(`${BASE_URL}/regional/delete/${user._id}`, {
			method: 'GET',
		})
		.then(res => {
			console.log(res);
			message.success(t('user_deletion_complete'));
			getUserList();
		})
		.catch(err => {
			console.log(err);
			message.error(t('user_deletion_failed'));
		});
};

const updateUser = () => {
	let encryptedPW = cryptojs.AES.encrypt(ruleForm.pw, '').toString();

	$fetch
		.raw(`${BASE_URL}/regional/update`, {
			method: 'POST',
			body: {
				_id: userData.value._id,
				PASSWORD: encryptedPW,
				name: ruleForm.name,
				tel: ruleForm.tel,
				address: {
					L1: ruleForm.l1,
					L2: ruleForm.l2,
				},
			},
		})
		.then(res => {
			console.log(res);
			message.success(t('user_modification_complete'));
			getUserList();
		})
		.catch(err => {
			console.log(err);
			message.error(t('user_modification_failed'));
		});
};
</script>
