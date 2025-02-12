<template>
	<div class="text-[#fff]">
		<el-dialog
			v-model="modal"
			:title="ok === 'logout' ? t('confirm_logout') : '연기 종류 입력'"
			width="500"
			align-center
		>
			<el-input v-if="ok !== 'logout'" v-model="smokeType"></el-input>
			<template #footer>
				<div class="dialog-footer">
					<el-button v-if="cancel" @click="modal = false">{{
						cancel
					}}</el-button>
					<el-button v-if="ok" type="primary" @click="confirmAction">
						{{ ok }}
					</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>
<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const modal = defineModel();
const emit = defineEmits(['confirm']);
const props = defineProps(['content', 'ok', 'cancel']);

const smokeType = ref('');

const confirmAction = () => {
	emit('confirm', smokeType.value);
	modal.value = false;
};
</script>
