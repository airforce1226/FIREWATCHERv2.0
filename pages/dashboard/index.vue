<template>
	<div>
		<el-row :gutter="20" class="h-1/2 mb-5">
			<el-col :span="6" class="h-full">
				<div class="card h-1/2 mb-5 pb-[6.3rem]">
					<div class="flex justify-between">
						<em class="card-title"> {{ t('server_status') }} </em>
						<el-select
							style="width: 150px"
							v-model="serverStatusID"
							placeholder="서버 선택"
						>
							<el-option
								v-for="server in serverList"
								:key="server.value"
								:label="server.label"
								:value="server.value"
							/>
						</el-select>
					</div>
					<Loading v-if="serverStatusLoading" />
					<div v-else class="h-full">
						<ChartsServerStatusChart
							v-if="serverStatusInfo[serverStatusID]"
							:serverStatusInfo="serverStatusInfo[serverStatusID]"
							:statusinfoLabel="statusinfoLabel[serverStatusID]"
						/>
						<div v-else class="h-full flex justify-center items-center">
							<el-empty description="No Data" />
						</div>
					</div>
				</div>
				<el-row :gutter="20" class="h-1/2 pb-5">
					<el-col :span="12" class="h-full">
						<div class="card h-full pb-[3.5rem]">
							<em class="card-title text-sm">
								{{ t('estimated_events_per_hour') }}
							</em>
							<Loading v-if="entireLoading" />
							<div v-else class="h-full">
								<ChartsTimeChart
									v-if="entireTimeChartData"
									:data="entireTimeChartData"
								/>
								<el-empty v-else class="h-full" :image-size="100" />
							</div>
						</div>
					</el-col>
					<el-col :span="12" class="h-full">
						<div
							class="card h-full"
							:style="{
								'padding-bottom': entireLoading
									? '3.5rem'
									: entireTypeChartData
										? '5.5rem'
										: '3.5rem',
							}"
						>
							<em class="card-title text-sm">
								{{ t('event_filters_by_type') }}
							</em>
							<Loading v-if="entireLoading" />
							<div v-else class="h-full">
								<ChartsTypeChart
									v-if="entireTypeChartData"
									:data="entireTypeChartData"
								/>
								<el-empty v-else class="h-full" :image-size="100" />
							</div>
						</div>
					</el-col>
				</el-row>
			</el-col>
			<el-col :span="12" class="h-full">
				<div
					v-if="SITE === '강원도청'"
					class="flex items-center justify-center mb-4 -mt-[10px]"
				>
					<img
						v-if="isL2Login"
						:src="`/${siteName}.png`"
						class="mr-5 h-[50px]"
					/>
					<img v-else src="/main.png" class="mr-5 h-[50px]" />
					<img
						src="@/assets/svgs/logo-gwd.svg"
						class="cursor-pointer h-[50px]"
						@click="pageRefresh()"
					/>
				</div>
				<img
					v-else
					src="@/assets/svgs/logo.svg"
					class="m-auto mb-7 cursor-pointer"
					@click="pageRefresh()"
				/>
				<div class="card h-[calc(100%-58px)]">
					<el-row :gutter="20" class="h-full">
						<el-col :span="!l2Login ? 12 : 24" class="h-full">
							<el-select
								v-if="l2List.length > 2"
								class="mb-4 mr-2"
								v-model="l2"
								:placeholder="t('city_county_district')"
								style="width: 110px"
							>
								<el-option
									v-for="l2 in l2List"
									:key="l2.value"
									:label="l2.label"
									:value="l2.value"
								>
								</el-option>
							</el-select>
							<el-select
								class="mb-4 mr-2"
								v-model="l3"
								:placeholder="t('town_village_neighborhood')"
								style="width: 110px"
							>
								<el-option
									v-for="l3 in l3List"
									:key="l3.value"
									:label="l3.label"
									:value="l3.value"
								>
								</el-option>
							</el-select>
							<el-select
								class="mb-4"
								v-model="cameraName"
								:placeholder="t('camera_name')"
								style="width: 150px"
							>
								<el-option
									v-for="cameraName in cameraNameList"
									:key="cameraName.value"
									:label="cameraName.label"
									:value="cameraName.value"
								/>
							</el-select>

							<div class="h-[calc(100%-48px)]">
								<MapsMap2D
									v-if="CAMERA_LIST && centerCoordinate"
									:mode="'Main'"
									:CAMERA_LIST="CAMERA_LIST.value"
									:centerCoordinate="centerCoordinate"
									:zoom="zoom"
									class="h-[calc(100%)]"
								/>
								<!-- <MapsMap2Dv3
									ref="Map2D"
									v-if="CAMERA_LIST && centerCoordinate"
									:mode="'Main'"
									:CAMERA_LIST="CAMERA_LIST.value"
									:centerCoordinate="centerCoordinate"
									:zoom="zoom"
									class="h-[calc(100%)]"
								/> -->

								<CardsInfoCard
									:eventCount="EVENT_LIST?.evtlist?.length"
									:issueCount="
										ISSUE_CAMERA_LIST?.filter(item => item.status === true)
											.length
									"
									:cameraCount="CAMERA_LIST?.length"
									class="absolute bottom-0 left-2"
								/>
							</div>
						</el-col>
						<el-col v-if="!l2Login" :span="12" class="h-full">
							<div class="flex items-center justify-between gap-1 mb-5">
								<div class="overflow-hidden">
									<em
										ref="cctvNameElement"
										class="card-title mb-0 block truncate"
									>
										<!-- {{
											currentIndex % 2
												? CAMERA_LIST?.[currentIndex].cctv_name
												: `${CAMERA_LIST?.[currentIndex].cctv_address.L2}${CAMERA_LIST?.[currentIndex].cctv_address.L2}${CAMERA_LIST?.[currentIndex].cctv_address.L2}${CAMERA_LIST?.[currentIndex].cctv_address.L2}${CAMERA_LIST?.[currentIndex].cctv_address.L2}${CAMERA_LIST?.[currentIndex].cctv_address.L2} ${CAMERA_LIST?.[currentIndex].cctv_address.L3} ${CAMERA_LIST?.[currentIndex].cctv_name}`
										}} -->
										{{ CAMERA_LIST?.[currentIndex].cctv_name || '' }}
									</em>
								</div>

								<el-button
									:icon="VideoPlay"
									@click="callRTSP(CAMERA_LIST[currentIndex].inferCID)"
								>
									{{ t('request_live_video') }}
								</el-button>
							</div>
							<div class="h-[calc(100%-48px)]">
								<div class="h-3/5 bg-black mb-2.5">
									<ImageCarousel
										v-if="CAMERA_LIST"
										@callImage="callImage"
										@callCCTV="callCCTV"
										@callIssueCCTV="callIssueCCTV"
										@callEntireChartData="callEntireChartData"
										:cameraIndex="cameraIndex"
										:channelThumbnailImage="imageObject.channelThumbnailImage"
										class="h-full m-auto"
									/>
								</div>
								<el-row :gutter="10" class="h-[calc(40%-10px)]">
									<el-col :span="12" class="h-full">
										<CardsWeatherCard
											v-if="CAMERA_LIST"
											:currentIndex="currentIndex"
											:dataList="CAMERA_LIST"
										/>
									</el-col>
									<el-col :span="12" class="h-full">
										<div
											class="bg-[#292A2E] border border-[#2F3134] p-3.5 rounded h-full pb-[2.5rem]"
										>
											<em class="card-title text-sm mb-2.5">
												{{ t('event_filters_by_type') }}
											</em>
											<ChartsChannelChart
												v-if="CAMERA_LIST"
												:currentIndex="currentIndex"
											/>
											<Loading v-else="!monitoringLoading" />
										</div>
									</el-col>
								</el-row>
							</div>
						</el-col>
					</el-row>
				</div>
			</el-col>
			<el-col :span="6">
				<div class="card h-full">
					<div class="flex justify-between">
						<em class="card-title"> {{ t('recent_event_details') }} </em>
						<el-button
							:icon="Plus"
							@click="openInputSmokeTypeModal(EVENT_LIST?.evtid)"
							>{{ t('register_filter') }}</el-button
						>
					</div>
					<Loading v-if="eventListLoading" />
					<div v-else class="h-full">
						<div
							v-if="!EVENT_LIST"
							class="h-[calc(100%-48px)] flex justify-center items-center"
						>
							<el-empty description="No Data" />
						</div>
						<EventDetail
							v-else
							:eventDetailCrop_Image1="imageObject.eventDetailCrop_Image1"
							:eventRstImage="imageObject.eventRstImage"
							:detailMappingInfo="detailModeMappingInfo"
						/>
					</div>
				</div>
			</el-col>
		</el-row>
		<el-row :gutter="20" class="h-1/2">
			<el-col :span="6" class="h-full">
				<div class="card h-full pb-5">
					<em class="card-title"> {{ t('cctv_status_info') }} </em>
					<div class="h-[calc(100%-48px)] overflow-y-scroll">
						<Loading v-if="entireLoading" />
						<div v-else class="h-[calc(100%-52px)]">
							<div
								v-if="!ISSUE_CAMERA_LIST || !ISSUE_CAMERA_LIST?.length"
								class="h-full flex justify-center items-center"
							>
								<el-empty description="No Data" />
							</div>
							<CctvIssueList v-else />
						</div>
					</div>
				</div>
			</el-col>
			<el-col :span="12" class="h-full">
				<div class="card h-full overflow-hidden p-0" v-if="!l2Login">
					<Loading v-if="!monitoringLoading" />
					<el-tabs v-else class="h-full p-0" v-model="monitoringTab" stretch>
						<el-tab-pane
							class="h-full"
							v-for="(url, idx) in displayList"
							:label="`${idx + 1}`"
							:name="idx"
							disabled
							lazy
						>
							<div v-if="displayList.length > 1">
								<button
									v-if="monitoringTab === idx"
									:id="`${idx}_prev`"
									class="absolute top-1/2 -translate-y-1/2 left-2 backdrop-blur rounded-full w-8 h-8 flex justify-center items-center bg-[#0000003c] shadow-md transition hover:bg-[#0000006e] ml-4"
									style="z-index: 10"
									@click="prevIndex(url)"
								>
									<el-icon><ArrowLeftBold /></el-icon>
								</button>
								<button
									v-if="monitoringTab === idx"
									:id="`${idx}_next`"
									class="absolute top-1/2 -translate-y-1/2 right-2 backdrop-blur rounded-full w-8 h-8 flex justify-center items-center bg-[#0000003c] shadow-md transition hover:bg-[#0000006e] mr-4"
									style="z-index: 10"
									@click="nextIndex(url)"
								>
									<el-icon><ArrowRightBold /></el-icon>
								</button>
							</div>
							<Monitoring
								ref="MonitoringRef"
								:streamChannelID="streamChannelID"
								:monitoringTab="monitoringTab"
								:videoSource="url"
								:displayList="displayList"
								:cctvRowColumnList="cctvRowColumnList"
								class="h-full"
							/>
						</el-tab-pane>
					</el-tabs>
				</div>
				<div class="card h-full overflow-hidden p-0" v-else>
					<div class="h-3/5 bg-black mb-2.5">
						<div v-if="CAMERA_LIST" class="text-center bg-[#292a2e] py-1">
							{{ CAMERA_LIST[currentIndex].cctv_name }}
						</div>
						<ImageCarousel
							v-if="CAMERA_LIST"
							@callImage="callImage"
							@callCCTV="callCCTV"
							@callIssueCCTV="callIssueCCTV"
							@callEntireChartData="callEntireChartData"
							:cameraIndex="cameraIndex"
							:channelThumbnailImage="imageObject.channelThumbnailImage"
							class="h-[calc(100%-32px)] m-auto"
						/>
					</div>

					<el-row :gutter="10" class="h-[calc(40%-10px)]">
						<el-col :span="12" class="h-full">
							<CardsWeatherCard
								v-if="CAMERA_LIST"
								:currentIndex="currentIndex"
								:dataList="CAMERA_LIST"
							/>
						</el-col>
						<el-col :span="12" class="h-full">
							<div
								class="bg-[#292A2E] border border-[#2F3134] p-3.5 rounded h-full pb-[2.5rem]"
							>
								<em class="card-title text-sm mb-2.5">
									{{ t('event_filters_by_type') }}
								</em>
								<ChartsChannelChart
									v-if="CAMERA_LIST"
									:currentIndex="currentIndex"
								/>
								<Loading v-else="!monitoringLoading" />
							</div>
						</el-col>
					</el-row>
				</div>
			</el-col>
			<el-col :span="6" class="h-full">
				<div class="card h-full">
					<div class="flex justify-between">
						<em class="card-title mb-0"> {{ t('event_list') }} </em>
						<div>
							<el-button
								:icon="Download"
								class="mb-5"
								@click="downloadExcel()"
								>{{ t('download_as_excel') }}</el-button
							>
							<el-button
								:icon="Search"
								class="mb-5"
								@click="openEventListModal()"
								>{{ t('view_history') }}</el-button
							>
						</div>
					</div>
					<Loading v-if="eventListLoading" />
					<div v-else class="h-[calc(100%-52px)]">
						<!-- v-if="EVENT_LIST?.evtlist?.length === 0 || EVENT_LIST?.evtlist" -->
						<div
							v-if="!EVENT_LIST?.evtlist || EVENT_LIST?.evtlist?.length === 0"
							class="h-full flex justify-center items-center"
						>
							<el-empty description="No Data" />
						</div>
						<EventList
							v-else
							ref="eventListRef"
							@updateEventInfo="updateEventInfo"
							:selectedEventIndex="selectedEventIndex"
						/>
					</div>
				</div>
			</el-col>
		</el-row>

		<ModalsEventItemModal
			v-model="eventModal"
			:eventInfo="eventInfo"
			:eventModalRstImage="imageObject.eventModalRstImage"
			:detailMappingInfo="detailMappingInfo"
			:infferTCID="infferTCID"
			:cctvRowColumnList="cctvRowColumnList"
			:displayList="displayList"
			@openInputSmokeTypeModal="openInputSmokeTypeModal"
			@moveEvent="moveEvent"
		></ModalsEventItemModal>
		<ModalsEventHistorySearch
			v-model="eventListModal"
		></ModalsEventHistorySearch>
		<ModalsAlertModal
			v-model="inputSmokeTypeModalFlag"
			ok="입력"
			@confirm="saveFilter"
		/>
	</div>
