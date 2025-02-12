export default defineNuxtRouteMiddleware((to, from) => {
	const { message } = useAlarm();

	// 루트 경로면 로그인 페이지로 리다이렉트
	if (to.path === '/') {
		return navigateTo('/login');
	}

	// loginCheck 경로면 추가 처리 없이 종료
	if (to.path.includes('/loginCheck/')) {
		sessionStorage.setItem('loginCheck', to.query.id);
		if (sessionStorage.getItem('loginCheck')) {
			return navigateTo('/loginCheck');
		}
	}

	if (to.path.includes('/loginCheck')) {
		return;
	}

	// 로그인 페이지가 아닌 다른 페이지의 경우
	if (to.path !== '/login') {
		// 로그인 상태 확인
		if (!JSON.parse(sessionStorage.getItem('login'))) {
			return navigateTo('/login');
		} else {
			if (sessionStorage.getItem('ID') !== 'master') {
				if (to.name !== 'dashboard') {
					message.warning('접근 권한이 없습니다.');
					return navigateTo('/dashboard');
				}
			}
		}
	}
});
