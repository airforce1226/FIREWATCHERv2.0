<template>
	<div>
		<div class="m-7">
			<slot />
		</div>

		<div
			class="w-full fixed left-0 z-10"
			:class="
				menu ? 'bottom-0 transition-all' : 'bottom-[-71px] transition-all'
			"
			@mouseenter="menu = true"
			@mouseleave="menu = false"
		>
			<div
				class="w-36 h-2 bg-[#983539] rounded-xl shadow-md cursor-pointer hover:opacity-70 m-auto mb-2 animate-bounce"
			></div>

			<div class="bg-[#000000E8] p-5 flex justify-center items-center">
				<div
					v-for="(menu, index) in menuList"
					:key="index"
					class="flex justify-center items-center"
				>
					<span
						v-if="index > 0 && isActive ? true : menu.name !== '계정 관리'"
						class="block w-[1px] h-[28px] mx-6 bg-[#5D5D5D]"
					></span>
					<el-tooltip
						v-if="isActive ? true : menu.name !== '계정 관리'"
						effect="firewatcher"
						:content="t(menu.name)"
					>
						<img
							:src="menu.isHover ? menu.active : menu.inactive"
							class="cursor-pointer"
							@mouseenter="menu.isHover = true"
							@mouseleave="menu.isHover = false"
							@click="menuHandle(menu.name)"
						/>
					</el-tooltip>
				</div>
			</div>
		</div>

		<ModalsPassword v-model:passwordModal="passwordModal" />

		<ModalsAlertModal
			v-model="modal"
			:content="t('confirm_logout')"
			:ok="'logout'"
			:cancel="t('cancel')"
			@confirm="logout()"
		/>

		<ModalsAlertModal
			v-model="systemModal"
			:content="'시스템 준비중입니다.'"
			:cancel="'닫기'"
		/>
		<div
			v-if="isLoading"
			class="fixed inset-0 bg-black bg-opacity-70 z-20 flex items-center justify-center"
		>
			<div
				class="animate-spin rounded-full h-16 w-16 border-t-4 border-[#983539]"
			></div>
		</div>
	</div>
</template>
<script setup>
import { useI18n } from 'vue-i18n'; // Import useI18n

const { t } = useI18n(); // Destructure t from useI18n
const { message } = useAlarm();

import menu01 from '@/assets/svgs/menu01.svg';
import menu02 from '@/assets/svgs/menu02.svg';
// import menu03 from '@/assets/svgs/menu03.svg';
import menu04 from '@/assets/svgs/menu04.svg';
import menu05 from '@/assets/svgs/menu05.svg';
import menu06 from '@/assets/svgs/menu06.svg';
// import menu07 from '@/assets/svgs/menu07.svg';
import menu08 from '@/assets/svgs/menu08.svg';
import menu01A from '@/assets/svgs/menu01-a.svg';
import menu02A from '@/assets/svgs/menu02-a.svg';
// import menu03A from '@/assets/svgs/menu03-a.svg';
import menu04A from '@/assets/svgs/menu04-a.svg';
import menu05A from '@/assets/svgs/menu05-a.svg';
import menu06A from '@/assets/svgs/menu06-a.svg';
// import menu07A from '@/assets/svgs/menu07-a.svg';
import menu08A from '@/assets/svgs/menu08-a.svg';

const isActive = ref(
	JSON.parse(sessionStorage.getItem('isActive') === undefined ? false : true),
);

const menuList = ref([
	{
		name: 'cctv_management',
		inactive: menu01,
		active: menu01A,
		isHover: false,
	},
	{
		name: 'configure_detection_zone',
		inactive: menu02,
		active: menu02A,
		isHover: false,
	},
	/* 	{
		name: 'API Key 등록',
		inactive: menu03,
		active: menu03A,
		isHover: false,
	}, */
	{
		name: '문자 알림 관리',
		inactive: menu04,
		active: menu04A,
		isHover: false,
	},
	{
		name: '계정 관리',
		inactive: menu05,
		active: menu05A,
		isHover: false,
	},
	{
		name: '필터 목록 관리',
		inactive: menu06,
		active: menu06A,
		isHover: false,
	},
	/* {
		name: '서버 관리',
		inactive: menu07,
		active: menu07A,
		isHover: false,
	}, */
	{
		name: 'logout',
		inactive: menu08,
		active: menu08A,
		isHover: false,
	},
]);

const router = useRouter();
const menu = ref(false);
const modal = defineModel('modal');
const passwordModal = defineModel('passwordModal');

const systemModal = defineModel('systemModal');
const isLoading = ref(false);
const menuHandle = async menuName => {
	const menuMap = {
		cctv_management: '/dashboard/camera',
		configure_detection_zone: '/dashboard/detection-area',
		'문자 알림 관리': '/dashboard/sms',
		'계정 관리': '/dashboard/setting',
		'필터 목록 관리': '/dashboard/filter',
	};
	console.log(menuName);
	if (menuName === 'logout') {
		modal.value = true;
	} else if (
		menuName === 'configure_detection_zone' ||
		menuName === 'cctv_management' ||
		menuName === '문자 알림 관리' ||
		menuName === '필터 목록 관리' ||
		menuName === '계정 관리'
	) {
		try {
			isLoading.value = true;
			// Add await to ensure proper loading state
			await router.push(menuMap[menuName]);
		} catch (error) {
			console.error('Navigation error:', error);
			message.error(t('page_loading_error'));
		} finally {
			isLoading.value = false;
		}
	} else {
		systemModal.value = true;
	}
};
const logout = () => {
	SOCKET.emit('logout');
	router.push('/login');
};
</script>
<style>
/* tooltip customized for firewatcher */
.el-popper.is-firewatcher {
	padding: 6px 12px;
	background: #5e1a227a;
	border: 1px solid #ab3d23;
	color: #fff;
}
.el-popper.is-firewatcher .el-popper__arrow::before {
	display: none;
}
</style>
