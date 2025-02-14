<template>
	<div class="h-full overflow-y-scroll">
		<div
			v-for="(event, index) in EVENT_LIST?.evtlist"
			:key="index"
			:class="[
				'bg-[#292A2E] border border-[#2F3134] rounded px-2 py-2 text-sm flex justify-between items-center mr-2 cursor-pointer',
				index ? 'mt-2.5' : '',
				selectedEventIndex === index
					? 'bg-[#2C2023A6] border-[#AB3D23]'
					: 'hover:bg-[#2c20234a] hover:border-[#ab3c2379]',
			]"
			@click="selectEvent(event, index)"
		>
			<img :src="event.cropImage" class="w-14" />
			<span>
				{{ event.cctv_name }}
				<!-- {{ event?.roi_address?.split(' ').slice(-2).join(' ') }} 이벤트 리스트에서는 카메라 명 표출 -> 최근 이벤트 세부정보 및 이벤트 모달에서 roi_address 표출-->
				<img
					v-if="event.mapping_Info?.length > 0"
					src="@/assets/svgs/cctv-issue.svg"
					class="mr-2 w-2.5 h-2.5"
					style="display: inline"
				/>
			</span>
			<span class="block">
				{{ $dayjs(event.evtTime).format('HH:mm:ss') }}
			</span>
		</div>
	</div>
</template>
<script setup>
import { useI18n } from 'vue-i18n'; // Import useI18n

const { t } = useI18n(); // Destructure t from useI18n
const { notification } = useAlarm();

const emit = defineEmits(['updateEventInfo']);

const props = defineProps(['selectedEventIndex']);

const selectEvent = (event, index) => {
	callSelectEvent(event, index);
};

// 선택된 이벤트 호출
const callSelectEvent = async (event, index) => {
	await $fetch(`${BASE_URL}/cctv/chEvt/${event.evtid}`, {
		method: 'GET',
	})
		.then(res => {
			emit('updateEventInfo', res, event.evtid, index);
		})
		.catch(err => {
			notification(t('api_call_failed'), `${err}`);
		});
};

// EventDetail - image 업데이트
const count = ref(10);
const loading = ref(false);
const noMore = computed(() => count.value >= 20);
const disabled = computed(() => loading.value || noMore.value);
const load = () => {
	loading.value = true;
	setTimeout(() => {
		count.value += 2;
		loading.value = false;
	}, 2000);
};

defineExpose({
	selectEvent,
});
</script>
<style>
.infinite-list-wrapper {
	height: 300px;
	text-align: center;
}
.infinite-list-wrapper .list {
	padding: 0;
	margin: 0;
	list-style: none;
}

.infinite-list-wrapper .list-item {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 50px;
	background: var(--el-color-danger-light-9);
	color: var(--el-color-danger);
}
.infinite-list-wrapper .list-item + .list-item {
	margin-top: 10px;
}
.eventday {
	width: 6px;
	height: 6px;
	background: var(--el-color-danger);
	border-radius: 50%;
}
</style>
