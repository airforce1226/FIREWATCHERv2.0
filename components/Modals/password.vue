<template>
	<div>
		<el-dialog
			v-model="modal"
			title="비밀번호 변경"
			align-center
			:close-on-click-modal="false"
			:close-on-press-escape="false"
			:show-close="false"
			width="500"
		>
			<div class="px-4">
				<div>
					<span class="inline-block mb-1">기존 비밀번호</span>
					<el-input
						v-model="password"
						clearable
						show-password
						type="password"
					/>
				</div>
				<div class="mt-2">
					<div class="flex items-center mb-1">
						<span class="inline-block mr-1">새 비밀번호</span>
						<el-tooltip class="box-item" effect="dark" placement="right">
							<template #content>
								<span class="text-[10px]"
									>영문(대/소문자), 특수문자(!, @, %, #, &, $, ^, +), 숫자 모두
									포함 최소 9자 최대 15자</span
								>
							</template>
							<el-icon><InfoFilled /></el-icon>
						</el-tooltip>
					</div>
					<el-input
						v-model="newPassword"
						clearable
						show-password
						type="password"
					/>
				</div>
				<div class="mt-2">
					<span class="inline-block mb-1">새 비밀번호 확인</span>
					<el-input
						v-model="confirmNewPassword"
						clearable
						show-password
						type="password"
					/>
				</div>
			</div>

			<template #footer>
				<div class="dialog-footer">
					<el-button @click="closeModal">닫기</el-button>
					<el-button
						type="primary"
						@click="changePassword"
						:disabled="!password || !newPassword || !confirmNewPassword"
					>
						변경
					</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>
<script setup>
import { InfoFilled } from '@element-plus/icons-vue';
const { message } = useAlarm();
const modal = defineModel('passwordModal');

const password = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');

const resetInputs = () => {
	password.value = '';
	newPassword.value = '';
	confirmNewPassword.value = '';
};

const closeModal = () => {
	modal.value = false;
	resetInputs();
};

const changePassword = () => {
	message.success('비밀번호가 변경되었습니다.');
	closeModal();
};
</script>
