<template>
	<div class="flex" style="z-index: 3">
		<div
			v-for="(card, index, key) in iconMap"
			:key="card"
			class="bg-[#00000055] my-2.5 ml-2.5 rounded p-4 backdrop-blur shadow-md"
		>
			<img :src="iconMap[index]" />
			<span class="block text-xs mt-2">
				{{ t(index) }}
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
import { useI18n } from 'vue-i18n'; // Import useI18n

const { t } = useI18n(); // Destructure t from useI18n
import icon01 from '@/assets/svgs/card-info01.svg';
import icon02 from '@/assets/svgs/card-info02.svg';
import icon03 from '@/assets/svgs/card-info03.svg';

const props = defineProps(['eventCount', 'issueCount', 'cameraCount']);

const iconMap = {
	cctv_issue_count: icon01,
	cctv_channel_count: icon02,
	estimated_events_for_today: icon03,
};

const countMap = ref({
	cctv_issue_count: 'issueCount',
	cctv_channel_count: 'cameraCount',
	estimated_events_for_today: 'eventCount',
});
</script>
