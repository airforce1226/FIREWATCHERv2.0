<template>
	<div>
		<div class="flex justify-between mb-5">
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
					v-if="SITE === '강원도청'"
					src="assets/svgs/gwd-logo.svg"
					class="mr-5 cursor-pointer"
					@click="router.push('/dashboard')"
				/>
			</div>
			<img
				v-else
				src="assets/svgs/logo.svg"
				class="mr-5 cursor-pointer"
				@click="router.push('/dashboard')"
			/>
			<div class="flex">
				<el-button type="primary" size="large" @click="callCCTV()"
					>카메라 선택
				</el-button>
				<el-popconfirm
					width="250"
					confirm-button-text="재시작"
					cancel-button-text="취소"
					:icon="WarnTriangleFilled"
					title="시스템을 재시작하시겠습니까?"
					@confirm="callRestart()"
				>
					<template #reference>
						<el-button type="primary" size="large">시스템 재시작</el-button>
					</template>
				</el-popconfirm>
			</div>
		</div>
		<el-divider content-position="left">감지구역 설정</el-divider>
		<el-row :gutter="20" style="height: calc(100% - 89px)">
			<el-col :span="12" class="h-full">
				<div class="card h-full">
					<div class="mb-5 flex justify-between">
						<div class="flex items-center">
							<el-tooltip
								placement="top"
								effect="firewatcher"
								content="마우스 좌클릭으로 위치를 그리고 우클릭으로 위치 그리기를 마칩니다."
							>
								<el-icon color="#AB3D23" class="mr-2.5"><InfoFilled /></el-icon>
							</el-tooltip>
							<em class="card-title mb-0 text-base"
								>탐지 구역 설정
								{{
									selectedCamera.cctv_name
										? `- ${selectedCamera.cctv_name}`
										: ''
								}}
								{{ selectedPresetName ? `/ ${selectedPresetName}` : '' }}</em
							>
						</div>
						<div>
							<el-button
								:disabled="!(thumbnailImage && isSelectCenterMarker)"
								@click="getGridIndexList = []"
								>탐지구역 전체 해제</el-button
							>
							<el-button
								:disabled="!(thumbnailImage && isSelectCenterMarker)"
								@click="setGrid()"
								>탐지구역 확정</el-button
							>
						</div>
					</div>
					<div>
						<CanvasRoiCanvas
							ref="CanvasComponentRef"
							:thumbnailImage="thumbnailImage"
							:polygons="polygons"
							:isSelectCenterMarker="isSelectCenterMarker"
							:getGridIndexList="getGridIndexList"
							@removeSelectedPolygon="removeSelectedPolygon"
							@updateGrid="updateGrid"
						></CanvasRoiCanvas>
					</div>
					<div class="h-[calc(35.5%)] mt-5">
						<el-table
							:data="areaList"
							height="100%"
							@row-click="rowClick"
							row-class-name="cursor-pointer"
						>
							<el-table-column
								prop="location_name"
								label="위치 명"
								align="center"
							/>
							<el-table-column
								prop="grid_info.length"
								label="구역 개수"
								align="center"
							/>
						</el-table>
					</div>
				</div>
			</el-col>
			<el-col :span="12" class="h-full">
				<div class="card h-full">
					<div class="mb-5 flex justify-between">
						<div class="flex items-center">
							<el-tooltip
								placement="top"
								effect="firewatcher"
								content="구역 설정 클릭 후 마우스 좌클릭으로 폴리곤을 그리고 우클릭으로 폴리곤 그리기를 마칩니다."
							>
								<el-icon color="#AB3D23" class="mr-2.5"><InfoFilled /></el-icon>
							</el-tooltip>
							<em class="card-title mb-0 text-base">
								지도 설정
								{{
									selectedCamera.cctv_name
										? `- ${selectedCamera.cctv_name}`
										: ''
								}}
							</em>
						</div>
						<div>
							<el-button
								@click="setCameraView()"
								:disabled="!(mapCenter.length > 0)"
								>화각 설정</el-button
							>
							<el-button
								@click="initCameraView()"
								:disabled="!(mapCenter.length > 0)"
								>화각 초기화</el-button
							>
							<el-button
								@click="moveCameraView(cameraView)"
								:disabled="!(mapCenter.length > 0)"
								>저장된 카메라 화각 이동</el-button
							>
							<!-- <el-button @click="moveCenterView()"
								>중심 지점으로 이동</el-button
							> -->

							<!-- ver 3.0 기준 -->
							<!-- <el-button @click="drawingPolygonAndCenterMarker()"
								>폴리곤 그리기
							</el-button>
							<el-button @click="setVisibleNavigation()"
								>네비게이션
								{{ navigationFlag ? '숨기기' : '보이기' }}</el-button
							> -->
						</div>
					</div>
					<div
						class="flex justify-center rounded bg-gray-600 h-1/2 mb-5 relative"
					>
						<MapsMap3Dv2
							ref="MapComponentRef"
							class="w-full h-full"
							:class="isStartCreateMapMarker ? 'cursor-crosshair' : ''"
							:mapCenter="mapCenter"
							:mapZIndex="mapZIndex"
							:mapHeading="mapHeading"
							:mapTilt="mapTilt"
							:mapRoll="mapRoll"
							:markersVisible="markersVisible"
							@drawingPolygonAndCenterMarker="drawingPolygonAndCenterMarker"
							@detectionAreaRead="detectionAreaRead"
							@updateCameraView="updateCameraView"
							@selectCenterMarker="selectCenterMarker"
							@updateMarkersVisible="updateMarkersVisible"
						/>
						<span
							class="block w-2 h-2 bg-[#fff] rounded absolute top-1/2 left-1/2"
							style="z-index: 999"
						></span>
					</div>
					<div class="h-[calc(33.5%)] mt-5">
						<el-table :data="polygonList" height="100%" show-overflow-tooltip>
							<el-table-column
								prop="location_name"
								label="위치 명"
								align="center"
							/>
							<el-table-column
								prop="mapPolygon_center[0]"
								label="경도"
								align="center"
							/>
							<el-table-column
								prop="mapPolygon_center[1]"
								label="위도"
								align="center"
							/>
							<el-table-column
								fixed="right"
								label="관리"
								width="160"
								align="center"
							>
								<template #default="scope">
									<el-button
										size="small"
										:icon="EditPen"
										circle
										@click="mapRowClick(scope.row)"
									></el-button>
									<el-button
										size="small"
										:icon="Position"
										circle
										@click="moveTo(scope.row)"
									></el-button>
									<el-popconfirm
										width="200"
										confirm-button-text="삭제"
										cancel-button-text="취소"
										:icon="WarnTriangleFilled"
										title="정말 삭제하시겠습니까?"
										@confirm="removeSelectedPolygon(scope.row)"
									>
										<template #reference>
											<el-button size="small" :icon="Delete" circle></el-button>
										</template>
									</el-popconfirm>
								</template>
							</el-table-column>
						</el-table>
					</div>
					<div class="flex mt-5 justify-end">
						<div>
							<el-button size="large" @click="createMapMarker()"
								>구역 그리기</el-button
							>

							<el-button size="large" @click="setArea()">구역 확정</el-button>

							<el-button size="large" @click="removeLastMarker()"
								>최근 마커 지우기</el-button
							>

							<el-button size="large" @click="removeMarker()"
								>현재 마커 초기화</el-button
							>
							<el-button
								class="ml-2.5"
								type="primary"
								@click="toggleMarkerGroup()"
							>
								{{ markersVisible ? '마커 숨기기' : '마커 보이기' }}
							</el-button>
						</div>
					</div>
				</div>
			</el-col>
		</el-row>
		<el-dialog v-model="modalFlag" width="900" align-center>
			<template #header="{ close, titleId, titleClass }">
				<div class="flex items-center justify-between w-full">
					<div class="flex items-center">
						<el-button
							v-if="presetList.length"
							circle
							link
							@click="(presetList = []), (selectCameraName = null)"
						>
							<el-icon><ArrowLeftBold /></el-icon>
						</el-button>
						<span :id="titleId" :class="titleClass">
							카메라 선택 {{ selectCameraName ? ' - ' + selectCameraName : '' }}
						</span>
					</div>
					<div>
						<el-input
							class=""
							placeholder="카메라 명 검색"
							v-model="searchQuery"
							clearable
							style="width: 200px"
						/>
					</div>
					<div class="flex items-center gap-2">
						<el-button
							v-if="presetList.length"
							link
							@click="loadImage()"
							:loading="imageLoading"
						>
							이미지 불러오기
						</el-button>
					</div>
				</div>
			</template>
			<el-table
				v-if="!presetList.length"
				:data="filteredCameraList"
				height="510"
			>
				<el-table-column
					property="cctv_name"
					label="CCTV 명"
					align="center"
					width="500"
				/>
				<el-table-column property="roi_count" label="ROI 영역" align="center">
				</el-table-column>
				<el-table-column
					fixed="right"
					label="Operations"
					width="200"
					align="center"
				>
					<template #default="props">
						<el-button
							link
							type="primary"
							size="small"
							@click="selectCamera(props.row, true)"
						>
							선택
						</el-button>
					</template>
				</el-table-column>
			</el-table>
			<el-table v-else :data="presetList">
				<el-table-column property="name" label="프리셋 명" align="center" />
				<el-table-column property="roi_count" label="ROI 영역" align="center" />
				<el-table-column
					property="hasThumbnail"
					label="이미지 표시"
					align="center"
				>
					<template #default="scope">
						<div class="flex items-center justify-center">
							<Loading v-if="imageLoading" style="width: 25px; height: 25px" />
							<span
								v-else
								:class="
									scope.row.hasThumbnail ? 'text-green-500' : 'text-red-500'
								"
							>
								{{ scope.row.hasThumbnail ? 'O' : 'X' }}
							</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column fixed="right" label="관리" width="160" align="center">
					<template #default="props">
						<el-button
							link
							type="primary"
							size="small"
							@click="selectPreset(props.row)"
							:disabled="!props.row.hasThumbnail || imageLoading"
						>
							선택
						</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-dialog>
	</div>
