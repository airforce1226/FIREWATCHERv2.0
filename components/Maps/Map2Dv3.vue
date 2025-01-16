<template>
	<div>
		<div :id="`map2d${mode}`" class="h-full"></div>
		<el-dialog
			v-model="dialogVisible"
			title="동일 위치 카메라 목록"
			width="550"
			:close-on-click-modal="false"
		>
			<el-table :data="equalPositionCameraList">
				<el-table-column property="cctv_name" label="cctv_name" width="100" />
				<el-table-column property="cctv_ID" label="cctv_ID" width="100" />
				<el-table-column fixed="right" label="Operations" width="300">
					<template #default="props">
						<el-button
							link
							type="primary"
							size="small"
							@click="selectCamera(props)"
						>
							선택
						</el-button>
						<el-button
							link
							type="primary"
							size="small"
							@click="callRTSP(props.row.inferCID), (dialogVisible = false)"
						>
							실시간 영상 요청
						</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-dialog>
	</div>
</template>

<script setup>
const { message } = useAlarm();

const props = defineProps([
	'mode',
	'centerCoordinate',
	'zoom',
	'roi_mapPolygon',
	'cctv_location',
	'cctv_name',
	'CAMERA_LIST',
	'mapping_Info',
]);
// const vw = ref();

const emit = defineEmits(['updateCameraIndex']);
const mapObjectMap = ref({});

onMounted(() => {
	initializeMap();
});

// 기존 onMounted 의 watchEffect 에서 처리시, setCenter() 호출 시, 아래 로직 호출되는 이슈로 인해 watch cycle 로 감지
watch(
	() => props.centerCoordinate,
	value => {
		setCenter(props.centerCoordinate);
	},
);

// 각 세부 이벤트 별, cctv_location 변경 시
watch(
	() => props.cctv_location,
	value => {
		addMarkerLayer();
	},
);

// 썸네일 순회 완료 후 CAMERA_LIST value 변경 시
watch(
	() => props.CAMERA_LIST,
	value => {
		addMarkerLayer();
	},
);

watch(
	() => props.zoom,
	value => {
		setZoom();
		if (value >= 11) {
			if (markerWithTextLayer.value) {
				markerWithTextLayer.value.showAllMarker();
			}
		}
	},
);

watch(
	() => props.mapping_Info,
	val => {
		drawingDetailPolygon(props.mapping_Info);
	},
);

mapObjectMap.value = {
	Main: {
		center: props.centerCoordinate,
		zoom: props.zoom,
		// drawing: () => drawingEntirePolygon(),
	},
	CameraMain: {
		center: props.centerCoordinate,
		zoom: props.zoom,
		// drawing: () => drawingEntirePolygon(),
	},
	Detail: {
		center: props.centerCoordinate,
		zoom: 15,
		drawing: () => drawingDetailPolygon(props.mapping_Info),
	},
	DetailModal: {
		center: props.centerCoordinate,
		zoom: 15,
	},
};
// vw.value = window.vw;

const mapController = shallowRef(null);
const mapObject = shallowRef(null); // 실제 지도 값

const mapView = ref(null);
const style = ref(null);

