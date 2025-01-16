<template>
	<div class="h-[calc(100%-48px)]">
		<el-row class="mb-2.5 h-[calc(50%-10px)]">
			<el-row
				class="bg-[#292A2E] border border-[#2F3134] rounded h-1/5 w-full mb-2.5"
			>
				<el-col :span="12" class="flex m-auto justify-center">
					<img
						src="@/assets/svgs/event-location.svg"
						class="inline-block mx-3"
					/>
					<div class="overflow-hidden flex">
						<span class="text-xs truncate" ref="cctvName">
							{{
								mapping_Info.length > 0
									? mapping_Info[0].location_name
									: EVENT_LIST.cctv_name
							}}
							<!-- {{
								EVENT_LIST.mapping_Info.length > 0
									? EVENT_LIST.mapping_Info[0].location_name
									: EVENT_LIST.cctv_name
							}} -->
							<!-- {{ EVENT_LIST?.roi_address?.split(' ').slice(-2).join(' ') }} -->
						</span>
					</div>
				</el-col>
				<el-col :span="12" class="text-center m-auto">
					<img
						src="@/assets/svgs/event-date.svg"
						class="inline-block mr-3 h-3"
					/>
					<span class="text-xs">{{
						$dayjs(EVENT_LIST?.evtTime).format('YYYY/MM/DD HH:mm:ss') ||
						'No data'
					}}</span>
				</el-col>
			</el-row>
			<el-row class="h-[calc(80%-10px)] w-full">
				<el-col :span="12" class="h-full">
					<MapsMap2D
						:centerCoordinate="
							EVENT_LIST.roi_location?.length
								? EVENT_LIST.roi_location
								: EVENT_LIST.cctv_location
						"
						:cctv_location="EVENT_LIST.cctv_location"
						:cctv_name="EVENT_LIST.cctv_name"
						:roi_mapPolygon="EVENT_LIST.roi_mapPolygon"
						:mapping_Info="mapping_Info"
						:mode="'Detail'"
						class="h-full"
					/>
				</el-col>
				<el-col :span="12" class="h-full bg-[#141515]">
					<img
						:src="eventDetailCrop_Image1"
						class="h-full m-auto ml-2.5 w-[calc(100%-10px)]"
					/>
				</el-col>
			</el-row>
		</el-row>
		<el-row class="h-1/2 bg-black justify-center items-center overflow-hidden">
			<div class="h-full m-auto aspect-[3/1]" v-if="eventRstImage === ''">
				<Loading />
			</div>
			<div class="h-full" id="panzoomDetail">
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
					:src="eventRstImage"
					class="h-full m-auto aspect-[3/1] f-panzoom__content"
				/>
			</div>
			<!-- <img
				:src="eventRstImage"
				class="h-full m-auto aspect-[3/1] f-panzoom__content"
			/> -->
		</el-row>
	</div>
</template>
<script setup>
import { Toolbar } from '@fancyapps/ui/dist/panzoom/panzoom.toolbar.esm.js';
import { Panzoom } from '@fancyapps/ui/dist/panzoom/panzoom.esm.js';
import '@fancyapps/ui/dist/panzoom/panzoom.toolbar.css';
const props = defineProps([
	'eventDetailCrop_Image1',
	'eventDetailSmsImage',
	'eventRstImage',
	'detailMappingInfo',
]);

const mapping_Info = ref([]);
const cctvName = ref(null);

const isTextEllipsized = element => {
	return element.scrollWidth > element.clientWidth;
};

const panzoom = ref();

onMounted(() => {
	nextTick(() => {
		if (cctvName.value && isTextEllipsized(cctvName.value)) {
			cctvName.value.classList.add('hover:animate-marquee');
		}
	});

	setTimeout(() => {
		const container = document.getElementById('panzoomDetail');
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
	}, 30);
});

watch(
	() => props.detailMappingInfo,
	val => {
		mapping_Info.value = val;

		nextTick(() => {
			if (cctvName.value && isTextEllipsized(cctvName.value)) {
				cctvName.value.classList.add('hover:animate-marquee');
			} else {
				cctvName.value.classList.remove('hover:animate-marquee');
			}
		});
		setTimeout(() => {
			const container = document.getElementById('panzoomDetail');
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
	},
);

// 최초 페이지 렌더링 시, 최근 이벤트 세부 정보 지도 폴리곤 정보 처리를 위한 코드
if (props.detailMappingInfo) {
	mapping_Info.value = props.detailMappingInfo;
}
</script>
<style>
@keyframes marquee {
	0% {
		transform: translateX(0%);
	}
	100% {
		transform: translateX(-100%);
	}
}

.hover\:animate-marquee:hover {
	animation: marquee 5s linear infinite;
	overflow: visible; /* 숨겨졌던 텍스트가 나타나도록 설정 */
}

/* panzoom */
.f-panzoom__toolbar {
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
