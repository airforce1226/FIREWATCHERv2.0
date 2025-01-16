export const CUSTOMIZED_TOOLTIP = context => {
	let tooltipEl = document.getElementById('chartjs-tooltip');
	if (!tooltipEl) {
		tooltipEl = document.createElement('div');
		tooltipEl.id = 'chartjs-tooltip';
		document.body.appendChild(tooltipEl);
	}

	const { opacity } = context.tooltip;
	if (opacity === 0) {
		tooltipEl.style.opacity = 0;
		return;
	}

	tooltipEl.style.position = 'absolute';
	tooltipEl.style.left =
		context.chart.canvas.offsetLeft + context.tooltip.caretX + 'px';
	const rect = context.chart.canvas.getBoundingClientRect();
	tooltipEl.style.top =
		rect.top + window.scrollY + context.tooltip.caretY + 'px';
	tooltipEl.style.left =
		rect.left + window.scrollX + context.tooltip.caretX + 'px';
	tooltipEl.style.fontSize = context.tooltip.options.bodyFont.size + 'px';
	tooltipEl.style.padding = context.tooltip.options.padding + 'px';
	tooltipEl.style.pointerEvents = 'none';

	tooltipEl.style.background = '#5E1A22E2';
	tooltipEl.style.border = '1.5px solid #AB3D23';
	tooltipEl.style.borderRadius = '3px';
	tooltipEl.style.transition = 'all .2s ease';

	if (context.tooltip.body) {
		const titleLines = [];
		const bodyLines = context.tooltip.body.map(b => b.lines);

		let innerHtml = '<thead>';

		titleLines.forEach(function (title) {
			innerHtml += '<tr><th>' + title + '</th></tr>';
		});
		innerHtml += '</thead><tbody>';

		bodyLines.forEach(function (body, i) {
			const colors = context.tooltip.labelColors[i];
			let style = 'background:' + colors.backgroundColor;
			style += '; border-color:' + colors.backgroundColor;
			style += '; border-width: 2px';
			style += '; width: 5px';
			style += '; height: 5px'; // 높이 설정
			style += '; border-radius: 50%';
			style += '; display: inline-block';
			style += '; margin-right: 8px';
			const span = '<span style="' + style + '"></span>';
			innerHtml +=
				'<tr><td>' +
				span +
				'<span style="font-family: Pretendard Variable;">' +
				body +
				'</td></tr>';
		});
		innerHtml += '</tbody>';

		let tableRoot = tooltipEl.querySelector('table');
		if (!tableRoot) {
			tableRoot = document.createElement('table');
			tooltipEl.appendChild(tableRoot);
		}
		tableRoot.innerHTML = innerHtml;
	}

	tooltipEl.style.opacity = 1;
};
