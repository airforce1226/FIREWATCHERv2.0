<template>
	<el-dialog
		v-model="predictModalFlag"
		title="이벤트 산불 확산 예상 분석"
		:close-on-click-modal="false"
		align-center
		append-to-body
		width="90%"
		:z-index="2030"
	>
		<div class="justify-around">
			<el-row class="w-full mb-2.5">
				<el-descriptions class="w-full" border>
					<el-descriptions-item
						v-for="item in cameraInfoForm"
						:key="item.id"
						:label="item.key"
					>
						<span v-if="item.key === '카메라 위치'">
							{{
								Object.values(predictEventInfo[item.value]).join(' ') ||
								'No Data'
							}}
						</span>
						<span v-else-if="item.key === '감지 구역 개수'">
							{{ predictEventInfo[item.value].length || 'No Data' }}
						</span>
						<span v-else-if="item.key === '시간'">
							{{ formatDate(predictEventInfo[item.value]) }}
						</span>
						<span v-else>
							{{ predictEventInfo[item.value] || 'No Data' }}
						</span>
					</el-descriptions-item>
				</el-descriptions>
			</el-row>
			<el-row class="w-full mb-2.5" :gutter="20">
				<el-col :span="6">
					<el-card header="이벤트 발생 이미지" class="w-full mb-2">
						<div
							class="relative overflow-hidden bg-[#292a2e]"
							id="panzoom_predict"
						>
							<div
								class="controls absolute rounded overflow-hidden z-10 bottom-4 right-4"
							>
								<button
									data-panzoom-action="zoomIn"
									class="w-8 h-8 border border-[#AB3D23] m-0 p-0 bg-[#5E1A228F] rounded flex items-center justify-center cursor-pointer mb-1"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										stroke="currentColor"
										fill="none"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="pointer-events-none w-4 h-4 stroke-white stroke-2"
									>
										<path d="M12 5v14M5 12h14" />
									</svg>
								</button>
								<button
									data-panzoom-action="zoomOut"
									class="w-8 h-8 border border-[#AB3D23] m-0 p-0 bg-[#5E1A228F] rounded flex items-center justify-center cursor-pointer"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										stroke-width="1.5"
										stroke="currentColor"
										fill="none"
										stroke-linecap="round"
										stroke-linejoin="round"
										class="pointer-events-none w-4 h-4 stroke-white stroke-2"
									>
										<path d="M5 12h14" />
									</svg>
								</button>
							</div>
							<img
								:src="predictRstImage"
								class="f-panzoom__content"
								:style="`${predictRstImage === '' ? 'visibility: hidden' : 'visibility: visible'}`"
							/>
						</div>
					</el-card>
					<el-card header="기상 정보" class="w-full">
						<div v-loading="isLoading" element-loading-text="시스템 준비 중...">
							<CardsWeatherCard
								v-if="CAMERA_LIST"
								:currentIndex="0"
								:dataList_predict="weatherDataList"
							/>
						</div>
					</el-card>
				</el-col>
				<el-col :span="6">
					<el-card header="인근 CCTV 영상" class="w-full mb-2 iframe-card">
						<div class="iframe-container">
							<iframe
								:src="iframeSource"
								class="responsive-iframe"
								frameborder="0"
								allowfullscreen
							></iframe>
						</div>
					</el-card>
					<el-card class="w-full">
						<template #header>
							<div class="flex justify-between items-center w-full">
								<!-- flex 추가 및 justify-between을 justify-end로 변경 -->
								<span>드론 촬영 영상</span>
								<el-switch
									v-model="droneSwitch"
									active-text="켜짐"
									inactive-text="꺼짐"
								></el-switch>
							</div>
						</template>
						<div
							v-loading="droneSwitch && !droneImage"
							element-loading-text="드론 영상 호출 중..."
						>
							<img
								v-if="droneSwitch"
								:src="droneImage"
								width="600"
								height="350"
								:style="`${droneImage === '' ? 'visibility: hidden' : 'visibility: visible'}`"
							/>
						</div>
					</el-card>
				</el-col>
				<el-col :span="12">
					<el-card class="h-full">
						<div
							class="h-full w-full"
							v-loading="isLoading"
							element-loading-text="산불 확산 예측 분석 중..."
						>
							<MapsMap2D
								v-if="mapFlag"
								ref="predictMap"
								:centerCoordinate="predictEventInfo.cctv_location"
								:cctv_location="predictEventInfo.cctv_location"
								:cctv_name="predictEventInfo.cctv_name"
								:roi_mapPolygon="predictEventInfo.roi_mapPolygon"
								:mapping_Info="predictMappingInfo"
								mode="PredictModal"
								class="h-full w-full"
							/>
						</div>
					</el-card>
				</el-col>
			</el-row>
		</div>
	</el-dialog>
