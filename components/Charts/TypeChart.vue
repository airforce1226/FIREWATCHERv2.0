<template>
	<div v-if="data" class="h-full">
		<Doughnut :data="chartData" :options="chartOptions" />
		<div class="flex justify-between text-[10px] text-[#B7B7B7] m-auto mt-4">
			<el-tooltip effect="firewatcher-chart" :content="t('total_events')">
				<div class="flex items-center">
					<i class="inline-block rounded mr-1.5 w-1 h-1 bg-[#732028]" />
					<span class="cursor-default">이벤트</span>
				</div>
			</el-tooltip>
			<el-tooltip
				effect="firewatcher-chart"
				:content="t('excluded_events_due_to_camera')"
			>
				<div class="flex items-center">
					<i class="inline-block rounded mr-1.5 w-1 h-1 bg-[#983539]" />
					<span class="cursor-default">통신</span>
				</div>
			</el-tooltip>
			<el-tooltip
				effect="firewatcher-chart"
				:content="t('excluded_events_due_to_weather')"
			>
				<div class="flex items-center">
					<i class="inline-block rounded mr-1.5 w-1 h-1 bg-[#ab3d23]" />
					<span class="cursor-default">기상</span>
				</div>
			</el-tooltip>
			<el-tooltip
				effect="firewatcher-chart"
				:content="t('excluded_events_through_analysis')"
			>
				<div class="flex items-center">
					<i class="inline-block rounded mr-1.5 w-1 h-1 bg-[#D37719]" />
					<span class="cursor-default">정밀</span>
				</div>
			</el-tooltip>
			<el-tooltip
				effect="firewatcher-chart"
				:content="t('events_remaining_after_filters')"
				placement="bottom-end"
			>
				<div class="flex items-center">
					<i class="inline-block rounded mr-1.5 w-1 h-1 bg-[#E0A025]" />
					<span class="cursor-default">최종</span>
				</div>
			</el-tooltip>
		</div>
	</div>
</template>
<script setup>
import { useI18n } from 'vue-i18n'; // Import useI18n

const { t } = useI18n(); // Destructure t from useI18n
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'vue-chartjs';
ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps(['data']);

const initialDataForm = {
	evtcount: 0,
	noisef: 0,
	weatherf: 0,
	clipf: 0,
	final: 0,
};

const chartData = computed(() => {
	const dataForm = initialDataForm;
	const data = props.data || [];
	data.forEach(element => {
		dataForm[element.key] = element.count;
	});
	return {
		labels: Object.keys(dataForm),
		datasets: [
			{
				data: Object.values(dataForm),
				backgroundColor: [
					'#732028',
					'#983539',
					'#ab3d23',
					'#D37719 ',
					'#E0A025',
				],
				borderWidth: 0,
				cutout: '70%',
			},
		],
	};
});

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
			display: false,
		},
		y: {
			display: false,
		},
	},
});
</script>
<style>
.el-popper.is-firewatcher-chart {
	padding: 6px 12px;
	background: #462127;
	border: 1px solid #ab3d23;
	color: #fff;
}
.el-popper.is-firewatcher-chart .el-popper__arrow::before {
	background: #462127;
	border: 1px solid #ab3d23;
	right: 0;
}
</style>
