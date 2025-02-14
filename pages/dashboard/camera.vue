<template>
	<div>
		<div class="flex justify-start items-center">
			<div v-if="SITE === '강원도청'">
				<img
					v-if="isL2Login"
					:src="`/${siteName}.png`"
					class="mr-5"
					width="120"
					height="40"
				/>
				<img v-else src="/main.png" class="mr-5" width="120" height="40" />
			</div>
			<img
				v-if="SITE === '강원도청'"
				src="assets/svgs/gwd-logo.svg"
				class="mr-5 cursor-pointer"
				@click="router.push('/dashboard')"
			/>
			<img
				v-else
				src="assets/svgs/logo.svg"
				class="mr-5 cursor-pointer"
				@click="router.push('/dashboard')"
			/>
		</div>
		<el-divider content-position="left"
			>{{ t('cctv_management') }} ({{ cameraList.length || 0 }} 대)</el-divider
		>
		<el-row :gutter="20" class="h-[calc(100%-78px)]">
			<el-col :span="8" class="h-full">
				<div class="card h-full">
					<div class="flex justify-between mb-5">
						<el-input
							:prefix-icon="Search"
							:placeholder="t('search_by_cctv_name')"
							v-model="searchItem"
							style="width: 300px"
						/>
						<div>
							<el-tooltip content="CCTV 전체 삭제" placement="bottom">
								<div style="display: inline-block">
									<el-popconfirm
										width="200"
										confirm-button-text="삭제"
										cancel-button-text="{{ t('cancel') }}"
										:icon="WarnTriangleFilled"
										:title="t('confirm_delete')"
										@confirm="deleteAllCamera()"
									>
										<template #reference>
											<el-button size="large" :icon="DeleteFilled" class="mr-2">
											</el-button>
										</template>
									</el-popconfirm>
								</div>
							</el-tooltip>
							<el-tooltip content="CCTV 최초 등록" placement="bottom">
								<div style="display: inline-block">
									<el-popconfirm
										width="250"
										confirm-button-text="삭제"
										cancel-button-text="{{ t('cancel') }}"
										:icon="WarnTriangleFilled"
										title="최초 등록을 진행 하시겠습니까?"
										@confirm="initCameraSave()"
									>
										<template #reference>
											<el-button size="large" :icon="RefreshRight" class="mr-2">
											</el-button>
										</template>
									</el-popconfirm>
								</div>
							</el-tooltip>

							<el-button
								:icon="Plus"
								type="primary"
								size="large"
								@click="openModal('등록')"
							>
								{{ t('add_cctv') }}
							</el-button>
						</div>
					</div>
					<el-row
						class="border bg-[#26272A] border-[#2F3031] rounded py-5 px-12 text-center mb-2.5"
					>
						<el-col :span="1">NO.</el-col>
						<el-col :span="13">CCTV 명</el-col>
						<el-col :span="8">주소</el-col>
						<el-col :span="2">{{ t('management') }}</el-col>
					</el-row>
					<div
						class="h-[calc(100%-134.33px)] overflow-scroll relative scrollContainer"
					>
						<el-row
							v-for="(cctv, index) in filteredCameraList"
							class="cursor-pointer bg-[#2E2F33] border border-[#333539] mb-1 rounded py-5 px-12 text-center transition hover:bg-[#2C2023A8] hover:border-[#AB3D23]"
							:id="`camera${index}`"
							@click="selectCamera(cctv)"
						>
							<el-col :span="1">{{ index + 1 }}</el-col>
							<el-col :span="13" class="truncate">{{ cctv.cctv_name }}</el-col>
							<el-col :span="8" class="text-[15px] truncate">{{
								cctv.cctv_addressJoin
							}}</el-col>
							<el-col :span="2" class="flex">
								<el-popconfirm
									width="300"
									confirm-button-text="삭제"
									cancel-button-text="{{ t('cancel') }}"
									:icon="WarnTriangleFilled"
									:title="t('confirm_delete')"
									@confirm="deleteCamera(cctv)"
								>
									<template #reference>
										<el-button size="small" :icon="Delete" circle></el-button>
									</template>
								</el-popconfirm>
								<el-button
									size="small"
									:icon="EditPen"
									style="margin-left: 6px"
									circle
									@click="openModal('수정', cctv)"
								></el-button>
							</el-col>
						</el-row>
						<div
							v-if="showScrollButton"
							class="sticky bottom-1 left-1/2 border w-6 h-6 rounded-full flex justify-center items-center bg-[#5e1a22c4] border-[#AB3D23] animate-bounce"
						>
							<el-icon size="14" class="cursor-pointer" @click="scrollBottom()"
								><Bottom
							/></el-icon>
						</div>
					</div>
				</div>
			</el-col>
			<el-col :span="16" class="h-full">
				<div class="card h-full">
					<el-button
						type="danger"
						plain
						style="position: absolute; z-index: 99; right: 40px; top: 30px"
						:icon="Plus"
						@click="setCenterZoom()"
					>
						{{ t('save_map_central_point') }}
					</el-button>
					<div class="bg-gray-600 h-full flex justify-center items-center">
						<MapsMap2D
							ref="CameraMap"
							v-if="mapFlag"
							mode="CameraMain"
							class="w-full h-full"
							:centerCoordinate="centerCoordinate"
							:zoom="zoom"
						/>
					</div>
				</div>
			</el-col>
		</el-row>

		<ModalsCameraModal
			v-model="modal"
			:createMode="createMode"
			@fetchCCTVList="fetchCCTVList"
			:title="modalTitle"
			:updateCameraInfo="updateCameraInfo"
			:cameraList="cameraList"
		/>
	</div>