// 지도 초기화
const initializeMap = () => {
	// if (vw.value) {
	// 	vw.value.ol3.MapOptions = {
	// 		// basemapType: vw.value.ol3.BasemapType.GRAPHIC, // 2D 배경지도
	// 		// basemapType: vw.value.ol3.BasemapType.PHOTO, // 일반 위성
	// 		basemapType: vw.value.ol3.BasemapType.PHOTO_HYBRID, // 하이브리드 위성 - layer가 쌓이는 구조, 따라서 polygon 지정시 z-index 지정 후 사용
	// 		controlDensity: vw.value.ol3.DensityType.EMPTY,
	// 		interactionDensity: vw.value.ol3.DensityType.BASIC,
	// 		controlsAutoArrange: true,
	// 		homePosition: vw.value.ol3.CameraPosition,
	// 		initPosition: vw.value.ol3.CameraPosition,
	// 	};
	// 	// 지도 객체 생성
	// 	map2d.value = new vw.value.ol3.Map(
	// 		`map2d${props.mode}`,
	// 		vw.value.ol3.MapOptions,
	// 	);
	// 	// view 객체 생성
	// 	mapView.value = map2d.value.getView();
	// 	// 중심값 설정
	// 	if (mapObjectMap.value[props.mode].center) {
	// 		setCenter(mapObjectMap.value[props.mode].center);
	// 	}
	// 	// zoom level 설정
	// 	mapView.value.setZoom(mapObjectMap.value[props.mode].zoom);
	// 	addMarkerLayer();
	// 	// 최초 폴리곤 그리기
	// 	if (props.mode === 'Detail') {
	// 		mapObjectMap.value[props.mode].drawing();
	// 	}
	// } else {
	// 	message.error('지도 호출 실패');
	// }

	vw.MapControllerOption = {
		container: `map2d${props.mode}`,
		mapMode: 'ws3d-map',
		basemapType: vw.ol3.BasemapType.GRAPHIC,
		controlDensity: vw.ol3.DensityType.BASIC,
		interactionDensity: vw.ol3.DensityType.BASIC,
		controlsAutoArrange: true,
		homePosition: vw.ol3.CameraPosition,
		initPosition: vw.ol3.CameraPosition,
	};
	mapController.value = new vw.MapController(vw.MapControllerOption);
	// mapController.value.setMode('2d-map');

	mapController.value.Map3D.setNavigationZoomVisible(false);

	mapController.value.Map3D.setLogoVisible(false);

	mapObject.value = mapController.value.Map3D;

	var options = {
		mapId: 'map',
		initPosition: new vw.CameraPosition(
			new vw.CoordZ(
				props.centerCoordinate[0],
				props.centerCoordinate[1],
				45000,
			),
			new vw.Direction(0, -90, 0),
		),
		logo: true,
		navigation: true,
	};

	mapObject.value.setOption(options);
};

const setStyle = () => {
	style.value = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: props.mode === 'Main' ? [15, 104, 136, 0.7] : [216, 217, 216, 0.7],
			width: 3,
		}),
		// fill: new ol.style.Fill({
		// 	color: props.mode === 'Main' ? [216, 217, 216, 0.7] : [205, 76, 84, 0.5],
		// }),
		fill: new ol.style.Fill({
			color:
				props.mode === 'Main' ? [216, 217, 216, 0.7] : [211, 119, 25, 0.65],
		}),
	});
};

const setCenter = center => {
	if (mapObject.value) {
		var options = {
			mapId: 'map',
			initPosition: new vw.CameraPosition(
				new vw.CoordZ(
					props.centerCoordinate[0],
					props.centerCoordinate[1],
					45000,
				),
				new vw.Direction(0, -90, 0),
			),
			logo: true,
			navigation: true,
		};

		mapObject.value.setOption(options);
	}
};

const setZoom = () => {
	if (mapView.value) {
		mapView.value.setZoom(props.zoom || mapObjectMap.value[props.mode].zoom);
	}
};

// const drawingEntirePolygon = () => {
// 	// TRANSFORMED_POLYGON_LIST.forEach(ele => {
// 	// 	ele.forEach(coordinate => {
// 	// 		createPolygon(coordinate);
// 	// 	});
// 	// });
// };

// 폴리곤 초기화 함수
const clearPolygon = () => {
	if (vectorLayer.value) {
		map2d.value.removeLayer(vectorLayer.value); // 폴리곤 레이어 제거
		vectorLayer.value = null; // 레이어 변수 초기화
	}
};

const drawingDetailPolygon = mappingInfoList => {
	clearPolygon();
	addMarkerLayer(mappingInfoList.length);
	// 단일 폴리곤
	// 	createPolygon([TRANSFORMED_DETAIL_POLYGON_LIST(polygon)]);

	let centerList = [];

	// 다중 폴리곤
	mappingInfoList.forEach(item => {
		createPolygon([TRANSFORMED_DETAIL_POLYGON_LIST(item.mapPolygon2D)]);
		centerList.push(item.mapPolygon_center);
		addMarker(
			item.mapPolygon_center[0],
			item.mapPolygon_center[1],
			item.location_name,
			'polygon',
		);
	});

	if (centerList.length > 0) {
		setCenter(CALCULATE_CENTER(centerList));
	}
};

