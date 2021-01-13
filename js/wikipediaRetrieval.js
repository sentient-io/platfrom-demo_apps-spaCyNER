var RETRIEVE_KEYWORD_TIMER;

wikipediaRetrieval = (keyword) => {
	return new Promise((resolve, reject) => {
		//console.log('Calling Wikipedia Retrieval');
		//console.log(keyword.trim());
		const data = JSON.stringify({
			keyword: keyword.trim(),
		});

		const xhr = new XMLHttpRequest();

		xhr.addEventListener('readystatechange', function () {
			if (this.readyState === this.DONE) {
				if (JSON.parse(this.response).results) {
					//console.log('Wiki Retrieval Success');
					//console.log(this.response);
					resolve(this.response);
				} else {
					reject(this.response);
				}
			}
		});

		xhr.open(
			'POST',
			'https://apis.sentient.io/microservices/utility/wikipedia/v1/getresults'
		);
		xhr.setRequestHeader('content-type', 'application/json');
		xhr.setRequestHeader('x-api-key', apikey);

		xhr.send(data);
	});
};

delayRetrieveKeyword = (e) => {
	RETRIEVE_KEYWORD_TIMER = setTimeout(function () {
		//console.log('Retrieve keyword timer - Start');
		//console.log(e.id);
		retrieveKeyword(e);
	}, 350);
};

stopWikiRetrieveKeyword = function () {
	clearTimeout(RETRIEVE_KEYWORD_TIMER);
	//console.log('Retrieve keyword timer - Stopped');
};

retrieveKeyword = (e) => {
	return new Promise((resolve, reject) => {
		//console.log('Retrieve Keyword - Start');
		let keyword = e.innerHTML;
		let id = e.id;
		// Add loading icon
		$(`#${id}`).addClass('icon-loading');

		wikipediaRetrieval(keyword)
			.then((res) => {
				let response = JSON.parse(res);

				$(`#${id}`).removeClass('icon-loading');
				$(`#${id}`).addClass('icon-check');
				//console.log(res);

				let thumbnail = '';
				if (response.results.thumbnail) {
					thumbnail = `
								<img class="m-3 border" width="120" src="${response.results.thumbnail.source}" />
								`;
				}

				let content = '';

				if (
					response.message ===
					'Disambigutous keyword.Please choose from the below list and try again'
				) {
					content = '<p class="pb-1">Disambiguation keyword lists: </p>';
					response.results.forEach((keyword) => {
						content += `<p class="p-0 m-0">- ${keyword}</p>`;
					});
				} else {
					content = `
					<div class="m-3 d-flex flex-row justify-content-between">
		
					<div class="col-6 p-0 m-0 text-left">
					<h5>${keyword}</h5>
					
					<p><b>Page ID: </b> ${response.results.pageid}</p>
					<b class="mt-1">Wikipedia Page URL:</b>
					<a class="s-link mr-2" href="${response.results.url}" target="_blank">
					${response.results.url}
					</a>
					</div>
					<br/>
					<div class="col-6 p-0 m-0 text-right">
					${thumbnail}
					</div>
					</div>
		
					<div class="col-12 p-3 text-left">
					<b>Summary:</b>
					<p>${response.results.summary}</p>
					</div>
					`;
				}
				resolve(content);
			})
			.catch((err) => {
				//console.log(err);

				$(`#${id}`).removeClass('icon-loading');
				$(`#${id}`).addClass('icon-no-result');

				reject(JSON.parse(err).message);
			});
	});
};