</template>
<script setup>
import { useI18n } from 'vue-i18n'; // Import useI18n

const { t } = useI18n(); // Destructure t from useI18n
import {
	Plus,
	Search,
	WarnTriangleFilled,
	RefreshRight,
	Delete,
	EditPen,
	Top,
	DeleteFilled,
	Bottom,
} from '@element-plus/icons-vue';

const router = useRouter();
const { message } = useAlarm();
const modal = defineModel('modal');
const searchItem = ref('');
const createMode = ref(true); // true: 등록, false: 수정
const modalTitle = ref(null);
const mapFlag = ref(false);
const cameraList = ref([]);
const updateCameraInfo = ref(); // 카메라 수정 정보 담을 변수
const showScrollButton = ref(true); // 카메라 리스트 스크롤 버튼
const scrollContainer = ref(); // 카메라 리스트 스크롤 컨테이너 div

const isL2Login = ref(false);
const siteName = ref(null);
onMounted(() => {
	fetchCCTVList();
	// fetchCCTVMap();
	getCenterZoom();

	// scroll
	scrollContainer.value = document.querySelector('.scrollContainer');
	if (scrollContainer.value) {
		scrollContainer.value.addEventListener('scroll', checkScroll);
	}

	isL2Login.value = !!window.sessionStorage.getItem('L2Login');
	if (isL2Login.value) {
		siteName.value = userMap[JSON.parse(sessionStorage.getItem('L2Login')).L2];
	}
});

const openModal = (title, camera) => {
	if (title === '수정') {
		createMode.value = false;
		updateCameraInfo.value = camera;
	} else {
		createMode.value = true;
	}
	modal.value = true;
	modalTitle.value = title;
};

const fetchCCTVList = async () => {
	try {
		const data = await $fetch(`${BASE_URL}/cctv/read/1`, {
			method: 'GET',
		});

		// cameraList.value = data;
		// CAMERA_LIST.value = data;
		cameraList.value = data.sort((a, b) => a.cctv_ID - b.cctv_ID);
		CAMERA_LIST.value = cameraList.value;
		mapFlag.value = true;

		cameraList.value.forEach(element => {
			// element.cctv_addressJoin = Object.values(element.cctv_address).join(' ');
			element.cctv_addressJoin =
				element.cctv_address.L2 + ' ' + element.cctv_address.L3;
		});
	} catch (error) {
		console.log(error);
	}
};

const filteredCameraList = computed(() => {
	// 필터링된 카메라 리스트
	return cameraList.value.filter(cctv =>
		cctv.cctv_name.toLowerCase().includes(searchItem.value.toLowerCase()),
	);
});

// const fetchCCTVMap = async () => {
// 	try {
// 		const data = await $fetch(`${BASE_URL}/cctv/thInfo`, {
// 			method: 'GET',
// 		});
// 		CAMERA_LIST.value = data;
// 		mapFlag.value = true;
// 	} catch (error) {
// 		console.log(error);
// 		mapFlag.value = true;
// 	}
// };

