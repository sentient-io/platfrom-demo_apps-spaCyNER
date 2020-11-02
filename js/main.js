// +--------------------+ //
// | Text area handeler | //
// +--------------------+ //
handelText = (textAreaId) => {
	let text = $(`#${textAreaId}`).val();
	$('#handelTextBtn, #handelRestartBtn').toggle();
	// Calling spaCyNER API
	spaCyNER(text);
};

clearText = (textAreaId) => {
	$(`#${textAreaId}`).val('');
	$('#word-counter').text('0/5000');
};

handelRestart = () => {
	clearText('textArea');
	// Clean rendered CardLinks
	$('#result').empty();
	$('#resultContainer').hide();
	$('#handelTextBtn, #handelRestartBtn').toggle();
	// Reset textarea to fill width
	$('#functionsContianer').attr('class', 'col-12');
	// Reset textarea heighgt
	$('#textArea').attr('rows', 15);
};

// Utility Function, create dom object
createDomElement = (params) => {
	let element = document.createElement(params[0]);
	element.setAttribute('class', params[1]);
	element.setAttribute('style', params[2]);
	return element;
};
// Takes an array of dom element
// Will append element in array order
domAppendHelper = (array) => {
	if (array.length >= 2) {
		for (i = 0; i < array.length - 1; i++) {
			$(array[i]).append(array[i + 1]);
		}
	}
};

// +----------------------------+ //
// |  Render Marsonry CardTags  | //
// +----------------------------+ //

// Example of params input
// Need to return spaCy ner to the format below
let params = {
	// string contains RGB value, to be generated
	icon: 'fa-camera',
	category: 'Some Category',
	details: ['Phase 2', 'Some other category'],
};

// Returns a complete card html component
renderCardTags = (params) => {
	let icon = params.icon;
	let color = randomColor(0, 35, 50, 36, 1, 1, 10);
	let card = createDomElement([
		'div',
		'card',
		`background-color: hsla(${color} .1)`,
	]);
	let cardBody = createDomElement(['div', 'card-body p-0', '']);
	let cardTitleContainer = createDomElement([
		'div',
		'card-title-container',
		`background-color: hsla(${color} .4); color:#424242 `,
	]);
	let titleIcon = createDomElement(['span', `mr-2 fas ${icon}`, '']);
	let title = createDomElement(['b', 'm-0 card-title text-center', '']);
	let cardLinkContainer = createDomElement(['div', 'card-link-container', '']);
	$(title).html(`${params.category}`);

	$(cardTitleContainer).append(titleIcon, title);
	$(cardBody).append(cardTitleContainer, cardLinkContainer);
	domAppendHelper(['#result', card, cardBody]);

	for (item in params.details) {
		let keyword = $.trim(params.details[item]);

		// Creating individual link item, with hover tool tip
		let wikiLink = createDomElement([
			'a',
			'card-link icon-link',
			`background-color: hsla(${color} .2)`,
		]);
		let cardLinkId = `${params.category.replace(
			/[\(\)\s\'\/]/g,
			''
		)}-${keyword.replace(/[\(\)\s\'\/]/g, '')}-${item}`;

		$(wikiLink).html(keyword);

		//Hover to fetch data from wikipedia
		$(wikiLink).attr(
			'onmouseenter',
			`delayWikiRetrieval("${keyword}", "${cardLinkId}")`
		);

		$(wikiLink).attr('onmouseout', `cancelWikiRetrival()`);

		// Create bootstrap tool tip
		$(wikiLink).attr('data-toggle', 'tooltip');
		$(wikiLink).attr('data-html', 'true');
		$(wikiLink).css('text-decoration', 'none !important');
		//$(wikiLink).attr('href', '#');
		$(wikiLink).attr(
			'title',
			'<img class="mr-1" src="img/loading.gif" width="16px" height="16px" /> Loading data from wikipedia ... '
		);
		$(wikiLink).attr('id', `${cardLinkId}`);
		$(cardLinkContainer).append(wikiLink);
	}
	// Call the function below everytime when there is a DOM change to display the Bootstrap tool tip
	$('[data-toggle="tooltip"]').tooltip();
};

// +--------------------------+ //
// |  Random Color Generator  | //
// +--------------------------+ //
randomColor = (hue, saturate, light, randH, randS, randL, randScale) => {
	// Parametet takes a base H S L value,
	// The random value will be 0 to input value added to base vale
	// RandScalue is for Hue value only, make sure 2 colors are different enough
	let h = hue + Math.floor(Math.random() * randH) * randScale;
	let s = saturate + Math.floor(Math.random() * randS);
	let l = light + Math.floor(Math.random() * randL);
	return `${h}, ${s}%, ${l}%,`;
};

// +----------+ //
// |  Loader  | //
// +----------+ //
let loadingMsg = [
	'Just a moment more, processing your file...',
	'You can buy and sell data securely on Sentient.io’s blockchain network.',
	'Use utility microservices to save time during your app development.',
	'Have a microservice you\'re looking for but can\'t find? Write in to us <a style="text-decoration:underline"  href = "mailto: enquiry@sentient.io">enquiry@sentient.io</a>',
	"Need help with implementing the APIs? Click the 'Help' button at the bottom of the screen to reach out to our support team.",
	'The APIs on our platform are curated carefully to ensure reliability for deployment',
	'Usage discounts are automatically applied as the number of API calls made reaches the next tier',
	'Just a moment more, processing your file...',
];
let loading;
loadingStart = () => {
	$('#loader').toggle();

	let msgIndex = 0;
	loading = window.setInterval(() => {
		$('#loader-text').html(loadingMsg[msgIndex]);
		if (msgIndex < loadingMsg.length) {
			msgIndex += 1;
		} else {
			msgIndex = 1;
		}
	}, 4000);
};
loadingEnd = () => {
	$('#loader').toggle();
	window.clearInterval(loading);
};

$('#textArea').keyup(function () {
	$('#word-counter').text($.trim(this.value.length) + '/5000');
});

// +---------+ //
// |  Alert  | //
// +---------+ //
toggleAlert = (data) => {
	console.log('Alert toggled')
	let id = data.id;
	let message = data.message;
	let color = data.color;

	let alertContainer = document.createElement('div');
	alertContainer.setAttribute('id', `${id}-alert`);
	alertContainer.setAttribute('class', 'dmo-alert-container');
	let alertContent = document.createElement('div');
	alertContent.setAttribute('class', 'dmo-alert-content');
	let alertText = document.createElement('span');
	alertText.setAttribute('style', `color:${color}`);
	alertText.innerHTML = message;

	domAppendHelper(["#dmo-alert", alertContainer, alertContent, alertText])
	//$('#dmo-alert').append(alertContainer)

	setTimeout(() => {
		console.log('Removing Alert')
		$(`${id}-alert`).remove();
	}, 5000);
};
