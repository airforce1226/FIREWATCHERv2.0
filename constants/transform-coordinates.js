import * as olProj from 'ol/proj'; // 새로고침 시, ol undefined 이슈로 인한 olProj import
// 지도의 좌표계 자체를 변경하려 했으나, v-world 에서 setProjection 을 지원하지않는것으로 보임
// v-world 에서는 EPSG:900913(EPSG:3857) 을 사용하는 관계로 EPSG:4326 -> EPSG:900913(EPSG:3857) 로 변환 후 사용

const TRANSFORM_4326_TO_900913 = coordinate => {
	return olProj.transform(coordinate, 'EPSG:4326', 'EPSG:900913');
};
const TRANSFORM_900913_TO_4326 = coordinate => {
	return olProj.transform(coordinate, 'EPSG:900913', 'EPSG:4326');
};

// Main mode 좌표 변환 (전체 폴리곤)
const TRANSFORM_MAIN_COORDINATES = coordinates => {
	return coordinates.map(polygon => {
		return polygon.map(coordinate => {
			return coordinate.map(ele => {
				return TRANSFORM_4326_TO_900913(ele);
			});
		});
	});
};

// const TRANSFORMED_POLYGON_LIST = MAP_POLYGON.features.map(feature => {
// 	return TRANSFORM_MAIN_COORDINATES(feature.geometry.coordinates);
// });

// detail mode 좌표 변환 (개별 폴리곤)
const TRANSFORM_DETAIL_COORDINATES = coordinates => {
	// 다중 폴리곤인 경우
	// return coordinates.map(point => {
	return TRANSFORM_4326_TO_900913(coordinates);
	// });
};

const TRANSFORMED_DETAIL_POLYGON_LIST = list => {
	return list.map(feature => {
		return TRANSFORM_DETAIL_COORDINATES(feature);
	});
};

const CENTER_COORDINATED = coordinates => {
	return [
		coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length,
		coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length,
	];
};

export {
	TRANSFORM_DETAIL_COORDINATES,
	// TRANSFORMED_POLYGON_LIST,
	TRANSFORMED_DETAIL_POLYGON_LIST,
	TRANSFORM_4326_TO_900913,
	TRANSFORM_900913_TO_4326,
	CENTER_COORDINATED,
};
