<template>
	<div class="grid grid-rows-2 grid-cols-3 gap-[5px] h-full">
		<div
			v-for="(card, index) in iconList"
			class="border rounded p-2.5 h-full w-full"
			:class="[
				card.hover
					? 'bg-[#2C2023A5] border-[#AB3D23]'
					: 'bg-[#292A2E] border-[#2F3134]',
			]"
			@mouseenter="card.hover = true"
			@mouseleave="card.hover = false"
		>
			<div class="flex justify-center items-center h-full w-full">
				<div
					v-if="weatherListTemp"
					class="flex flex-col justify-center items-center"
				>
					<img
						:src="
							card.hover
								? card.key === 'PTY'
									? PTYObjectMap[weatherListTemp[card.key]]?.active
									: card.active
								: card.key === 'PTY'
									? PTYObjectMap[weatherListTemp[card.key]]?.inactive
									: card.inactive
						"
						class="h-[8.77px]"
						:class="l2Login ? 'h-[12px]' : ''"
					/>
					<span
						class="block text-[8px] mt-1.5 mb-0.5"
						:class="l2Login ? 'text-xs' : ''"
					>
						{{ card.name }}
					</span>
					<span
						class="block text-xs whitespace-nowrap"
						:class="l2Login ? 'text-sm' : ''"
					>
						{{
							card.key === 'PTY'
								? PTYObjectMap[weatherListTemp[card.key]]?.type || '-'
								: weatherListTemp[card.key] || '-'
						}}
						{{ card.sign }}
					</span>
				</div>
			</div>
		</div>
	</div>
</template>
<script setup>
import { useI18n } from 'vue-i18n'; // Import useI18n

const { t } = useI18n(); // Destructure t from useI18n
import icon01 from '@/assets/svgs/weather-icon01.svg';
import icon02 from '@/assets/svgs/weather-icon02.svg';
import icon03 from '@/assets/svgs/weather-icon03.svg';
import icon04 from '@/assets/svgs/weather-icon04.svg';
import icon05 from '@/assets/svgs/weather-icon05.svg'; // 비
import snow from '@/assets/svgs/weather-icon05-snow.svg'; // 눈
import rainSnow from '@/assets/svgs/weather-icon05-snowrain.svg'; // 비/눈
import sunny from '@/assets/svgs/weather-icon05-sunny.svg'; // 없음
import icon06 from '@/assets/svgs/weather-icon06.svg';
import icon01A from '@/assets/svgs/weather-icon01-a.svg';
import icon02A from '@/assets/svgs/weather-icon02-a.svg';
import icon03A from '@/assets/svgs/weather-icon03-a.svg';
import icon04A from '@/assets/svgs/weather-icon04-a.svg';
import icon05A from '@/assets/svgs/weather-icon05-a.svg'; // 비
import snowA from '@/assets/svgs/weather-icon05-snow-a.svg'; // 눈
import rainSnowA from '@/assets/svgs/weather-icon05-snowrain-a.svg'; // 비/눈
import sunnyA from '@/assets/svgs/weather-icon05-sunny-a.svg'; // 없음
import icon06A from '@/assets/svgs/weather-icon06-a.svg';

const props = defineProps(['currentIndex', 'dataList', 'dataList_predict']);

const weatherListTemp = ref([]);
onMounted(() => {
	// weatherListTemp.value = CAMERA_LIST.value[0];
	if (props.dataList) {
		weatherListTemp.value = props.dataList[0];
	}
});

watch(
	() => props.currentIndex, // props를 getter 함수로 감싸기
	val => {
		if (String(val)) {
			weatherListTemp.value = props.dataList[props.currentIndex];
		}
	},
);
watch(
	() => props.dataList_predict,
	val => {
		weatherListTemp.value = val[0]; // weatherListTemp를 val로 업데이트
	},
	{
		deep: true,
	},
);

const iconList = ref([
	{
		inactive: icon01,
		active: icon01A,
		name: t('wind_direction'),
		key: 'VEC',
		sign: 'deg',
	},
	{
		inactive: icon02,
		active: icon02A,
		name: t('wind_speed'),
		key: 'WSD',
		sign: 'm/s',
	},
	{
		inactive: icon03,
		active: icon03A,
		name: t('temperature'), // 사이트 별 동적 처리
		key: 'T1H',
		sign: '℃',
	},
	{
		inactive: icon04,
		active: icon04A,
		name: t('humidity'),
		key: 'REH',
		sign: '%',
	},
	{
		inactive: icon05,
		active: icon05A,
		name: t('precipitation_type'),
		key: 'PTY',
		sign: '',
	},
	{
		inactive: icon06,
		active: icon06A,
		name: t('precipitation_amount'),
		key: 'RN1',
		sign: 'mm',
	},
]);
const PTYObjectMap = {
	0: { type: '없음', inactive: sunny, active: sunnyA },
	1: { type: '비', inactive: icon05, active: icon05A },
	2: { type: '비/눈', inactive: rainSnow, active: rainSnowA },
	3: { type: '눈', inactive: snow, active: snowA },
	5: { type: '빗방울', inactive: icon05, active: icon05A },
	6: { type: '비/눈', inactive: rainSnow, active: rainSnowA },
	7: { type: '눈날림', inactive: snow, active: snowA },
};

const l2Login = ref(sessionStorage.getItem('L2Login'));
</script>