const clearMarker = () => {
	if (markerLayer.value) {
		map2d.value.removeLayer(markerLayer.value); // 폴리곤 레이어 제거
		markerLayer.value = null; // 레이어 변수 초기화
	}
};

const vectorLayer = ref(null);

// 폴리곤 그리기
const createPolygon = coordinate => {
	if (coordinate[0].length > 0) {
		if (vw.value) {
			// mounted 되기 전 ol 호출 시 ol is not defined error
			setStyle();
			let polygonFeature = new ol.Feature({
				geometry: new ol.geom.Polygon(coordinate),
			});
			polygonFeature.setStyle(style.value); // 스타일 적용
			// Vector layer 객체 생성
			vectorLayer.value = new ol.layer.Vector({
				source: new ol.source.Vector({
					features: [polygonFeature],
				}),
			});
			vectorLayer.value.setZIndex(8999); // polygon z-index 설정(PHOTO_HYBRID / 하이브리드 위성 지도 사용) // 폴리곤 마커 z-index -> 9000
			map2d.value.addLayer(vectorLayer.value); // polygon 객체 등록
		}
	}
};

// 전체 map - 카메라 별 통합된 화각 그리기 + center 좌표 마커 띄우기

// 동일 위치 카메라 marker 1개만 표시 코드 구현 예정

const markerLayer = ref(null);
const markerWithTextLayer = ref(null);
// 마커 레이어 추가
const addMarkerLayer = mappingInfoList => {
	clearMarker();
	markerLayer.value = new vw.value.ol3.layer.Marker(map2d.value);
	markerWithTextLayer.value = new vw.value.ol3.layer.Marker(map2d.value);
	map2d.value.addLayer(markerLayer.value);
	map2d.value.addLayer(markerWithTextLayer.value);

	if (props.mode === 'Main' || props.mode === 'CameraMain') {
		addMarkers();
	} else {
		if (!mappingInfoList) {
			addMarker(
				props.cctv_location[0],
				props.cctv_location[1],
				props.cctv_name,
			);
		}
	}
};

const equalPositionCameraList = ref([]);

import imageSrc from '@/assets/svgs/mapMarker.svg';
import grayMarker from '@/assets/svgs/grayMarker.svg';
import greenMarker from '@/assets/svgs/greenMarker.svg';
import icon03 from '@/assets/svgs/card-info04.svg';

// 마커 그리기
const addMarkers = () => {
	// CAMERA_LIST 변경될 때 마다 해당 로직 태워야 함

	const uniqueLocations = {}; // 중복을 확인하기 위한 객체
	const filteredList = CAMERA_LIST.value.filter(camera => {
		const locationKey = camera.cctv_location.join(','); // 배열을 문자열로 변환하여 키로 사용
		if (uniqueLocations[locationKey]) {
			return false;
		}
		uniqueLocations[locationKey] = true; // 위치를 객체에 추가하여 표시
		return true;
	});

	filteredList.forEach((camera, idx) => {
		vw.value.ol3.markerOption = {
			x: camera.cctv_location[0],
			y: camera.cctv_location[1],
			epsg: 'EPSG:4326',
			iconUrl: imageSrc,
			attr: {
				...camera,
			},
		};

		markerLayer.value.addMarker(vw.value.ol3.markerOption);
	});
	filteredList.forEach((camera, idx) => {
		vw.value.ol3.markerOption = {
			x: camera.cctv_location[0],
			y: camera.cctv_location[1],
			epsg: 'EPSG:4326',
			iconUrl: imageSrc,
			attr: {
				...camera,
			},
			text: {
				offsetX: 0.5, //위치설정
				offsetY: 20, //위치설정
				font: '12px Calibri,sans-serif',
				fill: { color: '#fff' },
				stroke: { color: '#000', width: 2 },
				text: camera.cctv_name,
			},
		};
		markerWithTextLayer.value.addMarker(vw.value.ol3.markerOption);
	});

	if (props.mode === 'Main') {
		map2d.value.on('click', evt => {
			let pixel = evt.pixel; //선택한 픽셀 값
			equalPositionCameraList.value = [];
			map2d.value.forEachFeatureAtPixel(pixel, (feature, layer) => {
				if (feature.values_.attr) {
					equalPositionCameraList.value = CAMERA_LIST.value.filter(camera =>
						camera.cctv_location.every(
							(value, index) =>
								value === feature.values_.attr.cctv_location[index],
						),
					);
					dialogVisible.value = true;
					setCenter(feature.values_.attr.cctv_location);
				}
			});
			equalPositionCameraList.value.sort((a, b) => {
				return a.cctv_ID - b.cctv_ID;
			});
		});

		// 정상 동작
		// map2d.value.on('change:size', val => {
		// 	console.log(val);
		// });
	} else {
		map2d.value.on('click', evt => {
			let pixel = evt.pixel; //선택한 픽셀 값
			map2d.value.forEachFeatureAtPixel(pixel, (feature, layer) => {
				if (feature.values_.attr) {
					setCenter(feature.values_.attr.cctv_location);
					setZoom();
				}
			});
		});
	}
	map2d.value.on('wheel', val => {
		setTimeout(() => {
			let zoom = map2d.value.getView().getZoom();
			if (zoom >= 11) {
				markerWithTextLayer.value.showAllMarker();
			} else if (zoom < 11) {
				markerWithTextLayer.value.hideAllMarker();
			}
		}, 100);
	});

	let zoom = map2d.value.getView().getZoom();
	if (zoom >= 11) {
		markerWithTextLayer.value.showAllMarker();
	} else if (zoom < 11) {
		markerWithTextLayer.value.hideAllMarker();
	}

	if (CAMERA_LIST.value.length > 10) {
		markerWithTextLayer.value.hideAllMarker();
	}
};

