export const useSound = () => {
	const playPopupSound = () => {
		const audio = new Audio('/popup1.flac');
		audio.volume = 0.6;
		audio.play();
	};

	return { playPopupSound };
};
