<template>
	<div>
		<div id="vmap3d" class="w-full h-full"></div>
		<el-dialog
			title="위치 등록"
			v-model="polygonDialogFlag"
			width="800"
			align-center
			class="cursor-default"
		>
			<div class="flex w-full">
				<el-input
					class="mr-2"
					v-model="location_name"
					:autofocus="Boolean(true)"
					placeholder="위치 명 입력"
				/>
				<el-button
					:disabled="location_name === ''"
					class="ml-2.5"
					type="primary"
					@click="addPolygon()"
					>위치 명 중복 검사 및 등록</el-button
				>
				<el-button class="ml-2.5" type="primary" @click="cancelDrawingPolygon()"
					>취소</el-button
				>
			</div>
		</el-dialog>
	</div>
</template>
<script setup>
import markerImage_sm from '@/assets/markerPoint_sm.png';
import centerPoint from '@/assets/centerPoint.png';
import * as Cesium from 'cesium';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const vw = ref();

if (!vw.value) {
	vw.value = window.vw;
}

const props = defineProps([
	'mapCenter',
	'mapZIndex',
	'mapHeading',
	'mapTilt',
	'mapRoll',
	'markersVisible',
]);
const emit = defineEmits([
	'updateCameraView',
	'drawingPolygonAndCenterMarker',
	'selectCenterMarker',
	'updateMarkersVisible',
	'detectionAreaRead',
]);

const { message } = useAlarm();

watch(
	() => props.mapCenter,
	value => {
		moveTo(
			value[0],
			value[1],
			props.mapZIndex,
			props.mapHeading,
			props.mapTilt,
			props.mapRoll,
		);
	},
);

const map3d = ref(null);
const getCenterZoom = () => {
	$fetch
		.raw(`${BASE_URL}/vworld/read`, {
			method: 'GET',
		})
		.then(res => {
			if (res.status === 200) {
				initializeMap(res._data.center[0], res._data.center[1]);
				message.success('지도 중심점 호출 완료');
			} else {
				message.warning('지도 중심점 등록 후 사용 바람.');
			}
		})
		.catch(err => {
			message.error('지도 중심점 호출 실패');
		});
};

// 지도 초기화 API Document : Direction(heading, tilt , roll)
const initializeMap = (x, y) => {
	var mapOptions = new vw.value.MapOptions(
		vw.value.BasemapType.GRAPHIC,
		'',
		vw.value.DensityType.BASIC,
		vw.value.DensityType.BASIC,
		false,
		new vw.value.CameraPosition(
			new vw.value.CoordZ(x, y, 786),
			new vw.value.Direction(0, -90, 0),
		),
		new vw.value.CameraPosition(
			new vw.value.CoordZ(x, y, 50000),
			new vw.value.Direction(0, -90, 0),
		),
	);

	map3d.value = new vw.value.Map('vmap3d', mapOptions);

	// 지도 이동 네비게이션 숨김
	map3d.value.navigationZoom.setVisible(false);

	// warning willReadFrequently code - 해결x
	// let cesiumWidget = document.getElementsByClassName('cesium-widget')[0];
	// const canvas = cesiumWidget.getElementsByTagName('canvas')[0];
	// canvas.getContext('2d', { willReadFrequently: true });

	// onMoveEnd 감지 -> 동적 값 파싱 // 이종훈
	map3d.value.onMoveEnd.addEventListener(() => {
		let height = map3d.value.getHeight();
		let lon = window.ws3d.viewer.camera.positionCartographic.longitudeDD;
		let lat = window.ws3d.viewer.camera.positionCartographic.latitudeDD;
		let zindex = window.ws3d.viewer.camera.positionCartographic.height;
		let heading = window.ws3d.viewer.camera.heading / (Math.PI / 180);
		let tilt = window.ws3d.viewer.camera.pitch / (Math.PI / 180);
		let roll = window.ws3d.viewer.camera.roll / (Math.PI / 180);
	});

	// map3d.value.onMouseLeftUp.addEventListener((a, b, c, d) => {
	// 	console.log(a, b, c, d);
	// 	console.log('마우스 좌클릭');
	// });

	// map3d.value.onMouseRightUp.addEventListener(() => {
	// 	console.log('마우스 우클릭');
	// 	function blockContextMenu(event) {
	// 		event.preventDefault();
	// 	}
	// 	// 우클릭시 활성화 되는 메뉴 제거
	// 	document.addEventListener('contextmenu', blockContextMenu);

	// 	// 이벤트 리스너 제거
	// 	setTimeout(() => {
	// 		document.removeEventListener('contextmenu', blockContextMenu);
	// 	}, 10);
	// });

	const element = document.getElementsByName('noti2');
	// vworld 로고 스타일 지정
	element[0].style.width = '70%';
	element[0].style.float = 'left';
	element[1].style.display = 'none'; // 연속지적도 안내 이미지 숨김 처리

	// 내려다보는 높이 스타일 지정
	const AltitudeComponent = document.getElementById('coordinatesContainer2');
	AltitudeComponent.style.float = 'left';
	emit('drawingPolygonAndCenterMarker');
};