</template>
<script setup>
import { useI18n } from 'vue-i18n'; // Import useI18n

const { t } = useI18n(); // Destructure t from useI18n
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {
	Plus,
	Search,
	VideoPlay,
	ArrowLeftBold,
	ArrowRightBold,
	Download,
} from '@element-plus/icons-vue';
import 'vue3-carousel/dist/carousel.css';
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel';

const { notification } = useAlarm();
const { message } = useAlarm();
const { playPopupSound } = useSound();

const l2Login = ref(sessionStorage.getItem('L2Login'));
const siteName = ref(null);

const intervalId = ref(null);
const init = async () => {
	await callCCTV();
	await callEventList();
	await callIssueCCTV();
	intervalId.value = setInterval(async () => {
		await callIssueCCTV();
	}, 1000 * 10);
	await callEntireChartData();
	await getCenterZoom();
	SOCKET.emit('evtinfoinit');
	SOCKET.emit('displayinit');
	SOCKET.emit('statusinit');
};
const isL2Login = ref(false);
onMounted(() => {
	isL2Login.value = !!window.sessionStorage.getItem('L2Login');
	if (isL2Login.value) {
		siteName.value = userMap[JSON.parse(sessionStorage.getItem('L2Login')).L2];
	}
	nextTick(() => {
		if (cctvNameElement.value && isTextEllipsized(cctvNameElement.value)) {
			cctvNameElement.value.classList.add('hover:animate-marquee');
		}
	});

	$fetch(`${BASE_URL}/system/initstatus`, {
		method: 'GET',
	})
		.then(res => {
			if (!res) {
				location.replace('/dashboard/page-loading');
			} else {
				init();
			}
		})
		.catch(err => {
			console.log(err);
		});
});

