<template>
	<div>
		<img
			src="assets/svgs/logo.svg"
			class="mr-5 cursor-pointer"
			@click="router.push('/dashboard')"
		/>
		<el-divider content-position="left">API Key 등록</el-divider>

		<div class="flex justify-between mb-5">
			<div class="flex items-center">
				<el-icon color="#cd4c54" class="mr-1.5"><WarningFilled /></el-icon>
				<span>API 미등록 시, 시스템 상 오류가 발생할 수 있습니다.</span>
			</div>
		</div>

		<el-row :gutter="20" class="h-[calc(100%-129px)]">
			<el-col :span="8">
				<div class="card h-full">
					<div class="h-full flex">
						<el-form :model="form">
							<el-form-item label="기상청 중심 지역 설정">
								<el-select
									v-model="form.l1"
									placeholder=""
									style="width: 150px"
								>
									<el-option />
								</el-select>
								<el-select
									class="ml-2"
									v-model="form.l2"
									placeholder="시/군/구 선택"
									style="width: 150px"
								>
									<el-option />
								</el-select>
								<el-select
									class="ml-2"
									v-model="form.l3"
									placeholder="읍/면/동 선택"
									style="width: 150px"
								>
									<el-option />
								</el-select>
							</el-form-item>
						</el-form>
					</div>
				</div>
			</el-col>
			<el-col :span="8">
				<div class="card h-full">
					<div class="h-full flex justify-center items-center">
						기상청 API 등록 내용
					</div>
				</div>
			</el-col>
			<el-col :span="8">
				<div class="card h-full">
					<div class="h-full flex justify-center items-center">
						네이버 API 등록 내용
					</div>
				</div>
			</el-col>
		</el-row>
	</div>
</template>
<script setup>
import { WarningFilled, Download } from '@element-plus/icons-vue';

const router = useRouter();

const form = reactive({
	l1: '',
	l2: '',
});

function generateRandomString() {
	const characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < 6; i++) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		result += characters[randomIndex];
	}
	return result;
}

console.log(generateRandomString());
</script>
