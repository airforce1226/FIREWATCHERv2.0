<template>
	<div class="flex" style="z-index: 3">
		<div
			v-for="(card, index, key) in iconMap"
			:key="card"
			class="bg-[#00000055] my-2.5 ml-2.5 rounded p-4 backdrop-blur shadow-md"
		>
			<img :src="iconMap[index]" />
			<span class="block text-xs mt-2">
				{{ index }}
			</span>
			<span class="block text-xl font-bold">
				{{ props[countMap[index]] || 'No data' }}
				<!-- {{
					index === 'CCTV 채널 수' ? '212' : props[countMap[index]] || 'No data'
				}} -->
			</span>
		</div>
	</div>
</template>
<script setup>
import icon01 from '@/assets/svgs/card-info01.svg';
import icon02 from '@/assets/svgs/card-info02.svg';
import icon03 from '@/assets/svgs/card-info03.svg';

const props = defineProps(['eventCount', 'issueCount', 'cameraCount']);

const iconMap = {
	'CCTV 장애 건수': icon01,
	'CCTV 채널 수': icon02,
	'당일 이벤트 추정 건수': icon03,
};

const countMap = ref({
	'CCTV 장애 건수': 'issueCount',
	'CCTV 채널 수': 'cameraCount',
	'당일 이벤트 추정 건수': 'eventCount',
});
</script>
