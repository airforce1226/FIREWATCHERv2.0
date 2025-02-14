<template>
	<div
		style="
			aspect-ratio: 16 / 9;
			margin: auto;
			display: flex;
			position: relative;
		"
	>
		<el-button
			v-if="streamChannelID"
			class="bg-[#2C2023A6] border-[#AB3D23]"
			style="position: absolute; top: 13%; right: 3%; color: white; z-index: 10"
			@click.stop="changeMonitorIframe()"
			>영상 전환</el-button
		>
		<el-button
			class="bg-[#2C2023A6] border-[#AB3D23]"
			style="position: absolute; top: 3%; right: 3%; color: white; z-index: 10"
			@click.stop="openNewWindow()"
			>{{ t('open_in_new_window') }}</el-button
		>
		<canvas
			v-if="!streamChannelID"
			class="h-full w-full"
			style="position: absolute; cursor: pointer; box-sizing: border-box"
			@click="callVideo"
		></canvas>
		<iframe
			:id="`monitorIframe_${videoSource}`"
			ref="iframeTag"
			:src="`${videoSource}?clientIP=${hostname}`"
			class="w-full h-full block m-auto"
			frameborder="0"
			allowfullscreen
			style="height: 1080px"
		></iframe>
	</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'; // Import useI18n

const { t } = useI18n(); // Destructure t from useI18n
import { ArrowLeftBold, ArrowRightBold } from '@element-plus/icons-vue';

const hostname = ref(window.location.hostname);
const { message } = useAlarm();

const props = defineProps([
	'videoSource',
	'streamChannelID',
	'cctvRowColumnList',
	'displayList',
	'monitoringTab',
]);

watch(
	() => props.monitoringTab,
	val => {
		if (props.displayList[val] === props.videoSource) {
			reloadingIframe();
		}
	},
);

const emit = defineEmits(['updateMonitoringTab']);

const iframeTag = ref(null);
const adjustIframeHeight = () => {
	const videoIframe = iframeTag.value;
	const aspectRatio = 16 / 9; // 비디오의 가로 대 세로   비율 (16:9)
	const windowWidth = videoIframe.offsetWidth;
	const windowHeight = videoIframe.offsetWidth / aspectRatio;

	// iframe 크기 설정
	videoIframe.style.height = windowHeight + 'px';

	// iframe 내의 내용이 부모 요소를 벗어나지 않도록 스크롤 제거
	videoIframe.setAttribute('scrolling', 'no');
};
onMounted(() => {
	adjustIframeHeight(); // 처음에 한 번 호출하여 즉시 조정
	window.addEventListener('resize', adjustIframeHeight); // 리사이즈 이벤트를 통해 계속해서 조정
});

const closeRTSP = inject('closeRTSP');

const canvasSvrList = ref([]);

const ori_src = ref(null);
const callVideo = val => {
	const iframe = document.getElementById(`monitorIframe_${props.videoSource}`);
	let videoKey = props.videoSource.split('/').pop();
	if (props.cctvRowColumnList[videoKey]) {
		let row = props.cctvRowColumnList[videoKey].length;
		let col = props.cctvRowColumnList[videoKey][0].length;

		let canvasWidth = val.srcElement.clientWidth;
		let columnWidth = canvasWidth / col;
		let x = Math.floor(val.offsetX / columnWidth);

		let canvasHeight = val.srcElement.clientHeight;
		let rowHeight = canvasHeight / row;
		let y = Math.floor(val.offsetY / rowHeight);

		if (props.cctvRowColumnList[videoKey][y][x]) {
			callRTSP(props.cctvRowColumnList[videoKey][y][x]);
		} else {
			console.log(
				`props.cctvRowColumnList[videoKey][y][x] =${props.cctvRowColumnList[videoKey][y][x]}`,
			);
		}
	} else {
		console.log(
			`props.cctvRowColumnList[videoKey] = ${props.cctvRowColumnList[videoKey]}`,
		);
	}
	// message.warning('수신된 모니터링 리스트가 없습니다. 잠시만 기다려주세요');
};

const callRTSP = inject('callRTSP');

const reloadingIframe = () => {
	const iframe = document.getElementById(`monitorIframe_${props.videoSource}`);
	iframe.src = null;
	// setTimeout(() => {
	// }, 100);
	nextTick(() => {
		iframe.style.height = '1080px';
		iframe.src =
			props.displayList[props.monitoringTab] + '?clientIP=' + hostname.value;
	});
};

const changeMonitorIframe = () => {
	closeRTSP();
	nextTick(() => {
		reloadingIframe();
	});
};

const openNewWindow = () => {
	window.open(
		`${props.videoSource}?clientIP=${hostname.value}`,
		'video',
		'width=1280,height=720',
	);
};

defineExpose({ reloadingIframe });

onBeforeUnmount(() => {
	window.removeEventListener('resize', adjustIframeHeight);
});
</script>
