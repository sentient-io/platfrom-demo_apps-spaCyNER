let data = {};
let state = {};

/* +---------------------+ */
/* | Toggle Popup Alert  | */
/* +---------------------+ */
togglePopUpAlert = (alertTitle, alertMsg) => {
	$('#alertContent').html(alertMsg);
	$('#alertTitle').html(alertTitle);
	$('#alert').modal('toggle');
};

/* +------------------------------------------+ */
/* | Toggle Wikipedia Retrieval Result Pupup  | */
/* +------------------------------------------+ */
toggleWikiResultPopup = (e) => {
	console.log(e);
	let id = e.id;
	let div = document.createElement('DIV');
	let title = e.title;
	let content = e.content;

	$(div).html(`
	<div class="modal fade" id="${id}" tabindex="-1" area-hidden="true">
    <div class="modal-dialog d-flex" style="height:100vh">
        <div class="modal-content m-auto p-2">
            <div class="modal-header d-flex justify-content-center">
                <h5 class="modal-title" id="${id}Title">${title}</h5>
            </div>
            <div class="modal-body p-3">
                <div id="${id}Content">
					${content}
                </div>
            </div>
            <div class="modal-footer d-flex justify-content-center">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
            </div>
        </div>
    </div>
    `);
	$('#resultPopup').append(div);
	$(`#${id}`).modal('toggle');
};

updateWikiResultPopup = (e) => {
	let id = e.id;
	let title = e.title;
	let content = e.content;
	$(`#${id}Title`).html(title);
	$(`#${id}Content`).html(content);
};

