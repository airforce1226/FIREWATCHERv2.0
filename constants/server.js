import io from 'socket.io-client';

let SOCKET = io('/front');
let IP = SOCKET.io.engine.hostname;
let PORT = SOCKET.io.engine.port;

let SITE = '강원도청';
// let SITE = '';

// 창원 -> SMSUserModal.vue - 창원시 주석 부분 해제
let FETCH_ID = true;
// let FETCH_ID = false; // 삼척 1번, 대구

// 33.xxx //  url
// 106.xxx // externalURL

// 내부 테스트용
if (IP === '192.168.3.75') {
	// 62
	// IP = '192.168.10.62';
	// PORT = '10110';
	// 충북
	// IP = '121.188.22.195';
	// PORT = '10110';
	// 충남
	// IP = '59.25.32.163';
	// PORT = '10110';
	// 강원도청
	IP = '210.179.205.173';
	PORT = '10110';
	// 삼척 1번
	// IP = '222.113.173.133';
	// PORT = '20011';
	// 삼척 2번
	// IP = '222.113.173.133';
	// PORT = '20021';
	// 울진
	// IP = '203.228.35.50';
	// PORT = '10110';
	// 동해
	// IP = '210.98.147.232';
	// PORT = '10110';
	// 경남
	// IP = '119.199.177.108';
	// PORT = '10110';
	// 대구
	// IP = '180.69.51.118';
	// PORT = '11110';
	// 수원 내부 테스트
	// IP = '192.168.0.10';
	// PORT = '10110';
	// 전남
	// IP = '112.164.122.251';
	// PORT = '10110';
	// 남부지방산림청
	// IP = '59.24.205.123';
	// PORT = '10110'; // port X
}

let BASE_URL = `http://${IP}:${PORT}`;

SOCKET.io.uri = BASE_URL + '/front';

SOCKET.emit('client_refresh', JSON.parse(sessionStorage.getItem('USER')));
SOCKET.on('disconnect', async () => {
	await sessionStorage.clear();
	location.replace('/login');
});

// 추후 변경 예정
export { SOCKET, BASE_URL, IP, SITE, FETCH_ID };
