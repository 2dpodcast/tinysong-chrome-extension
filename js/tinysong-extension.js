// Tinysong API URL
var tinysongUrl = 'http://tinysong.com/s/%s?format=json';

// the XMLHttpRequest object
var req;

function findSongs() {
	var query = '';

	var queryElements = document.getElementById('query').value.split(' ');
	for (element in queryElements) {
		query += queryElements[element] + '+';
	}
	query = query.substring(0, query.length - 1);

	req = new XMLHttpRequest();
	req.onload = handleResponse;
	req.onerror = handleError;
	req.open('GET', tinysongUrl.replace('%s', query), true);
	req.send(null);
}

// Handles parsing errors.
function handleParsingError(error) {
	var container = document.getElementById('tinysong');
	container.className = 'error';
	container.innerHTML = '<p>' + error + '</p>';
}

// Handles errors during the XMLHttpRequest.
function handleError() {
	handleParsingError('Failed to fetch URLs.');
}

// Handles parsing the data we got back from XMLHttpRequest.
function handleResponse() {
	var response = req.responseText;

	// TODO check for empty response in a non-stupid way
	if (response.length == 2) {
		handleParsingError('<strong>We didn\'t find any songs!</strong> Try searching another?');
		return;
	}

	buildResult(response);
}

function buildResult(response) {
	var container = document.getElementById('tinysong');
	container.className = '';
	container.innerHTML = '';

	var results = JSON.parse(response);
	for (i in results) {
		var result = results[i];

		// available attributes:
		//   Url, SongID, SongName, ArtistID, ArtistName, AlbumID, AlbumName

		container.innerHTML += '<p>' +
				'<a href="' + result.Url + '" onclick="javascript:openUrl(\'' + result.Url + '\');">' + result.SongName + '</a>' +
				' by <strong>' + result.ArtistName + '</strong><br>' +
				'<em>' + result.Url + '</em>' +
				'</p>';
	}

	var inputField = document.getElementById('query');
	inputField.focus();
	inputField.select();
}

// Open |url| in a new tab.
function openUrl(url) {
	// Only allow http and https URLs.
	if (url.indexOf("http:") != 0 && url.indexOf("https:") != 0) {
		return;
	}
	chrome.tabs.create({url: url});
}
