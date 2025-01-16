<template>
	<el-dialog
		v-model="smsModal"
		:title="`SMS 유저 ${title}`"
		width="500"
		align-center
	>
		<el-form
			ref="formRef"
			label-position="top"
			label-width="auto"
			:model="form"
		>
			<el-form-item label="이름">
				<el-input v-model="form.name" />
			</el-form-item>
			<el-form-item label="전화번호">
				<el-input
					v-model="form.tel"
					@input="handleChange"
					placeholder="'010'과 '-'를 제외한 숫자만 입력"
					maxlength="13"
				/>
			</el-form-item>

			<el-form-item v-if="smsActive" label="관리자">
				<el-radio-group v-model="form.userType" class="ml-4">
					<el-radio value="master" size="large">도청 관리자</el-radio>
					<!-- 경상남도 창원용, 충청북도 청주용 지역 관리자 라디오 버튼 -->
					<el-radio value="admin" size="large">지역 관리자</el-radio>
					<el-radio value="user" size="large">지역 사용자</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item
				v-if="form.userType !== 'master'"
				label="도/특별시/광역시 선택"
			>
				<el-select v-model="form.l1" placeholder="도/특별시/광역시 선택">
					<el-option
						v-for="l1 in l1List"
						:key="l1"
						:label="l1"
						:value="l1"
					></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="시/군/구 선택" v-if="form.userType !== 'master'">
				<el-select v-model="form.l2" placeholder="시/군/구 선택">
					<el-option
						v-for="l2 in l2List"
						:key="l2"
						:label="l2"
						:value="l2"
					></el-option> </el-select
			></el-form-item>
			<el-form-item label="야간 연기 알람 수신 여부">
				<el-radio-group v-model="form.night" class="ml-4">
					<el-radio :value="false" size="large">수신 거부</el-radio>
					<el-radio :value="true" size="large">수신</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item label="문자 알림 수신 여부">
				<el-radio-group v-model="form.sms" class="ml-4">
					<el-radio :value="false" size="large">수신 거부</el-radio>
					<el-radio :value="true" size="large">수신</el-radio>
				</el-radio-group>
			</el-form-item>
			<el-form-item class="align-buttons__dialog">
				<el-button @click="closeModal()">닫기</el-button>
				<el-button
					@click="updateUserInfo ? updateSMSUser() : addSMSUser()"
					type="primary"
					:disabled="
						!form.name || !form.tel || form.userType !== 'master'
							? form.l1 === '' || form.l2 === ''
							: false
					"
				>
					{{ updateUserInfo ? '수정하기' : '등록하기' }}
				</el-button>
			</el-form-item>
		</el-form>
	</el-dialog>
</template>
<script setup>
const smsModal = defineModel();
const props = defineProps(['title', 'updateUserInfo']);
const emit = defineEmits(['fetchUsers']);
const { message } = useAlarm();

const closeModal = () => {
	smsModal.value = false;
};

const smsActive = ref(null);

watchEffect(() => {
	if (smsModal.value) {
		nextTick(() => {
			// Form reset
			form.name = '';
			form.tel = '';
			form.night = false;
			form.sms = false;
			form.l1 = '';
			form.l2 = '';
			form.userType = 'master';

			console.log(props.updateUserInfo);
			// Edit User
			if (props.updateUserInfo) {
				form.name = props.updateUserInfo.name;
				form.tel = props.updateUserInfo.phoneNumber;
				form.night = props.updateUserInfo.NighttimeReception;
				form.sms = props.updateUserInfo.status;
				form.l1 = props.updateUserInfo.address.L1;
				form.l2 = props.updateUserInfo.address.L2;
				form.userType = props.updateUserInfo.address.userType;
			}

			smsActive.value = JSON.parse(sessionStorage.getItem('smsActive'));
			console.log(smsActive.value);
		});
	}
});

const formRef = ref('');
const form = reactive({
	name: '',
	tel: '',
	night: false,
	sms: false,
	userType: 'master',
	l1: '',
	l2: '',
});
watch(
	() => form.userType,
	val => {
		console.log(val); // master, admin, user,
		if (val === 'admin') {
			if (form.l2 !== '창원시' && form.l2 !== '청주시') {
				form.l2 = '';
			}

			l2List.value = [form.l2];
		} else if (val === 'master') {
			form.l1 = '';
			form.l2 = '';
		} else {
			if (form.l2 === '창원시') {
				form.l2 = '';
			}

			l2List.value = oriL2List.value;
		}
	},
);

const handleChange = value => {
	let numericValue = value.replace(/[^0-9]/g, '');

	if (numericValue) {
		if (!numericValue.startsWith('010')) {
			numericValue = '010' + numericValue;
		}
	} else {
		numericValue = '';
	}

	if (numericValue.length > 3) {
		form.tel = numericValue
			.replace(/^(010)(\d{0,4})(\d{0,4})$/, '$1-$2-$3')
			.replace(/(\-{1,2})$/g, '');
	} else {
		form.tel = numericValue;
	}
};

const addSMSUser = async () => {
	try {
		await $fetch(`${BASE_URL}/sms/user/create`, {
			method: 'POST',
			body: {
				name: form.name,
				phoneNumber: form.tel,
				status: form.sms,
				NighttimeReception: form.night,
				address: {
					L1: form.l1,
					L2: form.l2,
					userType: form.userType,
				},
			},
		});
		message.success(`${form.name}이(가) 등록 되었습니다!`);
		emit('fetchUsers');
		closeModal();
	} catch (error) {
		console.log(error);
	}
};

const updateSMSUser = async () => {
	try {
		await $fetch(`${BASE_URL}/sms/user/update`, {
			method: 'POST',
			body: {
				_id: props.updateUserInfo._id,
				name: form.name,
				phoneNumber: form.tel,
				NighttimeReception: JSON.parse(form.night),
				status: JSON.parse(form.sms),
				address: {
					L1: form.l1,
					L2: form.l2,
					userType: form.userType,
				},
			},
		});
		message.success(`${props.updateUserInfo.name}이(가) 수정되었습니다`);
		emit('fetchUsers');
		closeModal();
	} catch (error) {
		console.log(error);
	}
};

const l1List = ref([]);
const l2List = ref([]);
const oriL2List = ref([]);
const fetchCCTVList = async () => {
	try {
		const data = await $fetch(`${BASE_URL}/cctv/read/1`, {
			method: 'GET',
		});
		data.forEach(element => {
			element.cctv_addressJoin = Object.values(element.cctv_address).join(' ');

			if (!l1List.value.some(item => item === element.cctv_address.L1)) {
				l1List.value.push(element.cctv_address.L1);
			}

			if (!l2List.value.some(item => item === element.cctv_address.L2)) {
				l2List.value.push(element.cctv_address.L2);
			}
		});

		oriL2List.value = l2List.value;
	} catch (error) {
		console.log(error);
	}
};

fetchCCTVList();
</script>
<style scoped>
:deep(.align-buttons__dialog .el-form-item__content) {
	justify-content: flex-end;
}
</style>
