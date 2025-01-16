<template>
	<div class="text-[#fff]">
		<el-dialog v-model="modal" title="연기 종류 입력" width="500" align-center>
			<el-input v-model="smokeType"></el-input>
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
const modal = defineModel();
const emit = defineEmits(['confirm']);
const props = defineProps(['content', 'ok', 'cancel']);

const smokeType = ref('');

const confirmAction = () => {
	emit('confirm', smokeType.value);
	modal.value = false;
};
</script>
