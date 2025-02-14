<template>
	<el-dialog v-model="modal" :title="title" width="600" align-center>
		<el-form label-position="top" label-width="auto">
			<el-form-item label="서버 IP">
				<el-input v-model="ip" placeholder="000.000.000.000" />
			</el-form-item>
			<el-form-item label="서버 아이디">
				<el-input v-model="id" placeholder="svr1" />
			</el-form-item>
			<el-form-item label="서버 포트">
				<el-input v-model="port" placeholder="8080" />
			</el-form-item>
			<el-form-item label="GPU 번호">
				<el-input v-model="gpu" placeholder="1" />
			</el-form-item>
			<el-form-item class="align-buttons__dialog">
				<el-button @click="modal = false">{{ t('cancel') }}</el-button>
				<el-button
					type="primary"
					@click="updateServerInfo ? updateServer() : registerServer()"
					:disabled="!ip || !id || !port || !gpu"
				>
					{{ updateServerInfo ? '수정하기' : '추가하기' }}
				</el-button>
			</el-form-item>
		</el-form>
	</el-dialog>
</template>
<script setup>
import { useI18n } from 'vue-i18n'; // Import useI18n

const { t } = useI18n(); // Destructure t from useI18n
const modal = defineModel();
const props = defineProps(['title', 'updateServerInfo']);
const emit = defineEmits(['fetchServerList']);

const { message } = useAlarm();

const ip = ref('');
const id = ref('');
const port = ref('');
const gpu = ref('');

watchEffect(() => {
	if (modal.value) {
		// Reset
		ip.value = '';
		id.value = '';
		port.value = '';
		gpu.value = '';

		if (props.updateServerInfo) {
			ip.value = props.updateServerInfo.ip;
			id.value = props.updateServerInfo.svr_id;
			port.value = props.updateServerInfo.streamPort;
			gpu.value = props.updateServerInfo.gpu_number;
		}
	}
});

const closeModal = () => {
	modal.value = false;
};

const registerServer = async () => {
	try {
		await $fetch.raw(`${BASE_URL}/inferSvr/create/1`, {
			method: 'POST',
			body: {
				ip: ip.value,
				svr_id: id.value,
				streamPort: port.value,
				gpu_number: parseInt(gpu.value),
			},
		});
		message.success(`${ip.value} ${t('server_registered')}`);
		closeModal();
		emit('fetchServerList');
	} catch (error) {
		switch (error.data) {
			case 'svr_id 정보가 이미 존재합니다.':
				message.error(t('server_id_already_registered'));
				break;
			case 'IP and streamPort 정보가 이미 존재합니다.':
				message.error(t('ip_port_already_registered'));
				break;
			case `svr_id는 'svrN' 형식이어야 하며, 여기서 N은 하나 이상의 숫자입니다.`:
				message.error(t('input_server_id_format'));
				break;
		}
	}
};

const updateServer = async () => {
	try {
		await $fetch(`${BASE_URL}/inferSvr/update/1`, {
			method: 'POST',
			body: {
				_id: props.updateServerInfo._id,
				ip: ip.value,
				svr_id: id.value,
				streamPort: port.value,
				gpu_number: gpu.value,
			},
		});
		message.success(`${ip.value} 이(가) 수정 되었습니다.`);
		closeModal();
		emit('fetchServerList');
	} catch (error) {
		console.log(error);
	}
};
</script>
<style scoped>
:deep(.align-buttons__dialog .el-form-item__content) {
	justify-content: flex-end;
}
</style>
