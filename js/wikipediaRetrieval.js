var timer;

delayWikiRetrieval = (keywords, cardLinkId) => {
	timer = setTimeout(function () {
		wikipediaRetrieval(keywords, cardLinkId);
	}, 200);
};

cancelWikiRetrival = () => {
	clearTimeout(timer);
};

wikipediaRetrieval = (keywords, cardLinkId) => {
	// Add the loader on card links
	$(`#${cardLinkId}`).addClass('icon-loading');
	const data = JSON.stringify({
		title: keywords,
		pageid: 0,
	});

	const xhr = new XMLHttpRequest();
	// Disable mouse over event
	$(`#${cardLinkId}`).attr('onmouseenter', ``);
	$(`#${cardLinkId}`).attr('onmouseout', ``);

	xhr.addEventListener('readystatechange', function () {
		if (this.readyState === this.DONE) {
			let response = JSON.parse(this.responseText)['results'];
			let summary;
			let link;
			if (Array.isArray(response)) {
				summary = `Multiple results: ${response.toString().substring(0, 120)}`;
				link = '';
				$(`#${cardLinkId}`).removeClass('icon-link');
				$(`#${cardLinkId}`).addClass('icon-check');
				toggleAlert({
					id: cardLinkId,
					message: `"${keywords}" retrived from Wikipedia.`,
					color: 'green',
				});
			} else if (!response) {
				summary = 'No search result';
				link = '';
				$(`#${cardLinkId}`).removeClass('icon-no-result');
				$(`#${cardLinkId}`).addClass('icon-no-result');
				toggleAlert({
					id: cardLinkId,
					message: `"${keywords}" failed retrive from Wikipedia.`,
					color: 'red',
				});
			} else if (response['summary'].length > 120) {
				summary = response['summary'].substring(0, 120);
				link = response['url'];
				$(`#${cardLinkId}`).attr('href', `${link}`);
				$(`#${cardLinkId}`).attr('target', '_blank');
				$(`#${cardLinkId}`).addClass('card-link-underline icon-check');
				toggleAlert({
					id: cardLinkId,
					message: `"${keywords}" retrived from Wikipedia.`,
					color: 'green',
				});
			} else {
				summary = response['summary'];
				link = response['url'];
				$(`#${cardLinkId}`).attr('href', `${link}`);
				$(`#${cardLinkId}`).attr('target', '_blank');
				$(`#${cardLinkId}`).addClass('card-link-underline icon-check');
				toggleAlert({
					id: cardLinkId,
					message: `"${keywords}" retrived from Wikipedia.`,
					color: 'green',
				});
			}
			// Update tool tip text
			$(`#${cardLinkId}`).attr(
				'data-original-title',
				`<p style="text-align:left !important">${summary} ...</p>`
			);
			$(`#${cardLinkId}`).removeClass('icon-loading');
		} else {
		}
	});

	xhr.open(
		'POST',
		'https://apis.sentient.io/microservices/utility/wikipedia/v0.1/getresults'
	);
	xhr.setRequestHeader('content-type', 'application/json');
	xhr.setRequestHeader('x-api-key', apikey);

	xhr.send(data);
};
