<template>
	<div>
		<el-dialog
			v-model="eventListModal"
			:title="t('view_history')"
			:width="'90%'"
			:height="'90%'"
			align-center
			:close-on-press-escape="false"
		>
			<div class="card p-6 flex justify-around">
				<div>
					<span class="inline-block mr-2.5">
						{{ t('city_county_district') }}
					</span>
					<el-select
						v-model="l2"
						placeholder="시/군/구 선택"
						style="width: 150px"
						:disabled="fixedL2Flag"
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
						placeholder="읍/면/동 선택"
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
							:key="cameraName.id"
							:label="cameraName.label"
							:value="cameraName.value"
						/>
					</el-select>
				</div>
				<div>
					<span class="inline-block mr-2.5">
						{{ t('detection_classification') }}
					</span>
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
					<span class="inline-block mr-2.5"> {{ t('date') }} </span>
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
				</div>
				<el-button type="primary" :icon="Search" @click="search(true)">{{
					t('search')
				}}</el-button>
			</div>
			<div class="mt-5">
				<div class="flex justify-start mb-2.5">
					<img src="assets/svgs/eventList_event.svg" class="mr-2" />
					<em class="card-title mb-0 text-base">
						{{ t('number_of_events') }} : {{ totalCount.toLocaleString() }}
					</em>
				</div>
				<div v-if="eventList.length > 0" class="h-full">
					<el-row :gutter="15" class="overflow-y-scroll" style="height: 65vh">
						<el-col :span="4" v-for="(item, idx) in eventList" class="mb-3.5">
							<div
								class="flex flex-col cursor-pointer"
								@click="openDetailModal(item, idx)"
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
									<span v-if="item.mapping_Info.length > 0" class="eventday" />
								</div>
								<div class="p-4 bg-[#1d1e1f] border border-[#353536] rounded-b">
									<span class="block">
										{{ item.cctvname }} - {{ item.evtClass_name }}</span
									>
									<!-- Date 형식 변경 -->
									<span class="block">
										{{ formatDate(item.evtTime) }}
									</span>
									<span class="block">
										{{ Object.values(item.cctv_address).join(' ') }}</span
									>
								</div>
								<!-- <el-badge :value="item.mapping_Info.length"> </el-badge> -->
							</div>
						</el-col>
					</el-row>
				</div>
				<div
					v-else-if="searchLoading"
					class="h-[530px] flex justify-center items-center"
				>
					<Loading />
				</div>
				<div v-else class="h-[530px] flex justify-center items-center">
					<el-empty description="No Data" />
				</div>
			</div>
			<template #footer>
				<el-pagination
					v-model:current-page="currentPage"
					layout="prev, pager, next"
					:total="totalCount"
					:page-size="30"
					class="justify-center"
					@current-change="search()"
				/>
			</template>
			<ModalsEventItemModal
				v-model="eventModal"
				:eventInfo="historyEventItem"
				:eventModalRstImage="modalImage"
				:detailMappingInfo="detailMappingInfo"
				mode="history"
				@moveEvent="moveEvent"
				@openInputSmokeTypeModal="openInputSmokeTypeModal"
			></ModalsEventItemModal>
			<ModalsAlertModal
				v-model="inputSmokeTypeModalFlag"
				ok="입력"
				@confirm="saveFilter"
			/>
		</el-dialog>
	</div>
</template>
<script setup>
import ko from 'element-plus/dist/locale/ko.mjs';
import { Search, Delete } from '@element-plus/icons-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { message } = useAlarm();

const $dayjs = useDayjs();
const ip = ref(IP);

const eventListModal = defineModel();
const eventModal = defineModel('eventModal');
const historyEventItem = ref({});
const modalImage = ref('');
const currentPage = ref(1);
const eventList = ref([]);
const totalCount = ref(0);

watch(eventModal, value => {
	if (!value) {
		sessionStorage.setItem('historyMode', false);
	}
});

const fixedL2Flag = ref(false);
watch(eventListModal, async value => {
	if (value) {
		await fetchCameraName();

		SOCKET.emit('reqEventDate');

		if (JSON.parse(sessionStorage.getItem('USER'))._data.address) {
			l2.value = JSON.parse(sessionStorage.getItem('USER'))._data.address.L2;
			fixedL2Flag.value = true;
		} else {
			l2.value = 'All';
		}

		// l2.value = '태백시';
		// fixedL2Flag.value = true;

		// Reset Input form
		l3.value = 'All';
		cameraName.value = 'All';
		classItem.value = '';
		date.value = '';
		eventList.value = [];
		totalCount.value = 0;
		currentPage.value = 1;
	} else {
		SOCKET.off();
	}
});

const eventdays = ref([]);
SOCKET.on('resEventDate', dateList => {
	eventdays.value = dateList;
});
const l2 = ref('All');
const l3 = ref('All');
const cameraName = ref('All');
const classItem = ref();
const date = ref('');
const l2List = ref(['All']);
const l3List = ref(['All']);
const cameraNameList = ref([{ value: 'All', label: 'All', id: 'All' }]);
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

