(function() {
	window.tinysong = {
		api: {
			grooveshark: 'gs://s/~/%s/play',
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
			clipboard: '#clipboard',
			container: 'section',
			footer: 'footer',
			header: {
				logo: 'header > h1 > a'
			},
			search: {
				form: 'header > form',
				input: 'header > form > fieldset > input'
			},
			song: {
				copy: {
					link: 'section > ul > li > div > a.copy',
					success: 'success'
				},
				play: '.play'
			}
		},

		message: {
			clipboard: {
				link: 'Copy to clipboard.',
				success: 'Copied!'
			},
			search: {
				result: {
					empty: '<strong>We didn\'t find any songs!</strong> Try searching another?'
				}
			},
			song: {
				play: 'Play'
			}
		},

		user: {
			browser: {
				majorVersion: null,
				version: null
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
							'<a href="' + result.Url + '" class="play">' + window.tinysong.message.song.play + '</a>' +
							'<div>' +
							result.SongName + ' - ' + result.ArtistName + '<br>' +
							'<em>' + result.Url + '</em>';

					if (this.hasCopyToClipboard()) {
						this.state.response += ' <a href="' + result.Url + '" class="copy">' + window.tinysong.message.clipboard.link + '</a>';
					}

					this.state.response += '</div>' +
							'</li>';
				}
				this.state.response += '</ul>';
			} else {
				this.state.response = '<p class="error">' + window.tinysong.message.search.result.empty + '</p>';
			}

			$(this.dom.container).html(this.state.response);

			$(this.dom.search.input).focus();
			$(this.dom.search.input).select();
		},

		getBrowserVersion: function() {
			this.user.browser.version = navigator.appVersion.match(/Chrome\/(.*?)\s/)[1];
			this.user.browser.majorVersion = this.user.browser.version.split('.')[0];
		},

		getGsUrl: function(tinysongUrl) {
			var tinysongToken = tinysongUrl.split('/')[3];
			var gsUrl = '';

			var xhr = new XMLHttpRequest();
			xhr.open('GET', (this.api.gsuser).replace('%s', tinysongToken), false);
			xhr.onreadystatechange = function() {
				if (this.readyState == 4) {
					if (this.status == 200) {
						gsUrl = (window.tinysong.api.grooveshark).replace('%s', this.responseText);
					}
				}
			};
			xhr.send(null);

			return gsUrl;
		},

		hasCopyToClipboard: function() {
			return this.user.browser.majorVersion == '5'
		},

		highlightInputField: function() {
			$(this.dom.search.input).focus();
		},

		init: function() {
			this.highlightInputField();
			this.getBrowserVersion();
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

			$(this.dom.song.copy.link).live('click', function(e) {
				$(window.tinysong.dom.clipboard).val($(this).attr('href'));
				$(window.tinysong.dom.clipboard).focus();
				$(window.tinysong.dom.clipboard).select();

				document.execCommand('Copy');

				$(this).text(window.tinysong.message.clipboard.success);
				$(this).addClass(window.tinysong.dom.song.copy.success);
				$(window.tinysong.dom.clipboard).val('');

				window.tinysong.highlightInputField();

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
