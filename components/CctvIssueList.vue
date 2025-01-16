<template>
	<div
		v-for="(cctv, index) in ISSUE_CAMERA_LIST"
		:key="index"
		class="bg-[#292A2E] border border-[#2F3134] rounded p-4 text-sm flex justify-between mr-2"
		:class="[
			index ? 'mt-2.5' : '',
			cctv.status ? 'bg-[#2C2023A6] border-[#AB3D23]' : '',
		]"
	>
		<div class="flex items-center">
			<img src="@/assets/svgs/cctv-issue.svg" class="mr-2 w-2.5 h-2.5" />
			<span>{{ cctv.cctv_name }}</span>
		</div>
		<div>
			<span :class="cctv.status ? 'text-[#B7B7B7]' : 'text-[#fffff]'">
				{{ cctv.status ? 'Error' : '' }}
			</span>
		</div>
		<div class="flex items-center">
			<div class="mr-2">{{ $dayjs(cctv.time).format('HH:mm:ss') }}</div>
			<img :src="cctv.status ? doneIcon : newIcon" class="mr-2 w-2.5 h-2.5" />
		</div>
	</div>
</template>
<script setup>
import newIcon from '@/assets/svgs/cctv-issue-new.svg';
import doneIcon from '@/assets/svgs/cctv-issue-done.svg';
</script>
<style></style>