// 지도 이동
const moveTo = (x, y, z, heading, tilt, roll) => {
	console.log('moveTo');
	let parsedX = parseFloat(x);
	let parsedY = parseFloat(y);
	if (!map3d.value) {
		initializeMap(parsedX, parsedY);
	}

	nextTick(() => {
		ws3d.viewer.camera.flyTo({
			destination: Cesium.Cartesian3.fromDegrees(parsedX, parsedY, z),
			orientation: {
				heading: Cesium.Math.toRadians(heading),
				pitch: Cesium.Math.toRadians(tilt),
				roll: 0,
			},
			duration: 0.5,
		});
	});
};

// 구역 그리기 시작
let onclick_event = null;
let tempMarkerList = [];
const createMapMarker = () => {
	if (!map3d.value) return null;

	if (!onclick_event) {
		onclick_event = (windowPosition, ecefPosition, cartographic) => {
			if (cartographic) {
				var x = vw.value.Util.toDegrees(cartographic.longitude);
				var y = vw.value.Util.toDegrees(cartographic.latitude);
				var pointCoord = new vw.value.Coord(x, y);

				let marker = new vw.value.geom.Point(pointCoord);
				marker.setImage(markerImage_sm);
				marker.setId(`marker${tempMarkerList.length}`);
				marker.create();
				tempMarkerList.push(marker);
				lnglatList.value.push(new vw.value.Coord(x, y));
			}
		};
		map3d.value.onClick.addEventListener(onclick_event);
	}
};

// 구역 확정
const setArea = () => {
	createMapMarkerGroup();
	if (lnglatList.value.length > 2) {
		polygonDialogFlag.value = true;
		// 마커 숨기기 / 보이기 flag update
		if (!props.markersVisible) {
			emit('updateMarkersVisible', true);
		}
	} else {
		message.warning(t('select_vertices'));
		cancelDrawingPolygon();
	}
};

// tempMarkerGroup 생성
let tempMarkerGroup = null;
const createMapMarkerGroup = () => {
	tempMarkerGroup = new vw.value.geom.ShapeGroups('temp');
	tempMarkerList.forEach(item => {
		tempMarkerGroup.add(item);
	});
};

// roi 명 중복 검사 모달
const polygonDialogFlag = defineModel('polygonDialogFlag');
const location_name = ref('');

let centerX, centerY;
const lnglatList = ref([]);

// 폴리곤 등록
const addPolygon = () => {
	// 폴리곤 중심 좌표 구하기
	centerX =
		lnglatList.value.reduce((sum, coord) => sum + coord.x, 0) /
		lnglatList.value.length;
	centerY =
		lnglatList.value.reduce((sum, coord) => sum + coord.y, 0) /
		lnglatList.value.length;

	$fetch
		.raw(`${BASE_URL}/detectionArea/create/3D`, {
			method: 'POST',
			body: {
				location_name: location_name.value,
				mapPolygon3D: lnglatList.value,
				mapPolygon_center: [centerX, centerY],
			},
		})
		.then(res => {
			if (res.status === 200) {
				polygonDialogFlag.value = false;
				message.success('구역 등록 완료');
				location_name.value = '';
				emit('drawingPolygonAndCenterMarker');
			}
		})
		.catch(err => {
			if (err.status === 409) {
				message.warning('구역 명 중복');
			} else {
				message.error('구역 등록 실패');
			}
		});
};

// 폴리곤 중심 마커 생성
const mapMarkerGroup = ref(null);

const createCenterMarker = (center, name, _id, map3d_id) => {
	if (vw.value) {
		let pointCoord = new vw.value.Coord(center[0], center[1]);
		let centerMarker = new vw.value.geom.Point(pointCoord);
		centerMarker.setImage(centerPoint);
		centerMarker.setName(`${name}`);
		centerMarker.setFont('고딕');
		centerMarker.setFontSize(17);
		centerMarker.create();
		mapMarkerGroup.value.add(centerMarker);
		var eventHandler = function (
			windowPosition,
			ecefPosition,
			cartographic,
			featureInfo,
		) {
			if (featureInfo != null) {
				var id = featureInfo.groupId;
				var pointObj = map3d.value.getObjectById(id);
				emit('selectCenterMarker', pointObj.name, _id, map3d_id);
			}
		};
		centerMarker.addEventListener(eventHandler);
	}
};

