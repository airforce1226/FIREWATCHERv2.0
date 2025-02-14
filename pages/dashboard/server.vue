<template>
	<div>
		<img
			src="assets/svgs/logo.svg"
			class="mr-5 cursor-pointer"
			@click="router.push('/dashboard')"
		/>
		<el-divider content-position="left">서버 관리</el-divider>

		<div class="flex justify-end mb-5">
			<el-button
				:icon="Plus"
				size="large"
				type="primary"
				@click="openModal('서버 추가')"
				>서버 추가</el-button
			>
		</div>

		<el-row
			class="bg-[#26272A] border border-[#2F3031] rounded py-5 px-14 text-center mb-2.5"
		>
			<el-col :span="4">NO</el-col>
			<el-col :span="4">IP</el-col>
			<el-col :span="4">Port</el-col>
			<el-col :span="4">Server ID</el-col>
			<el-col :span="4">GPU Number</el-col>
			<el-col :span="4">삭제 / 수정</el-col>
		</el-row>

		<div class="overflow-y-scroll" style="height: calc(100% - 213px)">
			<el-row
				v-for="(server, index) in serverList"
				class="bg-[#2E2F33] border border-[#333539] rounded flex items-center text-center py-4 px-14 mb-1 transition hover:bg-[#2C2023A8] hover:border-[#AB3D23]"
			>
				<el-col :span="4">{{ index + 1 }}</el-col>
				<el-col :span="4">{{ server.ip }}</el-col>
				<el-col :span="4"> {{ server.streamPort }} </el-col>
				<el-col :span="4"> {{ server.svr_id }} </el-col>
				<el-col :span="4"> {{ server.gpu_number }} </el-col>
				<el-col :span="4">
					<el-popconfirm
						width="180"
						confirm-button-text="삭제"
						cancel-button-text="{{ t('cancel') }}"
						:icon="WarnTriangleFilled"
						:title="t('confirm_delete')"
						@confirm="deleteServer(server)"
					>
						<template #reference>
							<el-button size="small">삭제</el-button>
						</template>
					</el-popconfirm>
					<el-button size="small" @click="openModal('서버 정보 수정', server)"
						>수정</el-button
					>
				</el-col>
			</el-row>
		</div>

		<ModalsServerModal
			v-model="modal"
			:title="title"
			:updateServerInfo="updateServerInfo"
			@fetchServerList="fetchServerList"
		/>
	</div>
</template>
<script setup>
import { WarnTriangleFilled, Plus } from '@element-plus/icons-vue';

const router = useRouter();
const { message } = useAlarm();

const modal = ref(false);
const title = ref('');
const updateServerInfo = ref('');

const serverList = ref([]);

const openModal = (titleName, data) => {
	if (titleName === '서버 정보 수정') {
		updateServerInfo.value = data;
	}
	title.value = titleName;
	modal.value = true;
};

const fetchServerList = async () => {
	try {
		const data = await $fetch(`${BASE_URL}/inferSvr/read/1`, {
			method: 'GET',
		});
		console.log(data);
		serverList.value = data;
	} catch (error) {
		console.log(error);
	}
};
fetchServerList();

const deleteServer = async data => {
	try {
		await $fetch(`${BASE_URL}/inferSvr/delete/1/${data._id}`);
		message.success(`${data.ip}가 삭제 되었습니다.`);
		fetchServerList();
	} catch (error) {
		console.log(error);
	}
};
</script>
<style scoped>
::-webkit-scrollbar {
	display: none;
}
</style>
