<template>
	<div>
		<div v-if="SITE === '강원도청'" class="flex items-center">
			<img
				v-if="isL2Login"
				:src="`/${siteName}.png`"
				class="mr-5"
				width="120"
				height="40"
			/>
			<img v-else src="/main.png" class="mr-5" width="120" height="40" />
			<img
				src="assets/svgs/gwd-logo.svg"
				class="cursor-pointer"
				@click="router.push('/dashboard')"
			/>
		</div>
		<img
			v-else
			src="assets/svgs/logo.svg"
			class="mr-5 cursor-pointer"
			@click="router.push('/dashboard')"
		/>

		<el-divider content-position="left">이벤트 필터 관리</el-divider>
		<div class="card p-6 flex justify-around">
			<div>
				<span class="inline-block mr-2.5">{{ t('city_county_district') }}</span>
				<el-select
					v-model="l2"
					:placeholder="t('select_city')"
					style="width: 150px"
				>
					<el-option v-for="l2 in l2List" :key="l2" :label="l2" :value="l2" />
				</el-select>
			</div>
			<div>
				<span class="inline-block mr-2.5">
					{{ t('town_village_neighborhood') }}
				</span>
				<el-select
					v-model="l3"
					:placeholder="t('select_town')"
					style="width: 150px"
				>
					<el-option v-for="l3 in l3List" :key="l3" :label="l3" :value="l3" />
				</el-select>
			</div>
			<div>
				<span class="inline-block mr-2.5"> {{ t('camera_name') }} </span>
				<el-select
					v-model="cameraName"
					placeholder="카메라 명 선택"
					style="width: 200px"
				>
					<el-option
						v-for="cameraName in cameraNameList"
						:label="cameraName.label"
						:value="cameraName.value"
					/>
				</el-select>
			</div>
			<!-- <div>
				<span class="inline-block mr-2.5"> t('detection_classification') </span>
				<el-select
					v-model="classItem"
					placeholder="타입을 선택해 주세요"
					style="width: 240px"
				>
					<el-option
						v-for="classItem in classList"
						:key="classItem.id"
						:label="classItem.label"
						:value="classItem.value"
					/>
				</el-select>
			</div>
			<div>
				<span class="inline-block mr-2.5"> t('date')</span>
				<el-config-provider :locale="ko">
					<el-date-picker
						v-model="date"
						type="datetimerange"
						start-placeholder="시작 날짜"
						end-placeholder="끝 날짜"
						:default-value="defaultValue"
						:default-time="defaultTime"
					>
						<template #default="cell">
							<div
								class="cell"
								:class="[
									{ start: cell.start },
									{ end: cell.end },
									{ 'start-range': cell.start && cell.inRange },
									{ 'end-range': cell.end && cell.inRange },
									{ range: cell.inRange },
									{ today: cell.type === 'today' },
								]"
							>
								<span class="text">{{ cell.text }}</span>
								<span v-if="isEventday(cell)" class="eventday" />
							</div>
						</template>
					</el-date-picker>
				</el-config-provider>
			</div> -->
			<el-button type="primary" :icon="Search" @click="search">{{
				t('search')
			}}</el-button>
		</div>
		<div class="mt-5" style="height: 80%">
			<div class="flex justify-start mb-2.5">
				<img src="assets/svgs/eventList_event.svg" class="mr-2" />
				<em class="card-title mb-0 text-base">
					{{ t('number_of_events') }} : {{ totalCount.toLocaleString() }}개
				</em>
			</div>
			<div v-if="eventList.length > 0">
				<el-row :gutter="15" class="overflow-y-scroll" style="height: 65vh">
					<el-col :span="4" v-for="item in eventList" class="mb-3.5">
						<div
							class="flex flex-col cursor-pointer"
							@click="openDetailModal(item)"
						>
							<div
								class="bg-black h-36 rounded-t border border-[#353536] flex justify-center items-center relative"
							>
								<Loading v-if="item.loading" />
								<img
									v-else
									:src="`data:image/png;base64,${item.image}`"
									class="h-full"
								/>
								<el-button
									:icon="Delete"
									circle
									type="info"
									class="absolute top-2 right-2"
									@click.stop="deleteEvent(item)"
								></el-button>
							</div>
							<div class="p-4 bg-[#1d1e1f] border border-[#353536] rounded-b">
								<span class="block">
									{{ item.cctvname }} - {{ item.filter_location_name }}</span
								>
								<span class="block">
									{{ formatDate(item.created) }}
								</span>
								<span class="block text-lg font-semibold text-blue-500">
									{{ item.filter_type ? '종류 : ' + item.filter_type : '' }}
								</span>
							</div>
						</div>
					</el-col>
				</el-row>
			</div>
			<div v-else class="h-[530px] flex justify-center items-center">
				<el-empty description="No Data" />
			</div>
			<div
				v-if="searchLoading"
				class="h-[530px] flex justify-center items-center"
			>
				<Loading />
			</div>
		</div>
		<el-pagination
			v-model:current-page="currentPage"
			layout="prev, pager, next"
			:total="totalCount"
			:page-size="30"
			class="justify-center"
			@current-change="search()"
		/>

		<!-- <el-row :gutter="20" class="h-[calc(100%-72px)] overflow-scroll">
			<el-col v-for="card in 30" :span="4" class="mb-5">
				<div
					class="bg-[#26272A] border border-[#2F3031] p-4 rounded hover:bg-[#2C2023A8] hover:border-[#AB3D23]"
				>
					<div class="flex justify-center items-center h-40 relative">
						<img src="/imgs/image.jpg" class="w-full h-full rounded" />
						<el-button
							:icon="Delete"
							circle
							type="info"
							@click="deleteEvent"
							class="absolute -top-3 -right-3 z-20"
						></el-button>
					</div>
					<div class="flex justify-between mt-4">
						<div class="flex flex-col">
							<span>미로댓재5</span>
							<span class="text-[#b7b7b7]">2024/04/16 18:58:28</span>
							<span class="text-[#b7b7b7]">삼척시 미로면</span>
						</div>
					</div>
				</div>
			</el-col>
		</el-row> -->
	</div>
