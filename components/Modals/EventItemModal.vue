<template>
	<el-dialog
		v-model="eventModal"
		:close-on-click-modal="false"
		title="이벤트 세부 정보"
		align-center
		:width="'1100'"
		class="fixed relative"
		:z-index="2000"
	>
		<el-row class="w-full mb-2.5">
			<el-descriptions class="w-full" border>
				<el-descriptions-item
					v-for="item in cameraInfoForm"
					:key="item.id"
					:label="item.key"
				>
					<span v-if="item.key === '카메라 위치'">
						{{ Object.values(eventInfo[item.value]).join(' ') || 'No Data' }}
					</span>
					<span v-else-if="item.key === '감지 구역 개수'">
						{{ eventInfo[item.value].length || 'No Data' }}
					</span>
					<span v-else-if="item.key === '시간'">
						{{ formatDate(eventInfo[item.value]) }}
					</span>
					<span v-else-if="item.key === '카메라 명'">
						{{ eventInfo[item.value] || 'No Data' }}
						{{ eventInfo.Type ? '- ' + eventInfo.Type : '' }}
					</span>
					<span v-else>
						{{ eventInfo[item.value] || 'No Data' }}
					</span>
				</el-descriptions-item>
			</el-descriptions>
		</el-row>

		<el-row :gutter="10" class="h-[300px]">
			<el-col :span="12" class="h-full">
				<button
					class="absolute top-1/2 -translate-y-1/2 left-2 backdrop-blur rounded-full w-8 h-8 flex justify-center items-center bg-[#0000003c] shadow-md transition hover:bg-[#0000006e] z-[99]"
					@click="moveEvent(-1)"
				>
					<el-icon><ArrowLeftBold /></el-icon>
				</button>
				<div
					class="relative overflow-hidden bg-[#292a2e] h-full"
					:id="`panzoom_${mode}`"
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
					<div v-if="eventModalRstImage === ''" style="height: 300px">
						<Loading />
					</div>
					<img
						:src="eventModalRstImage"
						class="f-panzoom__content"
						:style="`${eventModalRstImage === '' ? 'visibility: hidden' : 'visibility: visible'}`"
					/>
				</div>
			</el-col>
			<el-col :span="12" class="h-full">
				<MapsMap2D
					v-if="mapFlag"
					:centerCoordinate="eventInfo.cctv_location"
					:cctv_location="eventInfo.cctv_location"
					:cctv_name="eventInfo.cctv_name"
					:roi_mapPolygon="eventInfo.roi_mapPolygon"
					:mapping_Info="mappingInfo"
					mode="DetailModal"
					class="h-full"
				/>
				<button
					class="absolute top-1/2 -translate-y-1/2 right-2 backdrop-blur rounded-full w-8 h-8 flex justify-center items-center bg-[#0000003c] shadow-md transition hover:bg-[#0000006e]"
					@click="moveEvent(1)"
				>
					<el-icon><ArrowRightBold /></el-icon>
				</button>
			</el-col>
		</el-row>
		<el-row v-if="mappingInfo.length > 0" :gutter="10">
			<el-col :span="24">
				<el-table :data="mappingInfo" max-height="400">
					<el-table-column property="location_name" label="구역 명" />
					<el-table-column property="mapPolygon_center[0]" label="경도" />
					<el-table-column property="mapPolygon_center[1]" label="위도" />
				</el-table>
			</el-col>
		</el-row>
		<div class="mt-5 flex justify-between">
			<div>
				<el-button :icon="Plus" @click="sendSaveFilter()">필터 등록</el-button>

				<el-button
					v-if="!l2Login && mode !== 'history'"
					:icon="VideoPlay"
					@click="sendCallRTSP()"
					>실시간 영상 요청</el-button
				>
			</div>
			<el-button
				v-if="(SITE === '강원도청') & (mode !== 'history')"
				@click="callFireSpreadPrediction()"
				class="hover:text-[#cd4c54]"
			>
				산불 대응 의사 결정
			</el-button>
		</div>
	</el-dialog>

	<modalsPredictModal
		v-model="predictModalFlag"
		:predictEventInfo="predictEventInfo"
		:cameraInfoForm="cameraInfoForm"
		:predictMappingInfo="predictMappingInfo"
		:predictRstImage="predictRstImage"
		:cctvRowColumnList="cctvRowColumnList"
		:displayList="displayList"
	>
	</modalsPredictModal>
