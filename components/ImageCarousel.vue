<template>
	<div class="relative text-center">
		<button
			class="absolute top-1/2 -translate-y-1/2 left-2 backdrop-blur rounded-full w-8 h-8 flex justify-center items-center bg-[#0000003c] shadow-md transition hover:bg-[#0000006e]"
			@click="prevIndex()"
		>
			<el-icon><ArrowLeftBold /></el-icon>
		</button>
		<button
			class="absolute top-1/2 -translate-y-1/2 right-2 backdrop-blur rounded-full w-8 h-8 flex justify-center items-center bg-[#0000003c] shadow-md transition hover:bg-[#0000006e]"
			@click="nextIndex()"
		>
			<el-icon><ArrowRightBold /></el-icon>
		</button>
		<img :src="channelThumbnailImage" class="h-full w-full m-auto" />
	</div>
</template>
<script setup>
import { ArrowLeftBold, ArrowRightBold } from '@element-plus/icons-vue';
const emit = defineEmits([
	'callImage',
	'callCCTV',
	'callIssueCCTV',
	'callEntireChartData',
]);

const props = defineProps(['cameraIndex', 'channelThumbnailImage']);

const thumbnailIndex = ref(0);
const callInterval = ref(null);

onMounted(() => {
	callThumbnailImage();
	setIntervalFunction();
});

const setIntervalFunction = () => {
	callInterval.value = setInterval(() => {
		if (thumbnailIndex.value < CAMERA_LIST.value.length - 1) {
			thumbnailIndex.value++;
			callThumbnailImage();
		} else {
			callUpdateData();
			thumbnailIndex.value = 0;
			callThumbnailImage();
		}
	}, 1000 * 5);
};

const callThumbnailImage = () => {
	if (CAMERA_LIST.value) {
		emit(
			'callImage',
			CAMERA_LIST.value[thumbnailIndex.value],
			'thumbnail_rawimgpath',
			null,
			null,
			null,
			thumbnailIndex.value,
		);
	}
};

watch(
	() => props.cameraIndex,
	val => {
		if (props.cameraIndex) {
			if (callInterval.value) {
				thumbnailIndex.value = parseInt(props.cameraIndex);
				callThumbnailImage();
				clearInterval(callInterval.value);
				setIntervalFunction();
			}
		}
	},
);

const prevIndex = () => {
	thumbnailIndex.value--;
	if (thumbnailIndex.value < 0) {
		thumbnailIndex.value = CAMERA_LIST.value.length - 1;
	}
	callThumbnailImage();
};

const nextIndex = () => {
	thumbnailIndex.value++;
	if (thumbnailIndex.value === CAMERA_LIST.value.length) {
		thumbnailIndex.value = 0;
	}
	callThumbnailImage();
};

const callUpdateData = async () => {
	await emit('callCCTV');
	await emit('callIssueCCTV');
	await emit('callEntireChartData');
};

onBeforeUnmount(() => {
	clearInterval(callInterval.value);
});
</script>