</template>
<script setup>
import { useI18n } from 'vue-i18n'; // Import useI18n

const { t } = useI18n(); // Destructure t from useI18n
import { Search, Delete } from '@element-plus/icons-vue';
import ko from 'element-plus/dist/locale/ko.mjs';

const router = useRouter();
const { message } = useAlarm();
const $dayjs = useDayjs();
const currentPage = ref(1);
const eventdays = ref([]);
const isL2Login = ref(false);
const siteName = ref(null);

onMounted(() => {
	getCameraList();
	SOCKET.emit('reqfilterDate');
	SOCKET.on('resfilterDate', dateList => {
		eventdays.value = dateList;
	});
	isL2Login.value = !!window.sessionStorage.getItem('L2Login');
	if (isL2Login.value) {
		siteName.value = userMap[JSON.parse(sessionStorage.getItem('L2Login')).L2];
	}
});

const isEventday = ({ dayjs }) => {
	return eventdays.value.includes(dayjs.format('YYYY-MM-DD'));
};
const cameraList = ref([]);
const getCameraList = () => {
	$fetch
		.raw(`${BASE_URL}/cctv/read/1`, { method: 'GET' })
		.then(res => {
			let tempCameraNameList = [];
			let tempL2List = [];
			let tempL3List = [];

			cameraList.value = res._data;
			res._data.forEach(element => {
				tempCameraNameList.push({
					value: element._id,
					label: element.cctv_name,
				});
				const l2Item = element.cctv_address.L2;

				if (!tempL2List.some(item => item === l2Item)) {
					tempL2List.push(l2Item);
				}
				const l3Item = element.cctv_address.L3;
				if (!tempL3List.some(item => item === l3Item)) {
					tempL3List.push(l3Item);
				}
			});
			tempCameraNameList.sort((a, b) => a.label.localeCompare(b.label));
			tempL2List.sort((a, b) => a.localeCompare(b));
			tempL3List.sort((a, b) => a.localeCompare(b));
			cameraNameList.value.push(...tempCameraNameList);
			l2List.value.push(...tempL2List);
			l3List.value.push(...tempL3List);
		})
		.catch(err => {
			console.log(err);
		});
};

const l2 = ref('All');
const l3 = ref('All');
const cameraName = ref('All');
const classItem = ref();
const date = ref('');
const l2List = ref(['All']);
const l3List = ref(['All']);
const cameraNameList = ref([{ value: 'All', label: 'All' }]);
const classList = ref([
	{
		value: 'Wildfire',
		label: '산불',
	},
	{
		value: 'Smoke',
		label: '연기',
	},
	{
		value: 'Night_Wildfire',
		label: '야간산불',
	},
]);
const defaultValue = [
	new Date(new Date().getFullYear(), new Date().getMonth() - 1),
	new Date(new Date().getFullYear(), new Date().getMonth()),
];
const defaultTime = [
	new Date(2000, 1, 1, 0, 0, 0),
	new Date(2000, 2, 1, 0, 0, 0),
];

const totalCount = ref(0);
const eventList = ref([]);
const searchLoading = ref(null);