const pageRefresh = () => {
	location.href = location.href;
};

/////////////////// EventList ///////////////////
const eventListModal = ref(false);
const openEventListModal = () => {
	eventListModal.value = true;
};

//////////////////// CardsWeatherCard ///////////////////
const currentIndex = ref(0);

const updateCurrentIndex = val => {
	currentIndex.value = val;
};

//////////////////// callImage ///////////////////

const imageObject = ref({
	eventDetailCropImage: '', // 이벤트 세부정보 - CropImage
	eventDetailCrop_Image1: '', // 이벤트 세부정보 - CropImage
	channelThumbnailImage: '', // 채널별 실시간 이미지
	eventRstImage: '',
	eventModalRstImage: '',
});

const pathMapObject = {
	evt_cropImg_path_evtlist: 'eventDetailCropImage',
	evt_cropImg_path: 'eventDetailCrop_Image1',
	thumbnail_rawimgpath: 'channelThumbnailImage', // ImageCarousel 에서 호출
	evt_rstImg_path: 'eventRstImage',
	etv_modal_rstImg_path: 'eventModalRstImage',
};

const callImage = async (event, path, key, tcid, changeDetail, index) => {
	$fetch(`${BASE_URL}/cctv/image`, {
		method: 'POST',
		body: {
			path: event[path],
		},
	})
		.then(res => {
			if (key) {
				if (key === 'evt_cropImg_path_evtlist') {
					EVENT_LIST.value.evtlist.find(item => item.evtid === tcid).cropImage =
						URL.createObjectURL(res);
					if (changeDetail) {
						imageObject.value[pathMapObject[path]] = URL.createObjectURL(res);
					}
				} else if (key === 'etv_modal_rstImg_path') {
					imageObject.value[pathMapObject[key]] = URL.createObjectURL(res);
					if (changeDetail) {
						imageObject.value[pathMapObject[path]] = URL.createObjectURL(res);
					}
				}
			} else {
				imageObject.value[pathMapObject[path]] = URL.createObjectURL(res);
			}
			if (index !== undefined) {
				if (String(index)) {
					// 썸네일 원본 이미지 로딩 완료 후 Index 변경되도록 로직 변경
					updateCurrentIndex(index);
				}
			}
		})
		.catch(err => {
			console.log(err);
		});
};