const deleteCamera = async camera => {
	try {
		await $fetch(`${BASE_URL}/cctv/delete/1/${camera._id}`, {
			method: 'GET',
		});
		fetchCCTVList();
		message.success(`${camera.cctv_name} ${t('deleted')}`);
	} catch (error) {
		console.log(error);
	}
};

//////////////////////////////////////////////////////////////////////////////////

let temp = 0;
const deleteAllCamera = () => {
	cameraList.value.forEach(async (camera, idx) => {
		try {
			await $fetch(`${BASE_URL}/cctv/delete/1/${camera._id}`, {
				method: 'GET',
			});
		} catch (error) {
			console.log(error);
		}
		if (cameraList.value.length - 1 === idx) {
			message.success(t('all_cameras_deleted'));
			fetchCCTVList();
		}
	});
};
const initCameraSave = () => {
	$fetch(`${BASE_URL}/cctv/create/1`, {
		method: 'POST',
		body: {
			url: TEMP_CAMERA[temp].url,
			cctv_name: TEMP_CAMERA[temp].cctv_name,
			inference_id: TEMP_CAMERA[temp].inference_id,
			cctv_address: {
				L1: TEMP_CAMERA[temp].L1,
				L2: TEMP_CAMERA[temp].L2,
				L3: TEMP_CAMERA[temp].L3,
			},
			weather_api_info: {
				weatherx: TEMP_CAMERA[temp].weatherx,
				weathery: TEMP_CAMERA[temp].weathery,
			},
			cctv_location: [TEMP_CAMERA[temp].lon, TEMP_CAMERA[temp].lat], // 요기 이 부분
			// cctv_location: [TEMP_CAMERA[temp].cctv_location], // 요기 이 부분 (공유 엑셀 - cctv_location 에 '[128, 37]' 형식으로 string 이 들어가 있는 데이터를 활용할 경우 )
			cctv_ID: TEMP_CAMERA[temp].cctv_ID,
		},
	})
		.then(res => {
			if (temp === TEMP_CAMERA.length - 1) {
				message.success(t('camera_reset_complete'));
				fetchCCTVList();
			} else {
				temp++;
				initCameraSave();
			}
		})
		.catch(err => {
			console.log(err);
		});
};
const test = () => {
	$fetch(`${BASE_URL}/cctv/create/1`, {
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
			// cctv_location: [TEMP_CAMERA1[temp].cctv_location], // 요기 이 부분 (공유 엑셀 - cctv_location 에 '[128, 37]' 형식으로 string 이 들어가 있는 데이터를 활용할 경우 )
			cctv_ID: TEMP_CAMERA1[temp].cctv_ID,
		},
	})
		.then(res => {
			if (temp === TEMP_CAMERA1.length - 1) {
				message.success(t('camera_reset_complete'));
				fetchCCTVList();
			} else {
				temp++;
				test();
			}
		})
		.catch(err => {
			console.log(err);
		});
};

const CameraMap = ref(null);
const setCenterZoom = () => {
	CameraMap.value.setCenterZoom();
};

const centerCoordinate = ref(ENTIRE_MAP_CENTER_COORDINATE);
const zoom = ref(10);

const getCenterZoom = () => {
	$fetch
		.raw(`${BASE_URL}/vworld/read`, {
			method: 'GET',
		})
		.then(res => {
			if (res.status === 200) {
				if (res._data.center.length > 0) {
					centerCoordinate.value = res._data.center;
				}

				if (res._data.zoom) {
					zoom.value = res._data.zoom;
				}
				message.success(t('map_central_point_retrieval_complete'));
			} else if (res.status === 204) {
				message.warning(t('no_registered_central_point'));
			}
		})
		.catch(err => {
			message.error(t('map_central_point_retrieval_failed'));
		});
};

const scrollBottom = () => {
	document
		.getElementById(`camera${cameraList.value.length - 1}`)
		.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
		});
};

const checkScroll = () => {
	if (scrollContainer.value) {
		const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
		showScrollButton.value = scrollTop + clientHeight < scrollHeight - 20;
	}
};

const selectCamera = camera => {
	centerCoordinate.value = camera.cctv_location.map(parseFloat);
	zoom.value = 13;
};

onUnmounted(() => {
	if (scrollContainer.value) {
		scrollContainer.value.removeEventListener('scroll', checkScroll);
	}
});
</script>
<style scoped>
::-webkit-scrollbar {
	display: none;
}

/* Element Plus tooltip 스타일 오버라이드 */
:deep(.el-popper) {
	max-width: none !important;
}
</style>
