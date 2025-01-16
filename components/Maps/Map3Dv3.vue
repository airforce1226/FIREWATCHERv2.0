<template>
	<div>
		<div id="map" class="w-full h-full"></div>
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

const props = defineProps([
	'mapCenter',
	'mapZIndex',
	'mapHeading',
	'mapTilt',
	'mapRoll',
]);
const emit = defineEmits([
	'updateCameraView',
	'drawingPolygonAndCenterMarker',
	'selectCenterMarker',
]);

const { message } = useAlarm();

onMounted(() => {
	getCenterZoom();
});

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
			console.log(err);
			message.error('지도 중심점 호출 실패');
		});
};

const mapController = shallowRef(null); // 2d / 3d 처리 controller
const mapObject = shallowRef(null); // 실제 지도 값

const initializeMap = (x, y) => {
	vw.MapControllerOption = {
		container: 'map',
		mapMode: 'ws3d-map',
		basemapType: vw.ol3.BasemapType.GRAPHIC,
		controlDensity: vw.ol3.DensityType.BASIC,
		interactionDensity: vw.ol3.DensityType.BASIC,
		controlsAutoArrange: true,
		homePosition: vw.ol3.CameraPosition,
		initPosition: vw.ol3.CameraPosition,
	};

	mapController.value = new vw.MapController(vw.MapControllerOption);

	// 사용자 네비게이션
	// mapController.value.Map3D.setNavigationZoomVisible(false);

	// 아래 코드 2d, 3d 동적 처리 예정
	mapObject.value = mapController.value.Map3D;

	var options = {
		mapId: 'map',
		initPosition: new vw.CameraPosition(
			new vw.CoordZ(x, y, 45000),
			new vw.Direction(0, -90, 0),
		),
		logo: true,
		navigation: true,
	};

	mapObject.value.setOption(options);
	// mapController.Map3D.onMoveEnd.addEventListener(() => {
	// 	console.log('test');
	// });

	console.log(mapObject.value);
};

// 지도 이동
const moveTo = (x, y, z, heading, tilt, roll) => {
	// tilt 값 -88도 이상 일 때, 지도 이동 시 - 고도         값 * 3.19xxx 되는 현상 발생
	if (tilt > -88) {
		z = z / 3.19;
	}

	var movePo = new vw.CoordZ(x, y, z);
	var mPosi = new vw.CameraPosition(
		movePo,
		new vw.Direction(parseFloat(heading), parseFloat(tilt), parseFloat(roll)),
	);

	console.log(mapController.value.Map3D);
	mapController.value.Map3D.moveTo(mPosi);
};

// center 좌표 및 고도
const centerLon = ref(0);
const centerLat = ref(0);
const centerAlt = ref(0);

const getCenterPosition = () => {
	var windowPosition = new Cesium.Cartesian2(
		ws3d.viewer.container.clientWidth / 2,
		ws3d.viewer.container.clientHeight / 2,
	); //화면중심좌표
	var pickRay = ws3d.viewer.scene.camera.getPickRay(windowPosition); //카메라 위치에서 화면좌표를 세계좌표의 픽셀을 통과하는 광선을 생성합니다.
	var pickPosition = ws3d.viewer.scene.globe.pick(pickRay, ws3d.viewer.scene); //표면과 광선사이의 교차점

	if (pickPosition != undefined) {
		var pickPositionCartographic =
			ws3d.viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPosition); //데카르트를 지도학적 표현으로 변환. longitude, latitude, height
		centerLon.value = Cesium.Math.toDegrees(pickPositionCartographic.longitude);
		centerLat.value = Cesium.Math.toDegrees(pickPositionCartographic.latitude);
		centerAlt.value = pickPositionCartographic.height;
	}
};

// 카메라 좌표 및 고도
const cameraLon = ref(0);
const cameraLat = ref(0);
const cameraAlt = ref(0);
const cameraHeading = ref(0);
const cameraTilt = ref(0);
const cameraRoll = ref(0);

const getCameraInfo = () => {
	cameraLon.value = window.ws3d.viewer.camera.positionCartographic.longitudeDD;
	cameraLat.value = window.ws3d.viewer.camera.positionCartographic.latitudeDD;
	cameraAlt.value = window.ws3d.viewer.camera.positionCartographic.height;
	cameraHeading.value = window.ws3d.viewer.camera.heading / (Math.PI / 180);
	cameraTilt.value = window.ws3d.viewer.camera.pitch / (Math.PI / 180);
	cameraRoll.value = window.ws3d.viewer.camera.roll / (Math.PI / 180);
};