/////////////////// EventList ///////////////////
const eventListLoading = ref(true);
const callEventList = async () => {
	EVENT_LIST.value = null;
	try {
		const res = await $fetch(
			FETCH_ID
				? `${BASE_URL}/cctv/event/${sessionStorage.getItem('ID')}`
				: `${BASE_URL}/cctv/event`,
			{
				method: 'GET',
			},
		);
		if (res) {
			eventListLoading.value = false;
		}

		if (res?.evtlist?.length > 0) {
			// 영상 녹화를 위한 하드 코딩 - 1204 이종훈
			// const filteredEvents = {
			// 	...res,
			// 	evtlist: res.evtlist.filter(
			// 		evt => evt.cctv_address === '영월_산불_녹전리',
			// 	),
			// };

			if (res.evt_cropImg_path !== '' && res.evt_rstImg_path !== '') {
				callImage(res, 'evt_cropImg_path'); // 이벤트 세부 정보
				callImage(res, 'evt_rstImg_path'); // 이벤트 세부정보 rst 이미지
				// 영상 녹화를 위한 하드 코딩 - 1204 이종훈
				// EVENT_LIST.value = filteredEvents;
				EVENT_LIST.value = res;

				EVENT_LIST.value.evtlist.sort(
					(a, b) => new Date(b.evtTime) - new Date(a.evtTime),
				);
			} else {
				console.log(`evt_cropImg_path&evt_rstImg_path 없음`);
			}

			// res.mapping_info - location_name 기준 중복 제거

			detailModeMappingInfo.value = res.mapping_Info;

			// 이벤트 수가 많아지면 해당 부분 많은 부하 예상
			// infinite scroll 처리 예정
			EVENT_LIST.value.evtlist.forEach((ele, idx) => {
				callImage(
					ele,
					'evt_cropImg_path',
					'evt_cropImg_path_evtlist',
					ele.evtid,
					false,
				);
			});
		} else {
			notification('Event List 없음');
		}
	} catch {
		notification($i18n.t('api_call_failed'));
	}
};

