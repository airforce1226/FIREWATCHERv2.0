<template>
	<div class="h-full">
		<Line :data="chartData" :options="chartOptions" />
		<div class="flex justify-evenly text-xs text-[#B7B7B7] w-9/10 m-auto mt-4">
			<div class="mr-1">
				<i class="inline-block rounded mr-2 w-2 h-2 bg-[#D37719]" />
				<span>CPU ( % ) </span>
			</div>
			<div class="mr-1">
				<i class="inline-block rounded mr-2 w-2 h-2 bg-[#ab3d23]" />
				<span>GPU ( °C )</span>
			</div>
			<div class="mr-1">
				<i class="inline-block rounded mr-2 w-2 h-2 bg-[#732028]" />
				<span>DISK ( % )</span>
			</div>
			<div class="mr-1">
				<i class="inline-block rounded mr-2 w-2 h-2 bg-[#407f94]" />
				<span>NETWORK ( % )</span>
			</div>
		</div>
	</div>
</template>
<script setup>
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from 'chart.js';
import { Line } from 'vue-chartjs';

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
);

const defaultOptions = {
	pointRadius: 2,
	borderWidth: 1,
};

const props = defineProps(['serverStatusInfo', 'statusinfoLabel']);

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
		},
		y: {
			grid: {
				// display: false,
				color: '#B7B7B7',
			},
		},
	},
});

const initialDataForm = {
	CPU_usage: [],
	DISK_usage: [],
	GPU_temperature: [],
	Network_usage: [],
};

const EtcDatasetsForm = [
	{
		key: 'CPU_usage',
		color: '#D37719',
		label: 'CPU',
	},
	{
		key: 'DISK_usage',
		color: '#732028',
		label: 'DISK',
	},
	{
		key: 'Network_usage',
		color: '#407f94',
		label: 'NETWORK',
	},
];

const chartData = computed(() => {
	let data = props.serverStatusInfo;
	if (data) {
		let keys = Object.keys(data);
		keys.forEach(key => {
			if (key === 'GPU_temperature') {
				// gpu 동적 처리
				data[key].forEach((gpu, idx) => {
					if (!initialDataForm[key][idx]) {
						initialDataForm[key][idx] = [];
					}

					if (initialDataForm[key][idx].length > 9) {
						initialDataForm[key][idx].shift();
					}

					initialDataForm[key][idx].push(gpu[1]);
				});
			} else {
				if (key !== 'svr_id') {
					if (initialDataForm[key].length > 9) {
						initialDataForm[key].shift();
					}

					initialDataForm[key].push(data[key]);
				}
			}
		});

		let chartDatasets = [];

		EtcDatasetsForm.forEach(element => {
			let datasetJson = {
				label: element.label,
				backgroundColor: element.color,
				borderColor: element.color,
				...defaultOptions,
				data: initialDataForm[element.key],
			};
			chartDatasets.push(datasetJson);
		});

		initialDataForm['GPU_temperature'].forEach((element, idx) => {
			let datasetJson = {
				label: `GPU_${idx}`,
				backgroundColor: '#ab3d23',
				borderColor: '#ab3d23',
				...defaultOptions,
				data: element,
			};
			chartDatasets.push(datasetJson);
		});

		return {
			labels: props.statusinfoLabel,
			datasets: chartDatasets,
		};
	}
});
</script>
