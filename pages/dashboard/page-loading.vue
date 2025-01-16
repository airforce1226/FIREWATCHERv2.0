<template>
	<div>
		<Loading />
	</div>
</template>
<script setup>
let fetchStatus = null;
const statusCheck = async () => {
	if (!fetchStatus) {
		fetchStatus = () => {
			$fetch(`${BASE_URL}/system/initstatus`, {
				method: 'GET',
			})
				.then(res => {
					console.log(res);
					if (!res) {
						setTimeout(() => {
							fetchStatus();
						}, 2000);
					} else {
						location.replace('/dashboard');
					}
				})
				.catch(err => {
					console.log(err);
					setTimeout(() => {
						fetchStatus();
					}, 2000);
				});
		};

		fetchStatus();
	}
};

SOCKET.on('connect', () => {
	statusCheck();
});

onMounted(() => {
	statusCheck();
});
</script>