</template>
<script setup>
import {
	InfoFilled,
	EditPen,
	Delete,
	WarnTriangleFilled,
	Position,
	ArrowLeftBold,
} from '@element-plus/icons-vue';
import { useHead } from '#app';

const { message } = useAlarm();
const router = useRouter();

const cameraList = ref([]);
const modalFlag = ref(false);

const initializeComponent = async () => {
	await nextTick(); // Vue의 다음 DOM 업데이트 사이클을 기다림
	MapComponentRef.value.getCenterZoom();
};
const isL2Login = ref(false);
const siteName = ref(null);

onMounted(() => {
	initializeComponent();

	isL2Login.value = !!window.sessionStorage.getItem('L2Login');
	if (isL2Login.value) {
		siteName.value = userMap[JSON.parse(sessionStorage.getItem('L2Login')).L2];
	}
});

watch(modalFlag, value => {
	if (!value) {
		presetList.value = [];
		selectCameraName.value = null;
	}
}); // 필요한 경우 deep 옵션 추가

const drawingPolygonAndCenterMarker = () => {
	polygonList.value = [];
	if (MapComponentRef.value) {
		MapComponentRef.value.removeAllPolygon();
	}

	if (Object.keys(selectedCamera.value).length > 0) {
		initDetectionArea(selectedCamera.value, false, selectedPresetName.value);
	}
};

