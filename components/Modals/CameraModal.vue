<template>
	<el-dialog v-model="modal" :title="title" width="600" align-center>
		<el-form ref="formRef" :model="form" label-width="auto" :rules="rules">
			<el-form-item label="RTSP URL" prop="rtsp">
				<div class="flex w-full">
					<el-input v-model="form.rtsp" :disabled="isCheckedDuplicate_rtsp" />
					<el-button
						@click="checkDuplicateRTSP"
						type="primary"
						class="ml-2.5"
						:disabled="isCheckedDuplicate_rtsp || form.rtsp === ''"
					>
						{{ t('rtsp_duplicate_check') }}
					</el-button>
				</div>
			</el-form-item>
			<el-form-item label="CCTV ID" prop="id">
				<el-input v-model="form.id" />
			</el-form-item>
			<el-form-item :label="t('camera_name')" prop="name">
				<el-input v-model="form.name" />
			</el-form-item>
			<el-form-item :label="t('analysis_server')" prop="inferenceID">
				<el-select
					v-model="form.inferenceID"
					:placeholder="t('select_analysis_server')"
				>
					<el-option
						v-for="server in serverList"
						:key="server.id"
						:value="server"
					/>
				</el-select>
			</el-form-item>
			<el-form-item label="주소" required>
				<el-col :span="8">
					<el-form-item prop="l1">
						<el-select v-model="form.l1" placeholder="L1" style="width: 153px">
							<el-option v-for="L1 in L1List" :label="L1" :value="L1" />
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item prop="l2">
						<el-select v-model="form.l2" placeholder="L2" style="width: 153px">
							<el-option v-for="L2 in L2List" :label="L2" :value="L2" />
						</el-select>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item prop="l3">
						<el-select v-model="form.l3" placeholder="L3" style="width: 153px">
							<el-option v-for="L3 in L3List" :label="L3" :value="L3" />
						</el-select>
					</el-form-item>
				</el-col>
			</el-form-item>
			<el-form-item label="경도" prop="longitude">
				<el-input v-model="form.longitude" />
			</el-form-item>
			<el-form-item label="위도" prop="latitude">
				<el-input v-model="form.latitude" />
			</el-form-item>
			<el-form-item class="align-buttons__dialog">
				<el-button @click="modal = false">{{ t('cancel') }}</el-button>
				<el-button
					v-if="createMode"
					type="primary"
					@click="submitForm(formRef)"
				>
					{{ t('register') }}
				</el-button>
				<el-button v-else type="primary" @click="submitForm(formRef)">
					수정하기
				</el-button>
			</el-form-item>
		</el-form>
	</el-dialog>
</template>

<script setup>
import { useI18n } from 'vue-i18n'; // Import useI18n

const { t } = useI18n(); // Destructure t from useI18n
const modal = defineModel();
const props = defineProps([
	'title',
	'updateCameraInfo',
	'createMode',
	'cameraList',
]);
const emit = defineEmits(['fetchCCTVList']);
const { message } = useAlarm();

const formRef = ref();
const form = reactive({
	rtsp: '',
	id: '',
	name: '',
	inferenceID: '',
	l1: '',
	l2: '',
	l3: '',
	longitude: '',
	latitude: '',
});

const L1List = ref([]);

addressL1L2L3.forEach(ele => {
	if (!L1List.value.some(item => item === ele.L1)) {
		L1List.value.push(ele.L1);
	}
});

watch(
	() => form.l1,
	val => {
		if (val !== '') {
			form.l2 = '';
			form.l3 = '';
			L2List.value = [
				...new Set(
					addressL1L2L3
						.filter(address => address.L1 === val)
						.map(address => address.L2),
				),
			];
		}
	},
);

watch(
	() => form.l2,
	val => {
		if (val !== '') {
			form.l3 = '';
			L3List.value = [
				...new Set(
					addressL1L2L3
						.filter(address => address.L1 === form.l1)
						.filter(address => address.L2 === val)
						.map(address => address.L3),
				),
			];
		}
	},
);

const L2List = ref([]);
const L3List = ref([]);

const rules = ref({
	rtsp: [
		{
			required: true,
			message: t('input_rtsp_url'),
			trigger: 'blur',
		},
	],
	id: [{ required: true, message: t('input_cctv_id'), trigger: 'blur' }],
	name: [
		{
			required: true,
			message: t('input_camera_name'),
			trigger: 'blur',
		},
	],
	inferenceID: [
		{
			required: true,
			message: t('select_analysis_server'),
			trigger: 'change',
		},
	],

	l1: [
		{
			required: true,
			message: t('select_province'),
			trigger: 'change',
		},
	],
	l2: [{ required: true, message: t('select_city'), trigger: 'change' }],
	l3: [{ required: true, message: t('select_town'), trigger: 'change' }],
	longitude: [
		{
			required: true,
			message: t('input_longitude'),
			trigger: 'blur',
		},
	],
	latitude: [
		{
			required: true,
			message: t('input_latitude'),
			trigger: 'blur',
		},
	],
});

const isCheckedDuplicate_rtsp = ref(false);
const checkDuplicateRTSP = async () => {
	try {
		await $fetch(`${BASE_URL}/cctv/checkurl/1`, {
			method: 'POST',
			body: {
				url: form.rtsp,
			},
		});
		message.success(t('valid_rtsp_url'));
		isCheckedDuplicate_rtsp.value = true;
	} catch (error) {
		if (error.response && error.response.status === 409) {
			message.error(t('rtsp_url_already_registered'));
		} else {
			message.error(t('rtsp_url_check_error'));
		}
	}
};

