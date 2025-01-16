<template>
	<div class="h-full">
		<div class="h-[calc(100%-44px)] relative">
			<div class="mb-5 bg-black h-1/2 w-full flex justify-center">
				<img
					:src="thumbnailImage || ''"
					ref="imageRef"
					class="h-full object-cover"
					@load="imageLoaded"
				/>
				<div
					v-if="isSelectCenterMarker"
					class="absolute top-0 left-1/2 -translate-x-1/2"
					:style="`width:${imageRef.width}px; height:${imageRef.height}px`"
				>
					<el-row class="w-full h-full">
						<el-col
							:span="1"
							v-for="(grid, index) in grids"
							@click="clickedItem(grid, index)"
							class="cursor-pointer hover:bg-[#cd4c5530] transition-all relative border border-[#ffffff20]"
							:class="grid.selected ? 'bg-[#cd4c5545]' : ''"
							@mouseover="autoClick(grid, index)"
						>
							<span
								v-if="grid.selected"
								class="absolute top-0 bottom-0 flex items-end justify-end w-full h-full p-1"
							>
								<el-icon><CircleCheckFilled /></el-icon>
							</span>
						</el-col>
					</el-row>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup>
import Konva from 'konva';
import {
	InfoFilled,
	Delete,
	WarnTriangleFilled,
	CircleCheckFilled,
} from '@element-plus/icons-vue';

// 폴리곤 우클릭 시 - server 에 현재 canvasPolygon 등록되어 있지않은 mapPolygon list 호출 후 select option 에 추가할 예정
const props = defineProps([
	'thumbnailImage',
	'polygons',
	'isSelectCenterMarker',
	'getGridIndexList',
]);
const { message } = useAlarm();
const emit = defineEmits(['removeSelectedPolygon', 'updateGrid']);

const imageRef = ref(null);
// select grid
const isImageLoaded = ref(false);
const imageLoaded = () => {
	isImageLoaded.value = true;
};

watch(
	() => props.getGridIndexList,
	val => {
		grids.value = Array.from({ length: 432 }, (_, i) => ({
			// grids.value = Array.from({ length: 960 }, (_, i) => ({
			index: i,
			selected: false,
		}));

		props.getGridIndexList.forEach(ele => {
			grids.value[ele].selected = true;
		});
		updateGrid();
	},
);

const grids = ref(
	Array.from({ length: 48 }, (_, i) => ({ index: i, selected: false })),
);

const clickedItem = (item, index) => {
	grids.value[index].selected = !grids.value[index].selected;
	updateGrid();
};

const autoClick = (item, index) => {
	window.onkeydown = e => {
		if (e.key === 'Control') {
			grids.value[index].selected = true;
		} else if (e.key === 'Alt') {
			grids.value[index].selected = false;
		}
	};

	window.onkeyup = e => {
		if (e.key === 'Control') {
			updateGrid();
		} else if (e.key === 'Alt') {
			updateGrid();
		}
	};
};

const updateGrid = () => {
	let gridSelectList = grids.value.filter(item => item.selected);
	let indexList = [];
	gridSelectList.forEach(ele => {
		indexList.push(ele.index);
	});
	emit('updateGrid', indexList);
};
</script>
<style>
.draggable {
	cursor: grab;
	user-select: none;
}
</style>