const pointToPointDistance = ref(0);
// 두 점 사이의 거리
const distanceBetweenPoints = (lat1, lon1, alt1, lat2, lon2, alt2) => {
	const R = 6371e3; // 지구 반경 (미터)
	// 위도와 경도를 라디안으로 변환
	const φ1 = toRadians(lat1);
	const φ2 = toRadians(lat2);
	const Δφ = toRadians(lat2 - lat1);
	const Δλ = toRadians(lon2 - lon1);
	// 두 점 사이의 평면 거리 (Haversine 공식을 사용)
	const a =
		Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
		Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const distance2D = R * c;
	// 고도를 포함한 직선 거리 계산
	const Δalt = alt2 - alt1;
	const distance3D = Math.sqrt(distance2D * distance2D + Δalt * Δalt);
	return distance3D;
};

const toRadians = degrees => {
	return degrees * (Math.PI / 180);
};

// 카메라 화각 설정
const setCameraView = oid => {
	getCameraInfo();
	getCenterPosition();

	if (centerLon.value && centerLat.value) {
		// 해수면 기준으로 두 점 사이의 거리
		pointToPointDistance.value = distanceBetweenPoints(
			cameraLon.value,
			cameraLat.value,
			cameraAlt.value,
			centerLon.value,
			centerLat.value,
			0,
			// centerAlt.value,
		);
		// console.log(
		// 	`해수면 기준 중심 지점까지 거리 = ${pointToPointDistance.value}`,
		// );
		// console.log(cameraTilt.value);
		// console.log(`카메라 고도 = ${cameraAlt.value}`);
		// console.log(`중심 지점 고도 = ${centerAlt.value}`);
		// console.log(centerAlt.value + pointToPointDistance.value);

		// 해수면 기준으로 두 점 사이의 각도(고도 각)
		const A = [cameraLon.value, cameraLat.value, cameraAlt.value];
		const B = [centerLon.value, centerLat.value, 0];

		const angle = calculateElevationAngle(A, B);

		$fetch
			.raw(`${BASE_URL}/detectionArea/angle/create`, {
				method: 'POST',
				body: {
					oid,
					lon: centerLon.value,
					lat: centerLat.value,
					// zindex: centerAlt.value + pointToPointDistance.value,
					zindex: pointToPointDistance.value, // 중심지점 해수면 기준 - 카메라 위치 간 거리
					// tilt: cameraTilt.value,
					tilt: angle,
					heading: cameraHeading.value,
					roll: cameraRoll.value,
				},
			})
			.then(res => {
				if (res.status === 200) message.success('화각 설정 완료');
			})
			.catch(err => {
				console.log(err);
			});
	} else {
		message.error('중심점을 지표면으로 맞추세요');
	}
};

const moveCenterView = () => {
	getCameraInfo();
	getCenterPosition();
	if (centerLon.value && centerLat.value) {
		pointToPointDistance.value = distanceBetweenPoints(
			cameraLon.value,
			cameraLat.value,
			cameraAlt.value,
			centerLon.value,
			centerLat.value,
			0,
			// centerAlt.value,
		);
		var movePo = new vw.CoordZ(
			centerLon.value,
			centerLat.value,
			pointToPointDistance.value,
		);
		var mPosi = new vw.CameraPosition(
			movePo,
			new vw.Direction(
				parseFloat(cameraHeading.value),
				-90,
				parseFloat(cameraRoll.value),
			),
		);

		mapController.value.Map3D.moveTo(mPosi);
	} else {
		message.error('중심점을 지표면으로 맞추세요');
	}
};

// 구역 그리기 시작
let onclick_event = null;
let tempMarkerList = [];
const lnglatList = ref([]);

const createMapMarker = () => {
	if (!mapObject.value) return null;

	if (!onclick_event) {
		onclick_event = (windowPosition, ecefPosition, cartographic) => {
			if (cartographic) {
				var x = vw.Util.toDegrees(cartographic.longitude);
				var y = vw.Util.toDegrees(cartographic.latitude);
				var pointCoord = new vw.Coord(x, y);

				let marker = new vw.geom.Point(pointCoord);
				marker.setImage(markerImage_sm);
				marker.setId(`marker${tempMarkerList.length}`);
				marker.create();
				tempMarkerList.push(marker);
				lnglatList.value.push(new vw.Coord(x, y));
			}
		};
		mapObject.value.onClick.addEventListener(onclick_event);
	}
};