watch(
	() => l2.value,
	value => {
		l3.value = 'All';
		cameraName.value = 'All';

		if (value === 'All') {
			l3List.value = [
				'All',
				...new Set(
					cameraList.value
						.map(address => address.cctv_address.L3)
						.sort((a, b) => a.localeCompare(b)),
				),
			];
			cameraNameList.value = [
				{ value: 'All', label: 'All' },
				...new Set(
					cameraList.value
						.map(camera => ({
							label: camera.cctv_name,
							value: camera._id,
						}))
						.sort((a, b) => a.label.localeCompare(b.label)),
				),
			];
		} else {
			l3List.value = [
				'All',
				...new Set(
					cameraList.value
						.filter(item => item.cctv_address.L2 === value)
						.map(address => address.cctv_address.L3)
						.sort((a, b) => a.localeCompare(b)),
				),
			];
			cameraNameList.value = [
				{ label: 'All', value: 'All' },
				...new Set(
					cameraList.value
						.filter(item => item.cctv_address.L2 === value)
						.map(camera => ({
							label: camera.cctv_name,
							value: camera._id,
						}))
						.sort((a, b) => a.label.localeCompare(b.label)),
				),
			];
		}
	},
);

watch(
	() => l3.value,
	value => {
		cameraName.value = 'All';
		if (value === 'All') {
			if (l2.value === 'All') {
				cameraNameList.value = [
					{ value: 'All', label: 'All' },
					...new Set(
						cameraList.value
							.map(camera => ({
								label: camera.cctv_name,
								value: camera._id,
							}))
							.sort((a, b) => a.label.localeCompare(b.label)),
					),
				];
			} else {
				cameraNameList.value = [
					{ value: 'All', label: 'All' },
					...new Set(
						cameraList.value
							.filter(item => item.cctv_address.L2 === l2.value)
							.map(camera => ({
								label: camera.cctv_name,
								value: camera._id,
							}))
							.sort((a, b) => a.label.localeCompare(b.label)),
					),
				];
			}
		} else {
			cameraNameList.value = [
				{ value: 'All', label: 'All' },
				...new Set(
					cameraList.value
						.filter(item => item.cctv_address.L3 === value)
						.map(camera => ({
							label: camera.cctv_name,
							value: camera._id,
						}))
						.sort((a, b) => a.label.localeCompare(b.label)),
				),
			];
		}
	},
);

const search = () => {
	searchLoading.value = true;
	eventList.value = [];

	let startDate = '';
	let endDate = '';

	if (date.value[0]) {
		startDate = $dayjs(date.value[0]).format('YYYY/MM/DD HH:mm:ss');
	}

	if (date.value[1]) {
		endDate = $dayjs(date.value[1]).format('YYYY/MM/DD HH:mm:ss');
	}

	$fetch
		.raw(`${BASE_URL}/filter/read`, {
			method: 'POST',
			body: {
				queryJson: [
					{
						key: 'l2',
						value: l2.value,
					},
					{
						key: 'l3',
						value: l3.value,
					},
					{
						key: 'cctv_info',
						value: cameraName.value || 'All',
					},
					{
						key: 'evtClass_name',
						value: classItem.value || 'All',
					},
				],
				pagenum: currentPage.value,
			},
		})
		.then(res => {
			if (res._data) {
				if (res._data.events.length > 0) {
					eventList.value = res._data.events;
					console.log(res._data);
					message.success(t('event_filter_retrieval_complete'));
					eventList.value.forEach(ele => {
						ele.loading = false;
					});
					totalCount.value = res._data.totalEvents;
				}
			} else {
				message.warning(t('no_event_filters_found'));
			}
		})
		.catch(err => {
			console.log(err);
			eventList.value = [];
			searchLoading.value = false;
			message.error(t('event_filter_search_error'));
		});
	searchLoading.value = false;
};

const addEvent = () => {
	message.success(t('new_event_filter_registered'));
};

const deleteEvent = event => {
	$fetch
		.raw(`${BASE_URL}/filter/delete/${event._id}`, {
			method: 'GET',
		})
		.then(res => {
			message.success(`${event.cctvname}(이)가 삭제 되었습니다.`);
			search();
		})
		.catch(err => {
			message.error(t('event_filter_deletion_error'));
		});
};

const formatDate = inputDate => {
	if (inputDate) {
		const formattedDate = inputDate.replace(
			/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).*/,
			'$1/$2/$3 $4:$5:$6',
		);
		return formattedDate;
	}
};

onBeforeUnmount(() => {
	SOCKET.off('resfilterDate');
});
</script>
<style scoped>
.cell .eventday {
	position: absolute;
	width: 6px;
	height: 6px;
	background: var(--el-color-danger);
	border-radius: 50%;
	bottom: 0px;
	left: 50%;
	transform: translateX(-50%);
}
</style>