const isSelectedCameraId = ref(null);

watchEffect(() => {
	if (modal.value) {
		nextTick(() => {
			formRef.value.resetFields();
			isCheckedDuplicate_rtsp.value = false;

			fetchInferenceID();

			if (!props.createMode) {
				console.log(props.updateCameraInfo);
				form.rtsp = props.updateCameraInfo.url;
				form.id = props.updateCameraInfo.cctv_ID;
				form.name = props.updateCameraInfo.cctv_name;
				form.inferenceID = props.updateCameraInfo.inference_id;
				form.longitude = props.updateCameraInfo.cctv_location[0];
				form.latitude = props.updateCameraInfo.cctv_location[1];
				form.l1 = props.updateCameraInfo.cctv_address.L1;
				setTimeout(() => {
					form.l2 = props.updateCameraInfo.cctv_address.L2;
					setTimeout(() => {
						form.l3 = props.updateCameraInfo.cctv_address.L3;
					}, 10);
				}, 10);
				isSelectedCameraId.value = props.updateCameraInfo._id;
			}
		});
	}
});

const serverList = ref([]);
const fetchInferenceID = async () => {
	try {
		const data = await $fetch(`${BASE_URL}/inferSvr/read/2`);
		console.log(data);
		serverList.value = data;
	} catch (error) {
		console.log(error);
	}
};

const createCamera = async form => {
	try {
		await $fetch(`${BASE_URL}/cctv/create/1`, {
			method: 'POST',
			body: {
				url: form.rtsp,
				cctv_name: form.name,
				inference_id: form.inferenceID,
				cctv_address: {
					L1: form.l1,
					L2: form.l2,
					L3: form.l3,
				},
				weather_api_info: {
					weatherx: addressL1L2L3.find(
						address =>
							address.L1 === form.l1 &&
							address.L2 === form.l2 &&
							address.L3 === form.l3,
					).X,
					weathery: addressL1L2L3.find(
						address =>
							address.L1 === form.l1 &&
							address.L2 === form.l2 &&
							address.L3 === form.l3,
					).Y,
				},
				cctv_location: [form.longitude, form.latitude],
				cctv_ID: form.id,
			},
		});
	} catch (error) {
		console.log(error);
	}
};

const updateCamera = async () => {
	try {
		await $fetch(`${BASE_URL}/cctv/update/1`, {
			method: 'POST',
			body: {
				url: form.rtsp,
				cctv_ID: form.id,
				cctv_name: form.name,
				cctv_location: [form.longitude, form.latitude],
				inference_id: form.inferenceID,
				_id: props.updateCameraInfo._id,
				cctv_address: {
					L1: form.l1,
					L2: form.l2,
					L3: form.l3,
				},
				weather_api_info: {
					weatherx: addressL1L2L3.find(
						address =>
							address.L1 === form.l1 &&
							address.L2 === form.l2 &&
							address.L3 === form.l3,
					).X,
					weathery: addressL1L2L3.find(
						address =>
							address.L1 === form.l1 &&
							address.L2 === form.l2 &&
							address.L3 === form.l3,
					).Y,
				},
			},
		});

		message.success(`${form.name} 이(가) 수정 되었습니다.`);
	} catch (error) {
		console.log(error);
		message.error(`${form.name} ${t('update_failed')}`);
	}
};
// 기존 카메라 업데이트
const updateCamera1 = async temp => {
	console.log('updateCamera1');
	try {
		await $fetch(`${BASE_URL}/cctv/update/1`, {
			method: 'POST',
			body: {
				url: TEMP_CAMERA1[temp].url,
				cctv_name: TEMP_CAMERA1[temp].cctv_name,
				inference_id: TEMP_CAMERA1[temp].inference_id,
				cctv_address: {
					L1: TEMP_CAMERA1[temp].L1,
					L2: TEMP_CAMERA1[temp].L2,
					L3: TEMP_CAMERA1[temp].L3,
				},
				weather_api_info: {
					weatherx: TEMP_CAMERA1[temp].weatherx,
					weathery: TEMP_CAMERA1[temp].weathery,
				},
				cctv_location: [TEMP_CAMERA1[temp].lon, TEMP_CAMERA1[temp].lat], // 요기 이 부분
				cctv_ID: TEMP_CAMERA1[temp].cctv_ID,
				Type: TEMP_CAMERA1[temp].Type,
			},
		});
	} catch (error) {
		console.log(error);
	}
};
const submitForm = formRef => {
	if (!formRef) return;
	formRef.validate(async valid => {
		if (valid) {
			if (props.createMode) {
				await createCamera(form);
				message.success(`${form.name} ${t('registered')}`);
			} else {
				// 기존 카메라 업데이트 코드
				// for (let i = 0; i < TEMP_CAMERA1.length; i++) {
				// 	await updateCamera1(i);
				// }
				await updateCamera(form);
			}
			modal.value = false;
			emit('fetchCCTVList');
		} else {
			return false;
		}
	});
};

const resetForm = formRef => {
	console.log(formRef);
	if (!formRef) return;
	formRef.resetFields();
};
</script>
<style scoped>
:deep(.align-buttons__dialog .el-form-item__content) {
	justify-content: flex-end;
}
</style>