const polygon = ref(null);

// 폴리곤 그리기
const drawingPolygon = (list, name) => {
	if (vw.value) {
		let coordCol = new vw.value.Collection(list);
		polygon.value = new vw.value.geom.Polygon(coordCol);
		polygon.value.setId(name);
		polygon.value.setFillColor(new vw.value.Color(205, 76, 84, 50));
		polygon.value.create();
		tempMarkerList = [];
		tempMarkerGroup = null;
		lnglatList.value = [];
	}
};

// 전체 폴리곤, 마커 지우기
const removeAllPolygon = () => {
	if (map3d.value) {
		lnglatList.value = [];
		map3d.value.clear();
		polygon.value = null;
		mapMarkerGroup.value = new vw.value.geom.ShapeGroups('temp');
		setTimeout(() => {
			emit('detectionAreaRead');
		}, 200);
	} else {
		console.log('332');
	}
};

// 최근 마커 지우기
const removeLastMarker = () => {
	map3d.value.removeObjectById(`marker${tempMarkerList.length - 1}`);
	tempMarkerList.pop();
	lnglatList.value.pop();
};

const cancelDrawingPolygon = () => {
	createMapMarkerGroup();
	tempMarkerGroup.hide();
	polygonDialogFlag.value = false;
	lnglatList.value = [];
};

// 카메라 좌표 및 고도
const cameraLon = ref(0);
const cameraLat = ref(0);
const cameraAlt = ref(0);
const cameraHeading = ref(0);
const cameraTilt = ref(0);
const cameraRoll = ref(0);

const getCameraInfo = () => {
	const camera = ws3d.viewer.camera;
	cameraLon.value = camera.positionCartographic.longitudeDD;
	cameraLat.value = camera.positionCartographic.latitudeDD;
	cameraAlt.value = camera.positionCartographic.height;
	cameraHeading.value = camera.heading / (Math.PI / 180);
	cameraTilt.value = camera.pitch / (Math.PI / 180);
	cameraRoll.value = camera.roll / (Math.PI / 180);
};

const childInitDetectionArea = inject('childInitDetectionArea');

const setCameraView = (oid, presetName) => {
	getCameraInfo();

	$fetch
		.raw(`${BASE_URL}/detectionArea/angle/create`, {
			method: 'POST',
			body: {
				oid,
				lon: cameraLon.value,
				lat: cameraLat.value,
				zindex: cameraAlt.value,
				tilt: cameraTilt.value,
				heading: cameraHeading.value,
				roll: cameraRoll.value,
				preset: presetName || null,
			},
		})
		.then(res => {
			if (res.status === 200) {
				message.success('화각 설정 완료');
				childInitDetectionArea();
			}
		})
		.catch(err => {
			console.log(err);
		});
};

const selectPolygon = item => {
	// 등록된 폴리곤 라인 제거
	if (map3d.value.getObjectById('polygonLine')) {
		map3d.value.removeObjectById('polygonLine');
	}

	let ar = new Array();
	item.mapPolygon3D.forEach(ele => {
		ar.push(new vw.value.Coord(ele.x, ele.y));
	});

	// 시작점 추가
	ar.push(new vw.value.Coord(item.mapPolygon3D[0].x, item.mapPolygon3D[0].y));

	let coordCol = new vw.value.Collection(ar);
	let linestring = new vw.value.geom.LineString(coordCol);
	linestring.setFillColor(vw.value.Color.WHITE);
	linestring.setWidth(3);
	linestring.setId('polygonLine');
	linestring.create();
};

const toggleMarkerGroup = value => {
	if (value) {
		mapMarkerGroup.value.show(); // 마커 그룹 보이기
	} else {
		mapMarkerGroup.value.hide(); // 마커 그룹 숨기기
	}
};

defineExpose({
	getCenterZoom,
	createMapMarker,
	removeAllPolygon,
	drawingPolygon,
	createCenterMarker,
	cancelDrawingPolygon,
	removeLastMarker,
	setArea,
	setCameraView,
	selectPolygon,
	moveTo,
	toggleMarkerGroup,
}); // 자식 함수 expose

onBeforeUnmount(() => {
	if (map3d.value) {
		map3d.value.onMoveEnd.removeEventListener();
		map3d.value.onClick.removeEventListener(onclick_event);
	}
});
</script>
<style scoped>
:deep(.cesium-viewer-bottom) {
	width: 34%;
	margin: 0;
	left: 83% !important;
}

:deep(.el-overlay-dialog) {
	cursor: default;
}
</style>
