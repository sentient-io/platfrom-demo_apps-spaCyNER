spaCyNER = (text) => {
	console.log('Calling Spacy NER API');
	return new Promise((resolve, reject) => {
		loadingStart();
		$.ajax({
			method: 'post',
			url:
				'https://apis.sentient.io/microservices/nlp/spacyner/v1/getpredictions',
			headers: {
				'x-api-key': apikey,
				'Content-Type': 'application/json',
			},
			data: JSON.stringify({ text: text }),
			success: (response) => {
				let results = response.results;
				loadingEnd();
				console.log('Success');
				if (Object.keys(results)[0]) {
					for (items in Object.keys(results)) {
						renderCardTags({
							icon: nerMappingFaIcons(Object.keys(results)[items]),
							category: nerMappingCategory(Object.keys(results)[items]),
							details: Object.values(results)[items],
						});
					}
					resolve(results);
				} else {
					reject({
						status: 'No Valid detection',
						customErrMsg:
							'Pleast input longer text with valid English named entities',
					});
				}
			},
			error: (err) => {
				console.log(`Error: ${err.status}`);
				loadingEnd();
				reject(err);
			},
		});
	});
};

nerMappingCategory = (keyword) => {
	let result;
	let library = {
		person: 'Person',
		norp: 'Nationalities/ Religious/ Political Groups',
		fac: 'Buildings and Facilities',
		org: 'Organisations',
		gpe: 'Countries/ Cities/ States',
		loc: 'Locations',
		product: 'Objects',
		event: 'Events',
		work_of_art: 'Works Of Art',
		law: 'Named Documents Made Into Laws',
		language: 'Language',
		date: 'Date',
		time: 'Time',
		percent: 'Percentage',
		money: 'Monetary Values',
		quantity: 'Measurements',
		ordinal: 'Ordinal',
		cardinal: 'Numbers',
	};
	result = library[keyword] != undefined ? library[keyword] : keyword;
	return result;
};

nerMappingFaIcons = (keyword) => {
	let result;
	let library = {
		person: 'fa-users',
		norp: 'fa-globe',
		fac: 'fa-hotel',
		org: 'fa-university',
		gpe: 'fa-flag',
		loc: 'fa-map-marked',
		product: 'fa-cubes',
		event: 'fa-calendar-week',
		work_of_art: 'fa-book',
		law: 'fa-gavel',
		language: 'fa-language',
		date: 'fa-calendar-day',
		time: 'fa-stopwatch',
		percent: 'fa-percent',
		money: 'fa-money-bill-wave',
		quantity: 'fa-ruler',
		ordinal: 'fa-tag',
		cardinal: 'fa-tags',
	};
	result = library[keyword] != undefined ? library[keyword] : keyword;
	return result;
};
