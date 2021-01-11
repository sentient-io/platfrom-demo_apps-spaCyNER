wikipediaRetrieval = (keyword) => {
	return new Promise((resolve, reject) => {
		console.log('Calling Wikipedia Retrieval');
		const data = JSON.stringify({
			keyword: keyword,
		});

		const xhr = new XMLHttpRequest();

		xhr.addEventListener('readystatechange', function () {
			if (this.readyState === this.DONE) {
				if (JSON.parse(this.response).results) {
					console.log('Wiki Retrieval Success');
					resolve(this.response);
				} else {
					reject(this.response);
				}
			}
		});

		xhr.open(
			'POST',
			'https://dev-apis.sentient.io/microservices/utility/wikipedia/v1/getresults'
		);
		xhr.setRequestHeader('content-type', 'application/json');
		xhr.setRequestHeader('x-api-key', apikey);

		xhr.send(data);
	});
};