const detectionAreaRead = () => {
	$fetch
		.raw(`${BASE_URL}/detectionArea/total/read`, {
			method: 'GET',
		})
		.then(res => {
			if (res._data.length > 0) {
				polygonList.value = res._data;
				polygonList.value.sort((a, b) =>
					a.location_name.localeCompare(b.location_name),
				);
				if (MapComponentRef.value) {
					res._data.forEach(ele => {
						MapComponentRef.value.drawingPolygon(
							ele.mapPolygon3D,
							ele.location_name,
						);

						MapComponentRef.value.createCenterMarker(
							ele.mapPolygon_center,
							ele.location_name,
							ele._id,
							ele.map3d_id,
						);
					});
				} else {
					message.warning('설정 구역 호출 불가');
				}
			}
		})
		.catch(err => {
			console.log(err);
		});
};

// 카메라 리스트 호출
const callCCTV = async () => {
	CAMERA_LIST.value = null;
	$fetch(`${BASE_URL}/detectionArea/Read`, {
		method: 'GET',
	})
		.then(res => {
			if (res.length > 0) {
				cameraList.value = res.sort((a, b) =>
					a.cctv_name.localeCompare(b.cctv_name),
				);

				modalFlag.value = true;
			} else {
				message.warning('카메라 리스트 없음');
			}
		})
		.catch(err => {
			message.error('API 호출 실패', `${err}`);
		});
};

const selectedCamera = ref({});
const selectedCameraData = ref({});
const polygons = ref([]);
const polygonList = ref([]);
const MapComponentRef = ref(null);
const CanvasComponentRef = ref(null);

const cameraView = ref(null);
const areaList = ref([]);
const presetList = ref([]);
const selectCameraName = ref(null);

// 카메라 선택 및 호출
const selectCamera = (item, viewSet) => {
	selectCameraName.value = item.cctv_name;
	selectedCameraData.value = item;
	if (item.preset) {
		if (item.preset.length > 0) {
			presetList.value = item.preset;
		} else {
			initDetectionArea(item, viewSet);
			selectedPresetName.value = null;
		}
	} else {
		initDetectionArea(item, viewSet);
		selectedPresetName.value = null;
	}
};

const searchQuery = ref('');