// +--------------------+ //
// | Text area handeler | //
// +--------------------+ //
handelText = (textAreaId) => {
	let text = $(`#${textAreaId}`).val();
	// Calling spaCyNER API
	spaCyNER(text)
		.then((resolve) => {
			// Show result container
			$('#resultContainer').show();
			// Show result container at the side
			$('#functionsContianer').attr('class', 'col-12 col-lg-6');
			// Vertically expand text area
			$('#textArea').attr('rows', 20);
			$('#handelTextBtn, #handelRestartBtn').toggle();
			console.log(resolve);
		})
		.catch((reject) => {
			// Handle spaCyNER error
			console.log('Error');
			togglePopUpAlert(
				`Error: ${reject.status}`,
				reject.responseText
					? JSON.parse(reject.responseText).message
					: reject.customErrMsg
			);
		});
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
			/[\'\"\`\~\/\>\<\.\,\?\#\$\%\^\&\*\{\}\[\]\:\(\)\s]/g,
			''
		)}-${keyword.replace(
			/[\'\"\`\~\/\>\<\.\,\?\#\$\%\^\&\*\{\}\[\]\:\(\)\s]/g,
			''
		)}-${item}`;

		$(wikiLink).html(keyword);

		$(wikiLink).attr('onmouseover', `wikiRetrieveKeyword(this)`);
		$(wikiLink).attr('onmouseout', `stopWikiRetrieveKeyword()`);

		// Create bootstrap tool tip
		$(wikiLink).attr('data-toggle', 'tooltip');
		// Enable html tool tip
		$(wikiLink).attr('data-html', 'true');
		$(wikiLink).attr(
			'title',
			`
		<div id="wikiLinkToolTip">
		<div class="spinner-border spinner-border-sm" role="status">
		<span class="sr-only">Loading...</span>
		</div>
		<span class="pl-2">Retriving data from wikipedia ...</span>
		</div>`
		);
		$(wikiLink).css('text-decoration', 'none !important');
		$(wikiLink).attr('id', `${cardLinkId}`);
		$(cardLinkContainer).append(wikiLink);
	}
	$('[data-toggle="tooltip"]').tooltip({
		animated: 'fade',
		placement: 'top',
		html: true,
	});
};

// +----------------------------------+ //
// |  Retrive Keyword from wikipedia  | //
// +----------------------------------+ //
var wikiRetrieveTimer;
wikiRetrieveKeyword = (e) => {
	// Get text content of clicked link
	wikiRetrieveTimer = setTimeout(function () {
		//
		let keyword = e.innerHTML;
		// let id = keyword.replace(
		// 	/[\'\"\`\~\/\>\<\.\,\?\#\$\%\^\&\*\{\}\[\]\:\(\)\s]/g,
		// 	'_'
		// );
		let id = e.id;
		console.log(id);
		// toggleWikiResultPopup({ id: id });
		wikipediaRetrieval(keyword)
			.then((res) => {
				console.log(res);
				let response = JSON.parse(res);
				if (
					response.message ===
					'Disambigutous keyword.Please choose from the below list and try again'
				) {
					// If there are multiple results
					let fullContent = '';
					response.results.forEach((keyword) => {
						fullContent += `<p class="text-underline cursor-pointer" onclick="wikiRetrieveKeyword(this)">${keyword}</p>`;
					});
					let content =
						'Disambigutous keyword. Please click for the full list ';

					// $(`#${id}`).attr('title', content);
					// updateWikiResultPopup({
					// 	id: id,
					// 	title: response.message,
					// 	content: content,
					// });

					$(`#${id}`).tooltip('dispose');
					$(`#${id}`).attr('title', content);
					$(`#${id}`).tooltip('show');

					$(`#${id}`).removeAttr('onmouseover');
					$(`#${id}`).removeAttr('onmouseout');

					let wikiResultPopupContent = {
						id: id + 'Result',
						title: 'Wikipedia Retrieval Result',
						content: fullContent,
					};
					$(`#${id}`).attr(
						'onclick',
						`toggleWikiResultPopup(${JSON.stringify(wikiResultPopupContent)})`
					);
				} else {
					// Display single result
					let thumbnail = '';
					if (response.results.thumbnail) {
						thumbnail = `
							<img width="160" class="border" src="${response.results.thumbnail.source}" />
							`;
					}

					let content = `${response.results.summary.slice(
						0,
						150
					)}... <p style='color:#c0ff00'><i>Click For Detail</i></p>`;

					let fullContent = `
					<div class="d-flex flex-row justify-content-between">

					<div class="col-6 p-0 m-0">
					<h5>${keyword}</h5>
					<b>Page ID: </b>
					<p>${response.results.pageid}</p>
					<b class="mt-1">Wikipedia Page URL:</b>
					<a class="s-link mr-2" href="${response.results.url}" target="_blank">
					${response.results.url}
					</a>
					</div>

					<div class="col-6 p-0 m-0 text-right">
					${thumbnail}
					</div>
					</div>
					
					<br />
					<br />

					<b>Summary:</b>
					<br />
					<p>${response.results.summary.slice(0, 150)}...</p>
					<br/>

					<button onclick="$(#${id}).tooltip('hide')">Close</button>
		
					`;
					// updateWikiResultPopup({
					// 	id: id,
					// 	title: 'Wikipedia Retrieval Result',
					// 	content: content,
					// });

					$(`#${id}`).tooltip('dispose');
					$(`#${id}`).attr('title', fullContent);
					$(`#${id}`).tooltip('show');

					$(`#${id}`).removeAttr('onmouseover');
					$(`#${id}`).removeAttr('onmouseout');

					let wikiResultPopupContent = {
						id: id + 'Result',
						title: 'Wikipedia Retrieval Result',
						content: fullContent,
					};
					// Toggle popup window function
					// $(`#${id}`).attr(
					// 	'onclick',
					// 	`toggleWikiResultPopup(${JSON.stringify(wikiResultPopupContent)})`
					// );
				}
			})
			.catch((err) => {
				console.log(err);
				// updateWikiResultPopup({
				// 	id: id,
				// 	title: 'Oops!',
				// 	content: JSON.parse(err).message,
				// });
			});
		// Time out count down
		// console.log(e);
	}, 50);
};

stopWikiRetrieveKeyword = function () {
	clearTimeout(wikiRetrieveTimer);
	console.log('time out cleared');
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

/* +-------------------+ */
/* | Handle Text Input | */
/* +-------------------+ */
checkContent = (e) => {
	if (e.target.value == '') {
		$('#handelTextBtn').attr('disabled', '');
	} else {
		$('#handelTextBtn').removeAttr('disabled');
	}
};
document.getElementById('textArea').addEventListener('input', checkContent);