// 구역 확정
const polygonDialogFlag = defineModel('polygonDialogFlag');
const location_name = ref('');

const setArea = () => {
	createMapMarkerGroup();
	if (lnglatList.value.length > 2) {
		polygonDialogFlag.value = true;
	} else {
		cancelDrawingPolygon();
	}
};

const cancelDrawingPolygon = () => {
	createMapMarkerGroup();
	tempMarkerGroup.hide();
	polygonDialogFlag.value = false;
	lnglatList.value = [];
};

// tempMarkerGroup 생성
let tempMarkerGroup = null;
const createMapMarkerGroup = () => {
	tempMarkerGroup = new vw.geom.ShapeGroups('temp');
	tempMarkerList.forEach(item => {
		tempMarkerGroup.add(item);
	});
};

// 폴리곤 등록
let centerX, centerY;

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

const polygon = ref(null);

// 전체 폴리곤(폴리곤, 마커) 지우기
const removeAllPolygon = () => {
	if (mapObject.value) {
		lnglatList.value = [];
		mapObject.value.clear();
		polygon.value = null;
	}
};

// 폴리곤 그리기
const drawingPolygon = (list, name) => {
	if (vw) {
		let coordCol = new vw.Collection(list);
		polygon.value = new vw.geom.Polygon(coordCol);
		polygon.value.setId(name);
		polygon.value.setFillColor(new vw.Color(205, 76, 84, 50));
		polygon.value.create();
		tempMarkerList = [];
		tempMarkerGroup = null;
		lnglatList.value = [];
	}
};

// 폴리곤 중심 마커 생성
const createCenterMarker = (center, name, _id, map3d_id) => {
	if (vw) {
		let pointCoord = new vw.Coord(center[0], center[1]);
		let centerMarker = new vw.geom.Point(pointCoord);
		centerMarker.setImage(centerPoint);
		centerMarker.setName(`${name}`);
		centerMarker.setFont('고딕');
		centerMarker.setFontSize(17);
		centerMarker.create();

		var eventHandler = function (
			windowPosition,
			ecefPosition,
			cartographic,
			featureInfo,
		) {
			if (featureInfo != null) {
				var id = featureInfo.groupId;
				var pointObj = mapObject.value.getObjectById(id);
				emit('selectCenterMarker', pointObj.name, _id, map3d_id);
			}
		};
		centerMarker.addEventListener(eventHandler);
	}
};

// 최근 마커 지우기
const removeLastMarker = () => {
	mapObject.value.getObjectById(`marker${tempMarkerList.length - 1}`);
	mapObject.value.removeObjectById(`marker${tempMarkerList.length - 1}`);
	tempMarkerList.pop();
	lnglatList.value.pop();
};

// 두 점 사이의 각도 구하기
const haversineDistance = (lat1, lon1, lat2, lon2) => {
	const R = 6371; // 지구의 평균 반지름 (단위: km)
	const dLat = toRadians(lat2 - lat1);
	const dLon = toRadians(lon2 - lon1);
	const lat1Rad = toRadians(lat1);
	const lat2Rad = toRadians(lat2);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1Rad) *
			Math.cos(lat2Rad) *
			Math.sin(dLon / 2) *
			Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	const distance = R * c;
	return distance;
};

const calculateElevationAngle = (A, B) => {
	const lat1 = A[1],
		lon1 = A[0],
		alt1 = A[2];
	const lat2 = B[1],
		lon2 = B[0],
		alt2 = B[2];

	// 수평 거리 계산 (km)
	const horizontalDistance = haversineDistance(lat1, lon1, lat2, lon2);

	// 고도 차이 계산 (km)
	const altitudeDifference = (alt2 - alt1) / 1000; // 고도를 km 단위로 변환

	// 고도 각도 계산 (라디안 단위)
	const elevationAngleRad = Math.atan2(altitudeDifference, horizontalDistance);

	// 고도 각도 계산 (도 단위)
	const elevationAngleDeg = elevationAngleRad * (180 / Math.PI);

	return elevationAngleDeg;
};

const setVisibleNavigation = value => {
	mapController.value.Map3D.setNavigationZoomVisible(value);
};

const selectPolygon = item => {};

defineExpose({
	setCameraView,
	moveCenterView,
	createMapMarker,
	setArea,
	removeAllPolygon,
	drawingPolygon,
	createCenterMarker,
	removeLastMarker,
	cancelDrawingPolygon,
	setVisibleNavigation,
	selectPolygon,
});
</script>