const addMarker = (x, y, text, type) => {
	// marker 초기화 함수 추가
	vw.value.ol3.markerOption = {
		x,
		y,
		epsg: 'EPSG:4326',
		// iconUrl: type === 'polygon' ? icon03 : imageSrc,
		iconUrl: imageSrc,
		text: {
			offsetX: 0.5, //위치설정
			offsetY: 15, //위치설정
			font: '12px Calibri,sans-serif',
			fill: { color: '#fff' },
			stroke: { color: '#000', width: 2 },
			text,
		},
	};
	markerLayer.value.addMarker(vw.value.ol3.markerOption);
};

const selectCamera = props => {
	let cameraIndex = CAMERA_LIST.value.findIndex(
		item => item.cctv_ID === props.row.cctv_ID,
	);
	emit('updateCameraIndex', cameraIndex);
	dialogVisible.value = false;
};

const dialogVisible = ref(false);

const callRTSP = ref(null);
if (location.pathname.split('/').pop() !== 'camera') {
	callRTSP.value = inject('callRTSP');
}

const setCenterZoom = () => {
	$fetch(`${BASE_URL}/vworld/create`, {
		method: 'POST',
		body: {
			zoom: mapView.value.getZoom(), // int // 8
			center: TRANSFORM_900913_TO_4326(mapView.value.getCenter()), // array // [14368971.260075545, 4510828.1422916 ]
		},
	})
		.then(res => {
			message.success('지도 중심점 저장 완료');
			location.href = location.href;
		})
		.catch(err => {
			message.error('지도 중심점 저장 실패');
		});
};

defineExpose({
	setCenterZoom,
	setZoom,
});
</script>

<style scoped>
/* 브이월드 로고 */
:deep(logobtn) {
	/* display: none; */
}

/* 연속지적도 안내 문구 */
:deep(.ol-overlaycontainer-stopevent > .vw-notice) {
	display: none;
	/* visibility: hidden; */
}
:deep(.ol-overlaycontainer-stopevent > .vw-scale-line) {
	top: 10px;
}
/* 지도 상 거리 출력 */
/* :deep(.ol-unselectable) {
	width: 80%;
	text-align: right;
} */
:deep(.vw-scale-line-inner) {
	border: 2px solid #ffffff;
	border-top: none;
	color: #ffffff;
	display: inline-block;
}

/* 마커 클릭 시, popup hidden */
:deep(.ol-overlay-container) {
	visibility: hidden;
}
</style>
