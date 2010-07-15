$(document).ready(function() {
	container = $('#tinysong');

	inputField = $('#query');
	inputField.focus();
});

// Tinysong API URL
var tinysongUrl = 'http://tinysong.com/s/%s?format=json';

// contains results/errors
var container;

// query input field
var inputField;

// the XMLHttpRequest object
var req;

function findSongs() {
	var query = inputField.val().split(' ').join('+');

	req = new XMLHttpRequest();
	req.onload = handleResponse;
	req.onerror = handleError;
	req.open('GET', tinysongUrl.replace('%s', query), true);
	req.send(null);

	// give focus to search field
	inputField.focus();
	inputField.select();
}

// Handles parsing errors.
function handleParsingError(error) {
	container.html('<p class="error">' + error + '</p>');
}

// Handles errors during the XMLHttpRequest.
function handleError() {
	handleParsingError('Failed to fetch URLs.');
}

// Handles parsing the data we got back from XMLHttpRequest.
function handleResponse() {
	var response = JSON.parse(req.responseText);

	if (!response.length) {
		handleParsingError(
			'<strong>We didn\'t find any songs!</strong> Try searching another?');
		return;
	}

	buildResult(response);
}

function buildResult(response) {
	var resultHTML = '<ul>';

	for (i in response) {
		var result = response[i];

		// available attributes:
		//   Url, SongID, SongName, ArtistID, ArtistName, AlbumID, AlbumName

		resultHTML += '<li>' +
				'<a href="' +
				result.Url +
				'" onclick="openUrl(\'' +
				result.Url +
				'\');">' +
				result.SongName +
				'</a> ' +
				'by <strong>' +
				result.ArtistName +
				'</strong><br>' +
				'<em>' +
				result.Url +
				'</em>' +
				'</li>';
	}

	container.html(resultHTML + '</ul>');
}

// Open |url| in a new tab.
function openUrl(url) {
	// Only allow http and https URLs.
	if (url.indexOf("http:") != 0 && url.indexOf("https:") != 0) {
		return;
	}

	chrome.tabs.create({url: url});
}