watch(
	() => l2.value,
	value => {
		l3.value = 'All';
		cameraName.value = 'All';
		console.log(value);

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
			console.log(value);
			console.log(cameraList.value);
			console.log(
				cameraList.value.filter(item => item.cctv_address.L2 === value),
			);
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

const isEventday = ({ dayjs }) => {
	return eventdays.value.includes(dayjs.format('YYYY-MM-DD'));
};

const cameraList = ref([]);

const fetchCameraName = async () => {
	cameraNameList.value = [{ value: 'All', label: 'All' }];
	l2List.value = ['All'];
	l3List.value = ['All'];
	try {
		const res = await $fetch.raw(`${BASE_URL}/cctv/read/1`, { method: 'GET' });
		// parsing camera name for select options
		cameraList.value = res._data;
		let tempCameraNameList = [];
		let tempL2List = [];
		let tempL3List = [];
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
	} catch (error) {
		console.log(error);
	}
};

const searchLoading = ref(false);

const search = async value => {
	if (value) {
		currentPage.value = 1;
	}
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

	await $fetch(`${BASE_URL}/event/history`, {
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
					key: 'evtClass_name',
					value: classItem.value || 'All',
				},
				{
					key: 'cctv_info',
					value: cameraName.value || 'All',
				},
				{
					key: 'startDate',
					value: startDate || 'All',
				},
				{
					key: 'endDate',
					value: endDate || 'All',
				},
			],
			pagenum: value ? 1 : currentPage.value,
		},
	})
		.then(res => {
			searchLoading.value = false;
			if (res) {
				console.log(res);
				eventList.value = res.events;
				eventList.value.forEach(ele => {
					ele.loading = false;
				});
				totalCount.value = res.totalEvents;

				message.success('이벤트 호출 완료');
			} else {
				message.warning('이벤트 없음');
				totalCount.value = 0;
			}
		})
		.catch(err => {
			searchLoading.value = false;
			message.error('이벤트 검색 오류');
		});
};

const formatDate = inputDate => {
	const formattedDate = inputDate.replace(
		/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).*/,
		'$1/$2/$3 $4:$5:$6',
	);
	return formattedDate;
};

const currentEventIdx = ref(0);
const detailMappingInfo = ref(null);
const openDetailModal = (item, idx, loadingFlag) => {
	detailMappingInfo.value = Object.values(
		item.mapping_Info.reduce((acc, item) => {
			if (item.location_name) {
				acc[item.location_name] = item;
			}
			return acc;
		}, {}),
	);
	modalImage.value = '';
	currentEventIdx.value = idx;

	if (!loadingFlag) {
		item.loading = true;
	}
	historyEventItem.value = item;
	historyEventItem.value.cctv_name = item.cctvname;
	eventModal.value = true;
	sessionStorage.setItem('historyMode', true);

	callImage(item);
};

const callImage = item => {
	$fetch(`${BASE_URL}/cctv/image`, {
		method: 'POST',
		body: {
			path: item.evtRstImg_path,
		},
	}).then(res => {
		item.loading = false;
		modalImage.value = URL.createObjectURL(res);
		// modal.value = true;
	});
};

const deleteEvent = event => {
	$fetch
		.raw(`${BASE_URL}/event/history/delete/${event._id}`, {
			method: 'GET',
		})
		.then(res => {
			if (res.status === 200) {
				message.success(`${event.cctvname}  ${t('deleted')}`);
				eventList.value = eventList.value.filter(
					item => item._id !== event._id,
				);
			}
		})
		.catch(err => {
			console.log(err);
		});
};

const moveEvent = value => {
	currentEventIdx.value += value;

	if (currentEventIdx.value < 0) {
		message.warning('첫번째 이벤트입니다');
		currentEventIdx.value -= value;
	} else if (eventList.value.length - 1 < currentEventIdx.value) {
		message.warning('마지막 이벤트입니다');
		currentEventIdx.value -= value;
	} else {
		openDetailModal(
			eventList.value[currentEventIdx.value],
			currentEventIdx.value,
			true,
		);
	}
};
const inputSmokeTypeModalFlag = ref(false);
const saveFilter = type => {
	$fetch
		.raw(`${BASE_URL}/cctv/history/savefilter`, {
			method: 'POST',
			body: {
				eventInfo: historyEventItem.value,
				type,
			},
		})
		.then(res => {
			if (res.status === 200) {
				message.success('필터가 등록되었습니다.');
			} else {
				message.warning('필터 등록에 오류가 발생하였습니다.');
			}
		})
		.catch(err => {
			message.error('필터 등록에 실패하였습니다.');
		});
};
const openInputSmokeTypeModal = () => {
	if (ip.value === '121.188.22.195') {
		inputSmokeTypeModalFlag.value = true;
	} else {
		saveFilter();
	}
};
</script>
<style scoped>
.cell {
	height: 30px;
	padding: 3px 0;
	box-sizing: border-box;
}
.cell.today {
	font-weight: bold;
	color: var(--el-color-primary);
}
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
.eventday {
	position: absolute;
	width: 6px;
	height: 6px;
	background: var(--el-color-danger);
	border-radius: 50%;
	bottom: 5%;
	left: 95%;
	transform: translateX(-50%);
}
.cell .text {
	width: 24px;
	height: 24px;
	display: block;
	margin: 0 auto;
	line-height: 24px;
	position: absolute;
	left: 50%;
	transform: translateX(-50%);
	border-radius: 50%;
}
.cell.start .text,
.cell.end .text {
	background: #cd4c54;
	color: #fff;
}
.cell.start-range {
	border-bottom-left-radius: 15px;
	border-top-left-radius: 15px;
	margin-left: 5px;
}
.cell.end-range {
	border-bottom-right-radius: 15px;
	border-top-right-radius: 15px;
	margin-right: 5px;
}
.cell.range {
	background: #2b2b2c;
}
</style>