</template>

<script setup>
const { message } = useAlarm();

import {
	Plus,
	VideoPlay,
	ArrowLeftBold,
	ArrowRightBold,
} from '@element-plus/icons-vue';

import { Toolbar } from '@fancyapps/ui/dist/panzoom/panzoom.toolbar.esm.js';
import { Panzoom } from '@fancyapps/ui/dist/panzoom/panzoom.esm.js';
import '@fancyapps/ui/dist/panzoom/panzoom.toolbar.css';
import { Close } from '@element-plus/icons-vue';
import { onClickOutside, useEventListener } from '@vueuse/core';

const l2Login = ref(sessionStorage.getItem('L2Login'));

const eventModal = defineModel();
const props = defineProps([
	'eventInfo',
	'eventModalRstImage',
	'infferTCID',
	'mode',
	'detailMappingInfo',
	'cctvRowColumnList',
	'displayList',
]);

const emit = defineEmits(['openInputSmokeTypeModal', 'moveEvent']);

const cameraInfoForm = reactive([
	{
		key: '카메라 위치',
		value: 'cctv_address',
	},
	{
		key: '카메라 명',
		value: 'cctv_name',
	},
	{
		key: '시간',
		value: 'evtTime',
	},
	{
		key: '탐지 결과',
		value: 'evtClass_name',
	},
	{
		key: '세부 결과',
		value: 'evtDlInfo',
	},
	{
		key: '감지 구역 개수',
		value: 'mapping_Info',
	},
]);

const mappingInfo = ref([]);
const panzoom = ref();

watch(
	() => props.detailMappingInfo,
	val => {
		if (val) {
			// eventModal === true  변한 뒤 처리되어야하는 logic
			// nextTick(() => {
			mappingInfo.value = val;
			// });
			setTimeout(() => {
				const container = document.getElementById(`panzoom_${props.mode}`);
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
		}
	},
);

const mapFlag = ref(false);
watch(
	() => eventModal.value,
	newVal => {
		if (newVal) {
			setTimeout(() => {
				const container = document.getElementById(`panzoom_${props.mode}`);
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
				}
				mapFlag.value = true;
			}, 30);
		} else {
			mapFlag.value = false;
		}
	},
);

const sendSaveFilter = () => {
	emit('openInputSmokeTypeModal', props.infferTCID);
};

const callRTSP = inject('callRTSP');

const sendCallRTSP = () => {
	callRTSP(props.infferTCID);
};

const moveEvent = value => {
	emit('moveEvent', value);

	setTimeout(() => {
		const container = document.getElementById(`panzoom_${props.mode}`);
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
		// mappingInfo.value = props.eventInfo.mapping_Info; // 중복 처리 안된 리스트
	}, 100);
};

const predictEventInfo = ref({});
const predictMappingInfo = ref([]);
const predictRstImage = ref(null);
const callFireSpreadPrediction = () => {
	$fetch
		.raw(`${BASE_URL}/wildfire/predict/${props.infferTCID}/${SOCKET.id}`, {
			method: 'GET',
		})
		.then(res => {
			predictModalFlag.value = true;
			predictEventInfo.value = props.eventInfo;
			predictMappingInfo.value = mappingInfo.value;
			predictRstImage.value = props.eventModalRstImage;
			message.success('산불 예상 확산 모델 호출 완료');
		})
		.catch(err => {
			message.error('산불 예상 확산 모델 호출 실패');
		});
};

const predictPolygon = ref([]);
const predictModalFlag = defineModel('predictModalFlag');

const formatDate = inputDate => {
	const formattedDate = inputDate.replace(
		/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).*/,
		'$1/$2/$3 $4:$5:$6',
	);
	return formattedDate;
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
	transition: all 0.3s ease-out;
}
.slide-enter-from,
.slide-leave-to {
	transform: translateY(-5%);
	opacity: 0;
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
</style>