</template>
<script setup>
import { Toolbar } from '@fancyapps/ui/dist/panzoom/panzoom.toolbar.esm.js';
import { Panzoom } from '@fancyapps/ui/dist/panzoom/panzoom.esm.js';
import '@fancyapps/ui/dist/panzoom/panzoom.toolbar.css';

const panzoom = ref();

const { message } = useAlarm();

const predictModalFlag = defineModel();

const props = defineProps([
	'cameraInfoForm',
	'predictEventInfo',
	'predictMappingInfo',
	'predictRstImage',
	'cctvRowColumnList',
	'displayList',
]);
const mapFlag = ref(false);

const isLoading = ref(true);

const droneImage = ref(null);

watch(predictModalFlag, newVal => {
	if (newVal) {
		droneSwitch.value = false;
		weatherDataList.value = [
			{
				PTY: '',
				REH: '',
				RN1: '',
				T1H: '',
				VEC: '',
				WSD: '',
			},
		];
		nextTick(() => {
			mapFlag.value = true;
			isLoading.value = true;
		});

		setTimeout(() => {
			const container = document.getElementById('panzoom_predict');
			if (container) {
				const options = {
					Toolbar: {
						display: ['zoomIn', 'zoomOut', 'zoomToFull'],
					},
				};
				panzoom.value = new Panzoom(container, options, { Toolbar });
				panzoom.value.zoomOut({
					originX: 0,
					originY: 0,
				});
				// panzoom.value.reset();
			}
		}, 30);
		let temp = props.predictEventInfo.evt_cropImg_path.split('/');
		let filename = temp[temp.length - 1];
		let videoID = filename.split('_').slice(0, 2).join('_');
		callRTSP(videoID);
		let index = props.displayList.findIndex(url =>
			url.includes(videoID.split('_')[0]),
		);
		iframeSource.value = props.displayList[index];
	} else {
		mapFlag.value = false;
		SOCKET.emit('drone_streamClose');
		SOCKET.removeListener('drone_streamres');
	}
});

const iframeSource = ref(null);

const resultPredict = ref({});
watch(
	resultPredict,
	newVal => {
		if (Object.keys(newVal).length !== 0) {
			//
		}
	},
	{ deep: true },
);

const formatDate = inputDate => {
	const formattedDate = inputDate.replace(
		/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).*/,
		'$1/$2/$3 $4:$5:$6',
	);
	return formattedDate;
};

const predictMap = ref(null);

const droneSwitch = ref(false);

SOCKET.on('result_predict', data => {
	resultPredict.value = data;
	console.log(data.weatherApiInfo);
	weatherDataList.value[0] = data.weatherApiInfo;
	data.spread_data.forEach(item => {
		if (predictMap.value) {
			predictMap.value.drawingPredictPolygon(item);
		} else {
			console.log(predictMap.value);
		}
	});
	isLoading.value = false;

	if (data.status === -4) {
		message.warning('산불 예상 확산 모델 기상청 데이터 오류');
		// predictModalFlag.value = false;
	} else {
	}
});

const weatherDataList = ref([]);
weatherDataList.value = [
	{
		PTY: '',
		REH: '',
		RN1: '',
		T1H: '',
		VEC: '',
		WSD: '',
	},
];

const callRTSP = inject('callRTSP');

watch(droneSwitch, newVal => {
	if (newVal) {
		SOCKET.emit('drone_streamreq');
		SOCKET.on('drone_streamres', data => {
			console.log('drone_streamres');
			droneImage.value = data;
			console.log(data);
		});
		SOCKET.on('drone_streamres_error', data => {
			console.log('drone_streamres_error');
		});
	} else {
		SOCKET.emit('drone_streamClose');
		SOCKET.removeListener('drone_streamres');

		droneImage.value = null;
	}
});
</script>
<style scoped>
/* el-card의 내부 컨테이너에 대한 높이 설정 */
:deep(.el-card__body) {
	height: 100%;
	padding: 5px;
}

/* panzoom */
:deep(.f-panzoom__toolbar) {
	display: none;
}
.controls button[disabled] svg {
	opacity: 0.7;
}
[data-panzoom-action='toggleFS'] g:first-child {
	display: flex;
}
[data-panzoom-action='toggleFS'] g:last-child {
	display: none;
}

.el-dialog__wrapper {
	z-index: 9999 !important;
}

/* .iframe-card {
	width: 100%;
	height: 350px; 
	overflow: hidden;
} */

/* .contained-iframe {
	width: 100%;
	height: 100%;
	border: none;
	overflow: hidden;
} */

.iframe-card {
	width: 100%;
}

.iframe-container {
	position: relative;
	overflow: hidden;
	width: 100%;
	padding-top: 56.25%; /* 16:9 비율 (9/16 = 0.5625) */
}

.responsive-iframe {
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	width: 100%;
	height: 100%;
	border: none;
}
</style>
