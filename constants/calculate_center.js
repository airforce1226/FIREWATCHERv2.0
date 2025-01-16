export const CALCULATE_CENTER = list => {
	let longitude = 0,
		latitude = 0;

	list.forEach(ele => {
		longitude += ele[0];
		latitude += ele[1];
	});

	return [longitude / list.length, latitude / list.length];
};
