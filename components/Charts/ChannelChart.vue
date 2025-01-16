<template>
	<Bar ref="chartInstanceTest" :data="chartData" :options="chartOptions" />
</template>
<script setup>
const props = defineProps(['currentIndex']);

import {
	Chart as ChartJS,
	Title,
	Tooltip,
	Legend,
	BarElement,
	CategoryScale,
	LinearScale,
} from 'chart.js';
import { Bar } from 'vue-chartjs';

ChartJS.register(
	Title,
	Tooltip,
	Legend,
	BarElement,
	CategoryScale,
	LinearScale,
);

const chartOptions = ref({
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: {
			display: false,
		},
		tooltip: {
			enabled: false,
			external: CUSTOMIZED_TOOLTIP,
		},
	},
	interaction: {
		intersect: false,
		mode: 'index',
	},
	scales: {
		x: {
			grid: {
				display: false,
			},
			ticks: {
				font: {
					size: 7,
					color: 'white',
				},
			},
		},
		y: {
			grid: {
				color: '#B7B7B7',
			},
			ticks: {
				font: {
					size: 8,
				},
			},
		},
	},
});

// 차트 데이터의 초기 상태
const initialDataForm = {
	evtcount: 0,
	noisef: 0,
	weatherf: 0,
	clipf: 0,
	final: 0,
};
const chartData = computed(() => {
	const dataForm = { ...initialDataForm }; // 초기 상태로 리셋
	const data = CAMERA_LIST.value[props.currentIndex]?.rstfilterInfo || [];
	data.forEach(element => {
		dataForm[element.key] = element.count;
	});
	return {
		// labels: Object.keys(dataForm),
		labels: ['탐지', '통신', '기상', '정밀', '최종'],
		datasets: [
			{
				data: Object.values(dataForm),
				backgroundColor: [
					'#732028',
					'#983539',
					'#ab3d23',
					'#D37719',
					'#E0A025',
				],
				barThickness: 10,
			},
		],
	};
});
</script>
