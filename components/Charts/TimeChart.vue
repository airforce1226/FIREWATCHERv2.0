<template>
	<Bar ref="chartInstanceTest" :data="chartData" :options="chartOptions" />
</template>
<script setup>
const props = defineProps(['data']);
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
	'0-4': 0,
	'4-8': 0,
	'8-12': 0,
	'12-16': 0,
	'16-20': 0,
	'20-24': 0,
};
const chartData = computed(() => {
	const dataForm = { ...initialDataForm }; // 초기 상태로 리셋
	const data = props.data || [];
	data.forEach(element => {
		dataForm[element.key] = element.value;
	});
	return {
		labels: Object.keys(dataForm),
		datasets: [
			{
				data: Object.values(dataForm),
				backgroundColor: '#983539',
				barThickness: 10,
			},
		],
	};
});
</script>
