let data = {
	retrievedID: [],
};
let state = {};

/* +---------------------+ */
/* | Toggle Popup Alert  | */
/* +---------------------+ */
togglePopUpAlert = (alertTitle, alertMsg) => {
	$('#alertContent').html(alertMsg);
	$('#alertTitle').html(alertTitle);
	$('#alert').modal('toggle');
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
			//console.log(resolve);
		})
		.catch((reject) => {
			// Handle spaCyNER error
			//console.log('Error');
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

	let links = '';

	for (item in params.details) {
		let keyword = $.trim(params.details[item]);
		let cardLinkId = `${params.category.replace(
			/[\'\"\`\~\/\>\<\.\,\?\#\$\%\^\&\*\{\}\[\]\:\(\)\s]/g,
			''
		)}-${keyword.replace(
			/[\'\"\`\~\/\>\<\.\,\?\#\$\%\^\&\*\{\}\[\]\:\(\)\s]/g,
			''
		)}-${item}`;

		// Creating individual link item, with hover tool tip
		let wikiLink = `
		<a id="${cardLinkId}" 
		class="card-link icon-link" 
		style="background-color:hsla(${color} .2)"
        >
        ${keyword}
        </a>
        `;
		links += wikiLink;
	}

	let card = `
    <div class="card" style="background-color:hsla(${color} .1)">
        <div class="card-body p-0">

            <div class="card-title-container" 
            style="background-color: hsla(${color} .4); color:#424242 ">
                <span class="mr-2 fas ${icon}">                 
                </span>
                <b clas="m-0 card-title text-center">
                ${params.category}
                </b>
            </div>

            <div class="card-link-container">
                ${links}
            </div>
        </div>
    </div>
    `;

	$('#result').append(card);

	for (item in params.details) {
		let keyword = $.trim(params.details[item]);
		let cardLinkId = `${params.category.replace(
			/[\'\"\`\~\/\>\<\.\,\?\#\$\%\^\&\*\{\}\[\]\:\(\)\s]/g,
			''
		)}-${keyword.replace(
			/[\'\"\`\~\/\>\<\.\,\?\#\$\%\^\&\*\{\}\[\]\:\(\)\s]/g,
			''
		)}-${item}`;

		// Create tool tip
		tippy(`#${cardLinkId}`, {
			content: `
			    <div class='spinner-border spinner-border-sm' role='status'></div>
				<span class='pl-2'>Retrieving data from wikipedia ...</span>`,
			allowHTML: true,
			maxWidth: 500,
			delay: 350,
			// On tool tip triggered
			onShow(instance, partialProps) {
				// If the cardLinkId haven't been retrived
				if (!data.retrievedID.includes(cardLinkId)) {
					// Store retrieved ID, avoid duplicated API call
					data.retrievedID.push(cardLinkId);

					let cardElement = document.getElementById(cardLinkId);
					//console.log(cardElement);
					retrieveKeyword(cardElement).then((content) => {
						instance.setContent(content);
						instance.setProps({
							delay: 200,
							interactive: true,
						});
					}).catch(error =>{
						instance.setContent(error);
						instance.setProps({
							delay: 200,
						});
					});
				}
			},
		});
	}
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
