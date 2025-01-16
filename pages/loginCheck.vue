<template></template>
<script setup>
const router = useRouter();

onMounted(() => {
	eventLogin();
});
const eventLogin = () => {
	const cityMapObject = {
		인제군: 'inje',
		양구군: 'yanggu',
		삼척시: 'samcheok',
		동해시: 'donghae',
		강릉시: 'gangneung',
		춘천시: 'chuncheon',
		횡성군: 'hoengseong',
		영월군: 'yeongwol',
		홍천군: 'hongcheon',
		정선군: 'jeongseon',
		평창군: 'pyeongchang',
		태백시: 'taebaek',
		속초시: 'sokcho',
		양양군: 'yangyang',
		고성군: 'goseong',
		원주시: 'wonju',
		화천군: 'hwacheon',
		철원군: 'cheorwon',
	};
	$fetch
		.raw(`${BASE_URL}/event/login`, {
			method: 'POST',
			body: {
				ids:
					cityMapObject[
						decodeURIComponent(sessionStorage.getItem('loginCheck'))
					] || null,
			},
		})
		.then(res => {
			if (res.status === 200) {
				// SessionStorage 저장
				sessionStorage.setItem('isActive', res._data.isActive);
				sessionStorage.setItem('smsActive', res._data.smsActive);
				sessionStorage.setItem('ID', res._data.id);
				sessionStorage.setItem('USER', JSON.stringify(res));
				sessionStorage.setItem('login', true);
				if (res._data.address) {
					sessionStorage.setItem('L2Login', JSON.stringify(res._data.address));
				}

				SOCKET.emit('login', res);
				router.push('/dashboard');
			}
		})
		.catch(err => {
			console.log(err);
		});
};
</script>