const eventModal = defineModel('eventModal');
watch(
	() => eventModal.value,
	val => {
		if (!val) {
			imageObject.value.eventModalRstImage = '';
		}
	},
);
const eventInfo = ref(null);
const detailMappingInfo = ref(null);
// 이벤트 발생 소켓

const detailModeMappingInfo = ref(null);

let eventModalTimeout;

SOCKET.on('evtinfo', (evtinfo, infferTCID) => {
	// 10초 후에 eventModal을 false로 변경하는 타이머 설정

	if (ip.value === '59.24.205.122') {
		clearTimeout(eventModalTimeout); // 이전 타이머 초기화
		eventModalTimeout = setTimeout(() => {
			eventModal.value = false;
		}, 1000 * 10);
	}

	console.log(evtinfo);
	// 동일한 infferTCID 호출중

	if (!EVENT_LIST.value?.evtlist) {
		EVENT_LIST.value = {
			evtlist: [],
		};
	}

	if (!EVENT_LIST.value.evtlist.some(item => item.evtid === infferTCID)) {
		selectedEventIndex.value = 0;

		EVENT_LIST.value.cctv_address = evtinfo.cctv_address;
		EVENT_LIST.value.cctv_location = evtinfo.cctv_location;
		EVENT_LIST.value.cctv_name = evtinfo.cctv_name;
		EVENT_LIST.value.evtIdx = evtinfo.index;
		EVENT_LIST.value.evtTime = evtinfo.evtTime;
		EVENT_LIST.value.evt_cropImg_path = evtinfo.evt_cropImg_path;
		EVENT_LIST.value.evt_rstImg_path = evtinfo.evt_rstImg_path;
		EVENT_LIST.value.evtcount = EVENT_LIST.value.evtcount + 1;
		EVENT_LIST.value.evtid = infferTCID;

		if (EVENT_LIST.value.evtlist.length > 50) {
			EVENT_LIST.value.evtlist.pop();
		}

		EVENT_LIST.value.evtlist.push({
			cctv_address: evtinfo.cctv_address,
			cctv_name: evtinfo.cctv_name,
			evtIdx: evtinfo.index,
			evtTime: evtinfo.evtTime,
			evt_cropImg_path: evtinfo.evt_cropImg_path,
			evtid: infferTCID,
			mapping_Info: deduplicateMappingInfo(evtinfo.mapping_Info),
		});
		detailModeMappingInfo.value = deduplicateMappingInfo(evtinfo.mapping_Info);
		detailMappingInfo.value = deduplicateMappingInfo(evtinfo.mapping_Info);
		eventInfo.value = evtinfo;

		imageObject.value.eventModalRstImage = '';
		imageObject.value.eventRstImage = '';
		callImage(evtinfo, 'evt_rstImg_path', 'etv_modal_rstImg_path', null, true); // 모달 이미지

		callImage(
			evtinfo,
			'evt_cropImg_path',
			'evt_cropImg_path_evtlist',
			infferTCID,
			true,
		); // 이벤트 세부 정보+이벤트 리스트 crop image
		EVENT_LIST.value.evtlist.sort(
			(a, b) => new Date(b.evtTime) - new Date(a.evtTime),
		);
		openEventModal(evtinfo, infferTCID);

		if (
			ip.value === '59.24.205.123' ||
			ip.value === '10.10.10.2' ||
			ip.value === '180.69.51.118' ||
			site.value === '강원도청'
		) {
			// 남부지방산림청 - 외부IP || 내부IP
			// 강원 도청 소리 on off // 처리 예정
			playPopupSound(); // event popup sound
		}
	}
});

const ip = ref(IP);
const site = ref(SITE);

const infferTCID = ref(null); // 모달에서 saveFilter, 실시간 영상 호출을 위한 infferTCID

const openEventModal = (evtinfo, TCID) => {
	playPopupSound();
	eventInfo.value = null;
	eventInfo.value = evtinfo;
	detailMappingInfo.value = deduplicateMappingInfo(evtinfo.mapping_Info);
	infferTCID.value = TCID;
	if (!JSON.parse(sessionStorage.getItem('historyMode'))) {
		eventModal.value = true;
	}
};

const selectedEventIndex = ref(0);

// 이벤트 선택 // selectEvent

const updateEventInfo = (event, TCID, index) => {
	selectedEventIndex.value = index; // 현재 선택되어 있는 event index 처리(테이블 선택 css 용)
	openEventModal(event, TCID);
	callImage(event, 'evt_rstImg_path', 'etv_modal_rstImg_path', false); // 이미지 리스트 선택 후 모달용 이미지
};

const eventListRef = ref(null);

const moveEvent = value => {
	selectedEventIndex.value += value;

	if (selectedEventIndex.value < 0) {
		message.warning(t('first_event'));
		selectedEventIndex.value -= value;
	} else if (EVENT_LIST.value.evtlist.length - 1 < selectedEventIndex.value) {
		message.warning(t('last_event'));

		selectedEventIndex.value -= value;
	} else {
		imageObject.value.eventModalRstImage = '';
		eventListRef.value.selectEvent(
			EVENT_LIST.value.evtlist[selectedEventIndex.value],
			selectedEventIndex.value,
		);
	}
};

