export const useSound = () => {
	const playPopupSound = () => {
		const audio = new Audio('/popup1.flac');
		audio.volume = 0.7;
		audio.play();

		setTimeout(() => {
			const audio1 = new Audio('/popup1.flac');
			audio1.volume = 0.7;
			audio1.play();
		}, 1000);

		setTimeout(() => {
			const audio1 = new Audio('/popup1.flac');
			audio1.volume = 0.7;
			audio1.play();
		}, 2000);
	};

	return { playPopupSound };
};