// 카메라 리스트 필터링
const filteredCameraList = computed(() => {
	return cameraList.value.filter(camera =>
		camera.cctv_name.toLowerCase().includes(searchQuery.value.toLowerCase()),
	);
});

const selectedPresetName = ref(null);

const selectPreset = item => {
	selectedPresetName.value = item.name;
	initDetectionArea(selectedCameraData.value, true, selectedPresetName.value);
};

const initDetectionArea = (item, viewSet, presetName) => {
	polygons.value = [];
	getGridIndexList.value = [];
	isSelectCenterMarker.value = null;
	$fetch
		.raw(`${BASE_URL}/detectionArea/select`, {
			method: 'POST',
			body: {
				inferCID: item.inferCID,
				oid: item.oid,
				preset: presetName || null,
			},
		})
		.then(res => {
			areaList.value = res._data.mapping_infoList;
			if (areaList.value) {
				areaList.value.sort((a, b) =>
					a.location_name.localeCompare(b.location_name),
				);
			}
			selectedCamera.value = item;
			if (viewSet) {
				cameraView.value = res;
				moveCameraView(res);
			}

			callImage(res._data.thumbnail_rawimgpath, res._data.cctv_ID);
			modalFlag.value = false;
		})
		.catch(err => {
			console.log(err);
			selectCameraName.value = null;
			message.error('CCTV가 연결되지 않았습니다.', `${err}`);
		});
};

const childInitDetectionArea = () => {
	initDetectionArea(selectedCameraData.value, true, selectedPresetName.value);
};
provide('childInitDetectionArea', childInitDetectionArea);

// 구역 그리기
const isStartCreateMapMarker = ref(false);
const createMapMarker = () => {
	MapComponentRef.value.createMapMarker();
	isStartCreateMapMarker.value = true;
};

// 구역 확정
const setArea = () => {
	MapComponentRef.value.setArea();
};

// 최근 마커 지우기
const removeLastMarker = () => {
	MapComponentRef.value.removeLastMarker();
};

// 전체 마커 제거
const removeMarker = () => {
	MapComponentRef.value.cancelDrawingPolygon();
};

// 썸네일 호출
const thumbnailImage = ref(null);
const callImage = (path, id) => {
	$fetch(`${BASE_URL}/cctv/image`, {
		method: 'POST',
		body: {
			path,
		},
	})
		.then(res => {
			thumbnailImage.value = URL.createObjectURL(res);
		})
		.catch(err => {
			console.log(err);
		});
};

// 폴리곤 개별 삭제
const removeSelectedPolygon = item => {
	$fetch
		.raw(`${BASE_URL}/detectionArea/delete`, {
			method: 'POST',
			body: {
				oid: item._id,
			},
		})
		.then(res => {
			if (res.status === 200) {
				message.success('구역 삭제 완료');
				drawingPolygonAndCenterMarker();
			}
		})
		.catch(err => {
			message.error('구역 삭제 오류');
		});
};

const mapCenter = ref([]);
const mapHeading = ref(0);
const mapTilt = ref(-90);
const mapRoll = ref(0);
const mapZIndex = ref(5622);

// 카메라 화각 이동
const moveCameraView = res => {
	const { mapConfigInfo, cctv_location } = res._data;

	if (!mapConfigInfo) {
		message.warning('카메라 화각 정보 없음');
	}
	mapCenter.value = mapConfigInfo
		? [parseFloat(mapConfigInfo.longitude), parseFloat(mapConfigInfo.latitude)]
		: [parseFloat(cctv_location[0]), parseFloat(cctv_location[1])];

	mapZIndex.value = mapConfigInfo ? parseFloat(mapConfigInfo.zindex) : 5622;
	mapHeading.value = mapConfigInfo ? mapConfigInfo.heading : 0;
	mapTilt.value = mapConfigInfo ? mapConfigInfo.tilt : -90;
	mapRoll.value = mapConfigInfo ? mapConfigInfo.roll : 0;
};

const infoLon = ref(0);
const infoLat = ref(0);
const infoZIndex = ref(1000);
const infoHeading = ref(0);
const infoTilt = ref(0);
const infoRoll = ref(0);

// 카메라 화각 parse
const updateCameraView = (lon, lat, zindex, heading, tilt, roll) => {
	infoLon.value = lon;
	infoLat.value = lat;
	infoHeading.value = heading;
	infoTilt.value = tilt;
	infoRoll.value = roll;
	infoZIndex.value = zindex;
};

// 카메라 화각 설정
const setCameraView = () => {
	MapComponentRef.value.setCameraView(
		selectedCamera.value.oid,
		selectedPresetName.value,
	);
};

