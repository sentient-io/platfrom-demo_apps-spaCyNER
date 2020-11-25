identifyObjects = (objects) => {
	for (objectTitle in objects) {
		let title = document.createElement('h5');
		title.innerHTML = objectTitle;

		let objectsContainer = document.createElement('div');
        let itemsContainer = document.createElement('div');
        
        let items = objects[objectTitle]
		for ( item in items ) {
            let itemLink = document.createElement('a')
            itemLink.setAttribute("class","m-3")
            itemLink.setAttribute("onclick","retriveWikipedia(\"" + items[item] + "\")")
            itemLink.innerHTML = items[item] 

            itemsContainer.appendChild(itemLink)
        }

        objectsContainer.appendChild(title)
        objectsContainer.appendChild(itemsContainer)
		$('#analyseResults').append(objectsContainer);
	}
};