/////////////////// CCTVIssueList ///////////////////
const callIssueCCTV = async () => {
	$fetch(
		FETCH_ID
			? `${BASE_URL}/cctv/noise/${sessionStorage.getItem('ID')}`
			: `${BASE_URL}/cctv/noise`,
		{
			method: 'GET',
		},
	)
		.then(res => {
			if (res.length > 0) {
				// ISSUE_CAMERA_LIST.value = res.filter(item => item.status === true); // 정상인 카메라만
				ISSUE_CAMERA_LIST.value = res;
			} else {
				notification('CCTV 장애 정보 없음');
			}
		})
		.catch(err => {
			notification(t('api_call_failed'), `${err}`);
		});
};

/////////////////// Map ///////////////////
const l2 = ref(null);
const l2List = ref([{ label: 'All', value: 'All' }]);

const l3 = ref(null);
const l3List = ref([{ label: 'All', value: 'All' }]);

const cameraName = ref(null);
const cameraNameList = ref([]);

const callCCTV = async () => {
	$fetch(
		FETCH_ID
			? `${BASE_URL}/cctv/thInfo/${sessionStorage.getItem('ID')}`
			: `${BASE_URL}/cctv/thInfo`,
		{
			method: 'GET',
		},
	)
		.then(res => {
			if (res.length > 0) {
				CAMERA_LIST.value = res;
				CAMERA_LIST.value.forEach(ele => {
					let count = 0;
					ele.rstfilterInfo.forEach(rstInfo => {
						count +=
							rstInfo.key === 'evtcount' ? rstInfo.count : -rstInfo.count;
					});
					let json = {
						key: 'final',
						count,
					};
					ele.rstfilterInfo.push(json);
				});

				res.forEach(ele => {
					createCameraNameList(ele);
					createL2List(ele);
					createL3List(ele);
				});
			} else {
				notification(t('no_camera_list_found'));
				CAMERA_LIST.value = null;
			}
		})
		.catch(err => {
			notification(t('api_call_failed'), `${err}`);
			CAMERA_LIST.value = null;
		});
};

const createCameraNameList = ele => {
	cameraNameList.value.push({
		value: ele.cctv_name,
		label: ele.cctv_name,
	});
};

const createL2List = ele => {
	const l2Item = {
		value: ele.cctv_address.L2,
		label: ele.cctv_address.L2,
	};

	if (!l2List.value.some(item => item.value === l2Item.value)) {
		l2List.value.push(l2Item);
	}
};
const createL3List = ele => {
	const l3Item = {
		value: ele.cctv_address.L3,
		label: ele.cctv_address.L3,
	};
	if (!l3List.value.some(item => item.value === l3Item.value)) {
		l3List.value.push(l3Item);
	}
};

const displayList = ref([]);
const monitoringLoading = ref(false);
const monitoringTab = ref(0);

const cctvRowColumnList = ref({});
SOCKET.on('displayinfo', (info, data) => {
	if (data) {
		data.forEach(ele => {
			cctvRowColumnList.value[Object.keys(ele)[0]] = Object.values(ele)[0];
		});
	} else {
		message.error(t('cctv_svr_empty'));
	}

	const tempinfo =
		window.location.hostname.split('.')[0] === '106'
			? info.map(ele => ele.externalURL)
			: info.map(ele => ele.url);

	// displayList에 있는 요소 중 tempinfo에 없는 요소 제거
	displayList.value.filter(ele => tempinfo.includes(ele));

	// tempinfo에 있는 요소 중 displayList에 없는 요소 추가
	tempinfo.forEach(ele => {
		if (!displayList.value.includes(ele)) {
			displayList.value.push(ele);
		}
	});

	monitoringLoading.value = true;
}); // 모니터링 init 소켓

const autoPlayTime = ref(1000 * 10);
const callRTSP = inferCID => {
	streamChannelID.value = inferCID;
	$fetch(`${BASE_URL}/cctv/singlestream/${inferCID}`, {
		method: 'GET',
	})
		.then(res => {
			message.success(`${inferCID} ${t('video_retrieved_successfully')}`);
			eventModal.value = false; // 모달 속 실시간 영상 호출시, 모달 닫기
		})
		.catch(err => {
			notification('실시간 영상 호출 실패', `${err}`);
		});

	let index = displayList.value.findIndex(url =>
		url.includes(inferCID.split('_')[0]),
	);

	// 여기서 부터 확인 - 이종훈
	// 아마 reloadingIframe() 실행이 안됐던거 같은데...
	if (monitoringTab.value === index) {
		if (MonitoringRef.value[index]) {
			MonitoringRef.value[monitoringTab.value].reloadingIframe();
		} else {
			console.log(index);
		}
	}
	console.log(`916:index = ${index}`);
	monitoringTab.value = index;
};
const closeRTSP = () => {
	streamChannelID.value = null;

	$fetch(`${BASE_URL}/cctv/sstreamclose`, {
		method: 'GET',
	})
		.then(res => {
			message.success(t('video_switching_complete'));
		})
		.catch(err => {
			console.log(err);
		});
};

provide('callRTSP', callRTSP);
provide('closeRTSP', closeRTSP);

