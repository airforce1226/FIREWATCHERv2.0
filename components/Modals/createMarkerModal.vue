<template>
	<div class="text-[#fff]"></div>
</template>
<script setup>
const checkDuplicateRoiNameModal = defineModel();
const emit = defineEmits(['addPolygon', 'checkDuplicateRoiName']);
const props = defineProps(['content', 'ok', 'cancel']);

const addPolygon = () => {
	emit('addPolygon');
	checkDuplicateRoiNameModal.value = false;
};

const checkDuplicateRoiName = () => {
	emit('checkDuplicateRoiName');
};
</script>