// 카메라 화각 초기화
const initCameraView = () => {
	$fetch
		.raw(`${BASE_URL}/detectionArea/angle/init`, {
			method: 'POST',
			body: {
				oid: selectedCamera.value.oid,
				preset: selectedPresetName.value || null,
			},
		})
		.then(res => {
			if (res.status === 200) {
				message.success('화각 초기화 완료');
				initDetectionArea(selectedCamera.value, true);
			}
		})
		.catch(err => {
			console.log(err);
		});
};

const isSelectCenterMarker = ref(null);
const selectPolygonID = ref(null);
const selectPolygonName = ref(null);
const selectMap3d_id = ref(null);
const selectCenterMarker = (name, _id, map3d_id) => {
	selectPolygonName.value = name;
	selectPolygonID.value = _id;
	selectMap3d_id.value = map3d_id;
	getGrid(_id);
};

const gridIndexList = ref([]);
const updateGrid = list => {
	gridIndexList.value = list;
};

const setGrid = item => {
	console.log(gridIndexList.value);
	$fetch
		.raw(`${BASE_URL}/detectionArea/grid/select`, {
			method: 'POST',
			body: {
				location_name: selectPolygonName.value,
				cctv_info: selectedCamera.value.oid,
				map3d_info: selectPolygonID.value,
				grid_info: gridIndexList.value,
				map3d_id: selectMap3d_id.value,
				preset: selectedPresetName.value || null,
			},
		})
		.then(res => {
			if (res.status === 200) {
				message.success('탐지 구역 설정 완료');
				initDetectionArea(
					selectedCamera.value,
					false,
					selectedPresetName.value,
				);
				gridIndexList.value = [];
			}
			isSelectCenterMarker.value = null;
		})
		.catch(err => {
			message.error('탐지 구역 설정 오류');
		});
};

const getGridIndexList = ref([]);

const getGrid = _id => {
	getGridIndexList.value = [];
	if (selectedCamera.value.oid) {
		$fetch
			.raw(`${BASE_URL}/detectionArea/grid/read`, {
				method: 'POST',
				body: {
					cctv_info: selectedCamera.value.oid,
					preset: selectedPresetName.value || null,
				},
			})
			.then(res => {
				if (res._data.length > 0) {
					let item = res._data.find(item => item.map3d_info === _id);
					if (item) {
						getGridIndexList.value = item.grid_info;
						message.success('탐지 구역 호출 완료');
					} else {
						message.warning('선택된 탐지 구역 없음');
					}
				} else {
					message.warning('선택된 탐지 구역 없음');
				}
				isSelectCenterMarker.value = true;
			})
			.catch(err => {
				message.error('탐지 구역 호출 오류');
			});
	} else {
		message.warning('카메라 선택 후 탐지 구역 설정');
	}
};

const rowClick = item => {
	selectCenterMarker(item.location_name, item.map3d_info._id, item.map3d_id);
};

// 해당 폴리곤으로 center 위치 이동
const mapRowClick = item => {
	MapComponentRef.value.selectPolygon(item);
};

// const moveCenterView = () => {
// 	MapComponentRef.value.moveCenterView();
// };

const navigationFlag = ref(true);
const setVisibleNavigation = () => {
	navigationFlag.value = !navigationFlag.value;
	MapComponentRef.value.setVisibleNavigation(navigationFlag.value);
};

const callRestart = () => {
	$fetch
		.raw(`${BASE_URL}/process/restart`, {
			method: 'GET',
		})
		.then(res => {
			console.log(res);
		})
		.catch(err => {
			console.log(err);
		});
};

const moveTo = value => {
	MapComponentRef.value.moveTo(
		value.mapPolygon_center[0],
		value.mapPolygon_center[1],
		5000,
		0,
		-90,
		0,
	);
};

const imageLoading = ref(false);
const loadImage = () => {
	imageLoading.value = true;
	$fetch
		.raw(
			`${BASE_URL}/detectionArea/getPresetThumanil/${selectedCameraData.value.oid}`,
			{
				method: 'GET',
			},
		)
		.then(res => {
			presetList.value = res._data.presets;
			imageLoading.value = false;
		})
		.catch(err => {
			console.log(err);
			imageLoading.value = false;
			message.warning('카메라 응답 없음');
		});
};

const markersVisible = ref(true); // 마커와 폴리곤 가시성 상태

const toggleMarkerGroup = () => {
	updateMarkersVisible();
	MapComponentRef.value.toggleMarkerGroup(markersVisible.value);
};

const updateMarkersVisible = () => {
	markersVisible.value = !markersVisible.value; // 가시성 상태 토글
};
</script>
