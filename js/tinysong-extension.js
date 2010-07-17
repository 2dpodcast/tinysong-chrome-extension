$(document).ready(function() {
	container = $('#tinysong');

	inputField = $('#query');
	inputField.focus();
});

// Tinysong API URL
var tinysongUrl = 'http://tinysong.com/s/%s?format=json&limit=5';

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
				'<a href="' + result.Url + '" class="play" onclick="javascript:openSong(\'' + result.Url + '\');">Play</a>' +
				result.SongName + ' - ' + result.ArtistName + '<br>' +
				'<em>' + result.Url + '</em>' +
				'</li>';
	}

	container.html(resultHTML + '</ul>');
}

function getGsUrl(tinysongUrl) {
	var tinysongToken = tinysongUrl.split("/")[3];
	var gsUrl = '';

	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'http://gsuser.com/getSongTokenFromBase62/' + tinysongToken, false);
	xhr.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			gsUrl = 'gs://s/~/' + xhr.responseText;
		}
	};
	xhr.send();

	return gsUrl;
}

// Open |url| in Grooveshark Desktop or new tab depending on settings.
function openSong(url) {
	if (localStorage.player == 'desktop') {
		openUrl(getGsUrl(url));
	} else if (localStorage.player == 'web') {
 		openUrl(url);
	}
}

// Open |url| in a new tab.
function openUrl(url) {
	// Only allow http, https and gs URLs.
	if (url.indexOf('http:') != 0 && url.indexOf('https:') != 0 && url.indexOf('gs:') != 0) {
		return;
	}

	chrome.tabs.create({ url: url });
}