const cameraIndex = ref();
const updateCameraIndex = val => {
	cameraIndex.value = null;
	setTimeout(() => {
		// cameraIndex.value 변경 => watch 로 감지하기 위한 setTimeout
		cameraIndex.value = String(val);
	}, 1);
};

/////////////////// ServerStatusChart, 유형별 이벤트 필터 건수, 모니터링 stream ///////////////////
// 현재 선택한 서버의 statusinfo 만 들어오는지, 연결된 모든 서버의 statusinfo 의 정보가 들어오는지에 따라 로직 달라짐
// 기본 - master server 의 정보가 들어오고, 다른 서버 선택 시-> socket emit 이든 fetch 든 server info 변경 요청
// 변경한 서버의 데이터만 받는다는 가정하에 로직 구성

const serverStatusInfo = ref([]);
const serverStatusLoading = ref(true);
const entireTypeChartData = ref(null);
const statusinfoLabel = ref([]);
let statusinfoCount = [];

const streamChannelID = ref(null);
const serverStatusID = ref('svr1');
const serverList = ref([]);

SOCKET.on('statusinfo', (info, id, cid, chartData) => {
	// Typechart
	let count = 0;
	chartData.forEach(ele => {
		count += ele.key === 'evtcount' ? ele.count : -ele.count;
	});
	let json = {
		key: 'final',
		count,
	};
	chartData.push(json);
	if (chartData) {
		entireTypeChartData.value = chartData;
	}
	// serverList 생성
	const serverItem = {
		value: id,
		label: id,
	};
	if (!serverList.value.some(item => item.value === serverItem.value)) {
		serverList.value.push(serverItem);
	}
	// server status chart
	serverStatusInfo.value[id] = info;
	serverStatusLoading.value = false;
	if (!statusinfoLabel.value[id]) {
		statusinfoLabel.value[id] = [];
	}
	if (statusinfoLabel.value[id].length > 9) {
		statusinfoLabel.value[id].shift();
	}
	if (!statusinfoCount[id]) {
		statusinfoCount[id] = 1;
	}
	statusinfoLabel.value[id].push(statusinfoCount[id]);
	statusinfoCount[id] += 5;
	if (statusinfoCount[id] > 60) {
		statusinfoCount[id] = 1;
	}
	// monitoring stream
	// cid : 현재 단일채널 -> chennel ID // 전체 채널 -> null
	streamChannelID.value = cid;
	if (streamChannelID.value) {
		let index = displayList.value.findIndex(url =>
			url.includes(cid.split('_')[0]),
		);
		if (index !== -1) {
			monitoringTab.value = index;
		}
	}

	// callIssueCCTV(); // mounted 되고 10초마다 setInterval 변경
});

//////////////////////-ETC-/////////////////////////////
const inputSmokeTypeModalFlag = ref(false);
const filterTCID = ref(null);
const openInputSmokeTypeModal = tcid => {
	filterTCID.value = tcid;
	if (ip.value === '121.188.22.195') {
		inputSmokeTypeModalFlag.value = true;
	} else {
		saveFilter();
	}
};

const saveFilter = type => {
	console.log(filterTCID.value);
	$fetch
		.raw(`${BASE_URL}/cctv/savefilter/${filterTCID.value}/${type || ''}`, {
			method: 'GET',
		})
		.then(res => {
			if (res.status === 200) {
				message.success(t('filter_registered'));
			} else {
				message.warning(t('filter_registration_error'));
			}
		})
		.catch(err => {
			console.log(err);
		});
};

const entireTimeChartData = ref(null);
const entireLoading = ref(true);
const callEntireChartData = () => {
	$fetch(
		FETCH_ID
			? `${BASE_URL}/cctv/totalquery/1/${sessionStorage.getItem('ID')}`
			: `${BASE_URL}/cctv/totalquery/1`,
		{
			method: 'GET',
		},
	)
		.then(res => {
			entireLoading.value = false;
			entireTimeChartData.value = res.eventquery3_info;
		})
		.catch(err => {
			console.log(err);
		});
};

const cctvNameElement = ref(null);
const isTextEllipsized = element => {
	return element.scrollWidth > element.clientWidth;
};

watch(
	() => currentIndex.value,
	val => {
		nextTick(() => {
			if (cctvNameElement.value) {
				if (cctvNameElement.value && isTextEllipsized(cctvNameElement.value)) {
					cctvNameElement.value.classList.add('hover:animate-marquee');
				} else {
					cctvNameElement.value.classList.remove('hover:animate-marquee');
				}
			}
		});
		let index = displayList.value.findIndex(url =>
			url.includes(CAMERA_LIST.value[val].inferCID.split('_')[0]),
		);
		if (index !== -1 && !streamChannelID.value) {
			monitoringTab.value = index;
		}
	},
);

const MonitoringRef = ref(null);

const updateMonitoringTab = val => {
	monitoringTab.value = val;

	let videoKey = displayList.value[monitoringTab.value].split('/').pop();

	let cameraIndex = -1;
	// 해당 videoKey / thinfo 를 통해 받은 CAMERA_LIST 의 값 속 cctvRowColumnList 의 값이
	for (let i = 0; i < cctvRowColumnList.value[videoKey][0].length; i++) {
		if (cameraIndex === -1) {
			cameraIndex = CAMERA_LIST.value.findIndex(
				item => item.inferCID === cctvRowColumnList.value[videoKey][0][i],
			);
		}
	}
	updateCameraIndex(cameraIndex);
};

