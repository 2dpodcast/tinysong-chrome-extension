(function() {
	window.tinysong = {
		api: {
			gsuser: 'http://gsuser.com/getSongTokenFromBase62/%s',
			tinysong: 'http://tinysong.com/s/%s?format=json&limit=5'
		},

		constants: {
			player: {
				desktop: 'desktop',
				web: 'web'
			}
		},

		dom: {
			container: 'section',
			header: {
				logo: 'header > h1 > a'
			},
			search: {
				form: 'header > form',
				input: 'header > form > fieldset > input'
			},
			song: {
				play: 'section > ul > li > a.play'
			}
		},

		state: {
			response: null,
			result: null,
			query: ''
		},

		buildResponse: function() {
			this.state.response = '<ul>';

			if (this.state.result.length != 0) {
				for (i in this.state.result) {
					var result = (this.state.result)[i];

					// available attributes: Url, SongID, SongName, ArtistID, ArtistName, AlbumID, AlbumName

					this.state.response += '<li>' +
							'<a href="' + result.Url + '" class="play">Play</a>' +
							result.SongName + ' - ' + result.ArtistName + '<br>' +
							'<em>' + result.Url + '</em>' +
							'</li>';
				}
				this.state.response += '</ul>';
			} else {
				this.state.response = '<p class="error"><strong>We didn\'t find any songs!</strong> Try searching another?</p>';
			}

			$(this.dom.container).html(this.state.response);

			$(this.dom.search.input).focus();
			$(this.dom.search.input).select();
		},

		getGsUrl: function(tinysongUrl) {
			var tinysongToken = tinysongUrl.split('/')[3];
			var gsUrl = '';

			var xhr = new XMLHttpRequest();
			xhr.open('GET', (this.api.gsuser).replace('%s', tinysongToken), false);
			xhr.onreadystatechange = function() {
				if (this.readyState == 4) {
					if (this.status == 200) {
						gsUrl = 'gs://s/~/' + this.responseText;
					}
				}
			};
			xhr.send(null);

			return gsUrl;
		},

		init: function() {
			$(this.dom.search.input).focus();
			this.initEvents();
		},

		initEvents: function() {
			$(this.dom.search.form).submit(function(e) {
				window.tinysong.state.query = $(window.tinysong.dom.search.input).val().split(' ').join('+');
				window.tinysong.search($(window.tinysong.state.query).val());
				// prevents further propagation of the current event
				e.stopPropagation();
				return false;
			});

			$(this.dom.song.play).live('click', function(e) {
				if (localStorage.player == window.tinysong.constants.player.desktop) {
					window.tinysong.openUrl(window.tinysong.getGsUrl(this.toString()));
				} else if (localStorage.player == window.tinysong.constants.player.web) {
					window.tinysong.openUrl(this.toString());
				}

				return false;
			});

			$(this.dom.header.logo).live('click', function() {
				window.tinysong.openUrl(this.toString());
				return false;
			});
		},

		openUrl: function(url) {
			// only allow http, https and gs URLs.
			if (url.indexOf('http:') != 0 && url.indexOf('https:') != 0 && url.indexOf('gs:') != 0) {
				return;
			}

			// open url in new tab
			chrome.tabs.create({ url: url });
		},

		search: function() {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', (this.api.tinysong).replace('%s', this.state.query), false);
			xhr.onreadystatechange = function() {
				if (this.readyState == 4) {
					if (this.status == 200) {
						window.tinysong.state.result = JSON.parse(this.responseText);
					}
				} 
			};
			xhr.send(null);

			this.buildResponse();
		}
	};

	$(document).ready(function() {
		window.tinysong.init();
	});
})();
