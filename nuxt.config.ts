export default defineNuxtConfig({
	devtools: { enabled: false },
	ssr: false,
	css: ['~/assets/css/font.css', '~/assets/css/main.css'],
	modules: [
		'@element-plus/nuxt',
		'dayjs-nuxt',
		'@vueuse/nuxt',
		'@vee-validate/nuxt',
	],
	plugins: ['~/plugins/i18n.js'],
	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {},
		},
	},
	imports: {
		dirs: ['./constants'],
	},
	app: {
		head: {
			title: 'fireWatcher',
			meta: [
				{ charset: 'utf-8' },
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			],
			link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' }],
			htmlAttrs: {
				class: 'dark',
			},
			script: [
				// 2D map
				{
					// local
					// src: 'https://map.vworld.kr/js/vworldMapInit.js.do?version=2.0&apiKey=B5D0D988-668C-37F5-BB18-DA025E939976&domain=192.168.14.75:3000',
					// onload : ()=>{
					//   console.log(37)
					// }
					// callback: () => {
					//   console.log(53);
					// },
					// 삼척1
					// src: 'https://map.vworld.kr/js/vworldMapInit.js.do?version=2.0&apiKey=B6DDE050-C513-3541-8E24-567F7CA6C3A2&domain=http://222.113.173.133:20011/',
					// 삼척2
					// src: 'https://map.vworld.kr/js/vworldMapInit.js.do?version=2.0&apiKey=716851A3-93AE-3660-9794-E8B3C19F1AC0&domain=192.168.1.10:10110',
					// 192.168.10.62
					// src: 'https://map.vworld.kr/js/vworldMapInit.js.do?version=2.0&apiKey=E058AB85-8808-3B1F-BA23-8DBDFA9910C0&domain=192.168.10.62:10110',
					// 울진, 함양, 동해, 곡성, 경남도청, 창원, 대구
					// src: '/api/map',
				},
				// 3D map v2
				{
					// local
					src: 'https://map.vworld.kr/js/webglMapInit.js.do?version=2.0&apiKey=92EFD2CF-E856-3F12-A45D-BB0B2C085D22&domain=192.168.3.75:3000',
					// src: '/3Dapi/map',
				},
				// 3D map v3
				{
					// local
					// src: 'https://map.vworld.kr/js/webglMapInit.js.do?version=3.0&apiKey=B5D0D988-668C-37F5-BB18-DA025E939976&domain=192.168.14.75:3000',
				},
				{
					// cesiumjs
					// src: 'https://cesium.com/downloads/cesiumjs/releases/1.82/Build/Cesium/Cesium.js',
				},
			],
		},
	},
});
