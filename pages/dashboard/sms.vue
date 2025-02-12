<template>
	<div>
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
		<el-divider content-position="left">이벤트 알람 설정</el-divider>

		<div class="flex justify-end items-center mb-5">
			<el-button
				:icon="Plus"
				type="primary"
				size="large"
				@click="openModal('등록')"
			>
				SMS 유저 등록
			</el-button>
			<el-button
				:icon="Plus"
				type="primary"
				size="large"
				@click="initUserSave()"
			>
				초기화
			</el-button>
			<el-button type="primary" size="large" @click="deleteAllUser()">
				전체 삭제
			</el-button>
		</div>

		<el-row
			class="bg-[#26272A] border border-[#2F3031] rounded py-5 px-14 text-center mb-2.5"
		>
			<el-col :span="2">순번</el-col>
			<el-col :span="4">이름</el-col>
			<el-col :span="4">전화번호</el-col>
			<el-col :span="4">유형</el-col>
			<el-tooltip
				placement="top"
				effect="firewatcher"
				content="알림 설정이 반전됩니다. "
			>
				<el-col :span="4" @click="reverseDayAlert()" style="cursor: pointer"
					>주간 알림</el-col
				>
			</el-tooltip>
			<el-tooltip
				placement="top"
				effect="firewatcher"
				content="알림 설정이 반전됩니다. "
			>
				<el-col :span="4" @click="reverseNightAlert()" style="cursor: pointer"
					>야간 알림</el-col
				>
			</el-tooltip>

			<el-col :span="2">수정 / 삭제</el-col>
		</el-row>

		<div class="h-[calc(100%-205px)] overflow-y-scroll">
			<el-row
				v-for="(user, idx) in userList"
				class="bg-[#2E2F33] border border-[#333539] rounded flex items-center text-center py-4 px-14 mb-1 transition hover:bg-[#2C2023A8] hover:border-[#AB3D23]"
			>
				<el-col :span="2">{{ idx + 1 }}</el-col>
				<el-col :span="4">{{ user.name }}</el-col>
				<el-col :span="4">{{ user.phoneNumber }}</el-col>
				<el-col v-if="isActive" :span="4">{{
					user.address?.L2 !== '' ? user.address?.L2 || '-' : '도청 관리자'
				}}</el-col>
				<el-col v-else :span="4">관리자</el-col>
				<el-col :span="4">
					<el-switch v-model="user.status" @change="changeAlarm(user)" />
				</el-col>
				<el-col :span="4">
					<el-switch
						v-model="user.NighttimeReception"
						@change="changeAlarm(user)"
					/>
				</el-col>
				<el-col :span="2">
					<el-button size="small" @click="openModal('수정', user)"
						>수정</el-button
					>
					<el-popconfirm
						width="200"
						confirm-button-text="삭제"
						cancel-button-text="취소"
						:icon="WarnTriangleFilled"
						title="정말 삭제하시겠습니까?"
						@confirm="deleteUser(user)"
					>
						<template #reference>
							<el-button size="small">삭제</el-button>
						</template>
					</el-popconfirm>
				</el-col>
			</el-row>
		</div>

		<ModalsSMSUserModal
			v-model="smsModal"
			@fetchUsers="fetchUsers"
			:title="title"
			:updateUserInfo="updateUserInfo"
		/>
	</div>
</template>
<script setup>
import { Plus, WarnTriangleFilled } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const isActive = ref(
	JSON.parse(sessionStorage.getItem('isActive') === undefined ? false : true),
);
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

const smsModal = ref(false);
const title = ref('');
const updateUserInfo = ref('');

const openModal = (value, data) => {
	if (value === '수정') {
		updateUserInfo.value = data;
	} else {
		updateUserInfo.value = '';
	}
	title.value = value;
	smsModal.value = true;
};

const userList = ref([]);
const fetchUsers = async () => {
	try {
		const data = await $fetch.raw(`${BASE_URL}/sms/user/read`, {
			method: 'GET',
		});
		console.log(data);
		userList.value = data._data;
	} catch (error) {
		console.log(error);
	}
};
fetchUsers();

const changeAlarm = async (user, dayReverse, nightReverse) => {
	try {
		await $fetch(`${BASE_URL}/sms/user/update`, {
			method: 'POST',
			body: {
				_id: user._id,
				name: user.name,
				phoneNumber: user.phoneNumber,
				NighttimeReception: nightReverse
					? !user.NighttimeReception
					: user.NighttimeReception,
				status: dayReverse ? !user.status : user.status,
				address: {
					L1: user.address?.L1,
					L2: user.address?.L2,
					userType: user.address?.userType,
				},
			},
		});
		message.success(`${user.name} ${t('modified')}`);
	} catch (error) {
		console.log(error);
	}
};

const deleteAllUser = async () => {
	try {
		userList.value.forEach(async item => {
			await $fetch(`${BASE_URL}/sms/user/delete/${item._id}`, {
				method: 'GET',
			});
		});
	} catch (error) {
		console.log(error);
	}
};
const deleteUser = async user => {
	try {
		await $fetch(`${BASE_URL}/sms/user/delete/${user._id}`, { method: 'GET' });
		message.success(`${user.name}이(가) 삭제 되었습니다.`);
		fetchUsers();
	} catch (error) {
		console.log(error);
	}
};

let initUserIndex = 0;
const initUserSave = () => {
	$fetch
		.raw(`${BASE_URL}/sms/user/create`, {
			method: 'POST',
			body: {
				name: smsUserList[initUserIndex].name,
				phoneNumber: smsUserList[initUserIndex].phoneNumber,
				status: smsUserList[initUserIndex].status,
				NighttimeReception: smsUserList[initUserIndex].NighttimeReception,
				address: {
					L1: smsUserList[initUserIndex].L1,
					L2: smsUserList[initUserIndex].L2,
					userType: smsUserList[initUserIndex].userType,
				},
			},
		})
		.then(res => {
			initUserIndex++;
			if (smsUserList[initUserIndex]) {
				initUserSave();
			} else {
				message.success(`최초 사용자 등록이 완료 되었습니다!`);
			}
		})
		.catch(err => {
			message.error(`최초 사용자 등록에 실패하였습니다.`);
		});
};

const allAlertFlag = ref(null);

const reverseDayAlert = () => {
	userList.value.forEach(async (element, idx) => {
		await changeAlarm(element, true, false);
		if (idx === userList.value.length - 1) {
			fetchUsers();
		}
	});
};

const reverseNightAlert = () => {
	userList.value.forEach(async (element, idx) => {
		await changeAlarm(element, false, true);
		if (idx === userList.value.length - 1) {
			fetchUsers();
		}
	});
	fetchUsers();
};
</script>
<style scoped>
::-webkit-scrollbar {
	display: none;
}
</style>