watch(
	() => monitoringTab.value,
	val => {
		if (monitoringLoading.value) {
			if (MonitoringRef.value) {
				if (MonitoringRef.value[monitoringTab.value]) {
					MonitoringRef.value[monitoringTab.value].reloadingIframe();
				}
			}
		}
	},
);

watch(
	() => l2.value,
	val => {
		l3List.value = [{ label: 'All', value: 'All' }];
		l3.value = null;
		cameraName.value = null;
		cameraNameList.value = [];
		if (val === 'All') {
			CAMERA_LIST.value.forEach(ele => {
				createL3List(ele);
				createCameraNameList(ele);
			});
			l3.value = null;
		} else {
			CAMERA_LIST.value
				.filter(item => item.cctv_address.L2 === val)
				.forEach(ele => {
					createL3List(ele);
					createCameraNameList(ele);
				});
		}
	},
);

watch(
	() => l3.value,
	val => {
		if (val) {
			cameraName.value = null;
			cameraNameList.value = [];
			if (val === 'All') {
				CAMERA_LIST.value
					.filter(item => item.cctv_address.L2 === l2.value)
					.forEach(ele => {
						createCameraNameList(ele);
					});
			} else {
				CAMERA_LIST.value
					.filter(
						item =>
							item.cctv_address.L2 === l2.value && item.cctv_address.L3 === val,
					)
					.forEach(ele => {
						createCameraNameList(ele);
					});
			}
		}
	},
);

watch(
	() => cameraName.value,
	val => {
		if (val) {
			zoom.value = 14;
			centerCoordinate.value = CAMERA_LIST.value.find(
				item => item.cctv_name === val,
			).cctv_location;
		}
	},
);

const zoom = ref(10);

const centerCoordinate = ref(ENTIRE_MAP_CENTER_COORDINATE);

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
				message.warning('등록된 중심점 없음');
			}
		})
		.catch(err => {
			message.error(t('map_central_point_retrieval_failed'));
		});
};

onUnmounted(() => {
	SOCKET.removeListener('displayinfo');
	SOCKET.removeListener('statusinfo');
	SOCKET.removeListener('evtinfo');
	if (intervalId.value) {
		clearInterval(intervalId.value);
		intervalId.value = null;
	}
});

const deduplicateMappingInfo = data => {
	return Object.values(
		data.reduce((acc, item) => {
			if (item.location_name) {
				acc[item.location_name] = item;
			}
			return acc;
		}, {}),
	);
};

const prevIndex = url => {
	MonitoringRef.value[monitoringTab.value].reloadingIframe();

	let tabIndex = displayList.value.findIndex(item => item === url);

	let index = 0;
	if (tabIndex <= 0) {
		index = displayList.value.length - 1;
	} else {
		index = tabIndex - 1;
	}

	updateMonitoringTab(index);
};

const nextIndex = url => {
	MonitoringRef.value[monitoringTab.value].reloadingIframe();

	let tabIndex = displayList.value.findIndex(item => item === url);

	let index = 0;
	if (tabIndex >= displayList.value.length - 1) {
		index = 0;
	} else {
		index = tabIndex + 1;
	}
	updateMonitoringTab(index);
};

const downloadExcel = async () => {
	try {
		// Check if EVENT_LIST and evtlist exist

		if (!EVENT_LIST.value || !EVENT_LIST.value.evtlist) {
			console.error('No event list data available for download.');
			return;
		}

		// Convert evtlist to a format suitable for XLSX
		console.log(EVENT_LIST.value.evtlist);
		const evtlist = EVENT_LIST.value.evtlist.map(event => ({
			IDX: event.evtIdx,
			'Event ID': event.evtid,
			'CCTV Name': event.cctv_name,
			'Event Time': event.evtTime,
			'Event Address': event.cctv_address,
		}));

		// Create a new workbook and a new worksheet
		const worksheet = XLSX.utils.json_to_sheet(evtlist);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Event List');

		// Set column widths to auto fit
		const colWidths = [];
		evtlist.forEach(event => {
			Object.keys(event).forEach((key, index) => {
				const cellValue = String(event[key]);
				// 한글이 포함되어 있는지 확인
				const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(cellValue);
				// 기본 여유 공간 2에 한글이 포함된 경우 5를 추가
				const padding = hasKorean ? 7 : 2;
				const cellWidth = cellValue.length + padding;

				if (!colWidths[index] || colWidths[index] < cellWidth) {
					colWidths[index] = cellWidth;
				}
			});
		});

		worksheet['!cols'] = colWidths.map(width => ({ wch: width }));

		// Generate the Excel file and trigger the download
		XLSX.writeFile(workbook, 'event_list.xlsx');
	} catch (error) {
		console.error('Error downloading Excel file:', error);
	}
};
</script>
<style>
.carousel__viewport {
	height: 100%;
}
.carousel__track {
	height: 100%;
}
.carousel__slide {
	height: 100%;
}
.el-tabs__header {
	display: none;
}
.el-tabs__content {
	height: 100%;
}

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
</style>
