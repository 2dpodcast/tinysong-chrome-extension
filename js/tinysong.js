(function() {
	window.tinysong = {
		settings: {
			host: {
				autocomplete: '?s=ac',
				search: '?s=s',
				share: '?s=sh',
				shareLog: '?s=ls',
				shareEmail: '?s=e',
				clipboard: 'webincludes/swf/ZeroClipboard.swf',
				recaptcha:'?s=rc'
			},
			autocomplete: {
				delay: 500,
				autoFill: true,
				resultsClass: 'anderson_cooper'
			},
			clipboard: {
				cursor: true
			},
			loading: {
				height: 12
			},
			messageSwitch: 500,
			scroll: {
				threshold: {
					top: 180,
					bottom: 220,
					nominal: $('div.header_wrapper').height()
				},
				to: {
					top: 0,
					bottom: $('div.header_wrapper').height()
				},
				duration: 150,
				moreSongsDuration: 150,
				easing: 'linear'
			},
			searchText:"Share An Song",
			shareEmail: {
				up: 500,
				down: 200
			},
			results: {
				up: 200,
				down: 1000
			}
		},
		page: {
			body: $('html, body'),
			content: $('div#content_wrapper'),
			header: $('div#header_wrapper'),
			loading: $('div#loadinggraphic'),
			message: {
				className: $('div#message_box'),
				text: $('div#message_text')
			},
			song: {
				play:'div#content_wrapper ul.result div.play',
				pause: 'div#content_wrapper ul.result div.pause',
				loading: 'div#content_wrapper ul.result div.loading'
			},
			clipboard: {
				body: $('div#clipboard_click'),
				text:'span#clipboard_text',
				end:'span#clipboard_click_end'
			},
			search: {
				general: $('div#search_wrapper div#search_wrapper_bar'),
				form: $('div#search_wrapper div#search_wrapper_bar form#search_form'),
				input: $('div#search_wrapper div#search_wrapper_bar input#search_input'),
				button: $('div#search_wrapper div#search_wrapper_bar a#icon_button'),
				more: 'div#more_results',
				moreText:'div#more_results span',
				results: 'div#result_wrapper'
			},
			share: {
				link: $('ul.result'),
				log: $('ul#sharelinks li a'),
				email: {
					body: 'div.email',
					link: 'ul#sharelinks li.email a#email_link',
					textarea: 'div.email div#textarea_wrapper',
					textareaText: 'div.email div#textarea_wrapper textarea#personalMessage',
					input: 'div.email input',
					button: 'div.email button#submitEmail',
					form: 'div.email form#emailForm',
					toAddr: 'div.email input#toAddr',
					fromAddr: 'div.email input#fromAddr',
					base62: 'div.email input#base62',
					challenge: 'input#recaptcha_challenge_field',
					response: 'input#recaptcha_response_field',
					errors: {
						emailError: 'div.email div#email_error',
						className: 'error',
						recaptcha: '#recaptcha_error'
					}
				}
			}
		},
		states: {
			animation: null,
			animationComplete: true,
			clipboard: null,
			loadingDots: null,
			messageClass: 'start',
			pagePosition: 'top',
			searchText: null,
			searchIndexOffset: 0,
			state: null
		},
		init:function() {
			ZeroClipboard.setMoviePath(this.settings.host.clipboard);
			this.changeSearchText(this.settings.searchText,true);
			this.initEvents();
			this.changePagePosition(0,null,true);
			this.loading(0);
			window.player = new jsPlayer();
		},
		initEvents: function() {
			this.page.search.input.focus(function() {
				if ($(this).val() == window.tinysong.settings.searchText) {
					window.tinysong.changeSearchText('',true);
					return;
				}

				if (window.tinysong.equalSearchText($(this).val())) {
					$(this).select();
				}
			});

			this.page.search.input.blur(function() {
				window.tinysong.changeSearchText(window.tinysong.getSearchText(),$(this).val()=='');
			});

			this.page.search.form.submit(function(e) {
				window.tinysong.search(window.tinysong.page.search.input.val());
				e.cancelBubble = true;
				e.stopPropagation();
				return false;
			});

			this.page.search.button.click(function() {
				window.tinysong.search(window.tinysong.page.search.input.val());
				return false;
			});

			$(this.page.search.more).live('click', function() {
				window.tinysong.moreSongs(window.tinysong.getSearchText());
				return false;
			});

			this.page.share.link.live('click', function() {
				window.tinysong.share($(this).attr('rel').split('-'));
			});

			this.page.share.link.live('mouseout', function() {
				$(this).find('.sharesong').removeClass('mouseover');
			});

			$(this.page.song.play).live('mouseover', function(e) {
				$(this).parent(1).find('.sharesong').removeClass('mouseover');
			});

			$(this.page.song.pause).live('mouseover', function(e) {
				$(this).parent(1).find('.sharesong').removeClass('mouseover');
			});

			$(this.page.song.loading).live('mouseover', function(e) {
				$(this).parent(1).find('.sharesong').removeClass('mouseover');
			});

			$(this.page.song.play).live('click', function(e) {
				e.cancelBubble = true;
				window.player.toggleSong(this, $(this).attr('rel'));
				$(window.tinysong.page.song.pause).removeClass('pause').removeClass('loading').addClass('play');
				$(window.tinysong.page.song.loading).removeClass('pause').removeClass('loading').addClass('play');
				$(this).removeClass('play').removeClass('loading').addClass('pause');
				return false;
			});

			$(this.page.song.pause).live('click', function(e) {
				e.cancelBubble = true;
				window.player.toggleSong(this, $(this).attr('rel'));
				return false;
			});

			$(this.page.song.loading).live('click', function(e) {
				e.cancelBubble = true;
				window.player.toggleSong(this, $(this).attr('rel'));
				return false;
			});

			this.page.body.mousemove(function(e) {
				window.tinysong.scroll(e.pageY);
			});

			$(document).keydown(function(e) {
				if (window.tinysong.equalState('shareEmail'))
					return;

				if (e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode >= 65 && e.keyCode <= 90) {
					if (!$(e.target).is('input')) {
						window.tinysong.scroll(0);
						window.tinysong.page.search.input.focus();
					}
				}
			});

			this.page.share.log.live('mousedown', function(e) {
				window.tinysong.shareLog($(this).attr('rel').split('-'));
				e.stopPropagation();
				return false;
			});

			$('#clipboard_click').live('mouseover', function() {
				if (window.tinysong.states.clipboard == null) {
					window.tinysong.states.clipboard = new ZeroClipboard.Client();
					window.tinysong.states.clipboard.setText($('#clipboard_text').html());
					window.tinysong.states.clipboard.setHandCursor(true);
					window.tinysong.states.clipboard.glue('clipboard_click');
					window.tinysong.states.clipboard.addEventListener('onComplete', function() {
						$('#clipboard_click').hide();
						$('#clipboard_success').show();
						window.tinysong.states.clipboard.destroy();
					});
				}
			});

			$(this.page.share.email.link).live('click', function() {
				window.tinysong.changePagePosition($(this).offset().top + 30, function() {
					$(window.tinysong.page.share.email.body).slideDown(window.tinysong.settings.shareEmail.down, function() {
						window.tinysong.changeState('shareEmail');
					});
				},
				true);
			});

			$(this.page.share.email.textarea).live('mouseover', function() {
				$(this).addClass('activeHover');
			});

			$(this.page.share.email.textarea).live('mouseout', function() {
				$(this).removeClass('activeHover');
			});

			$(this.page.share.email.textarea).live('focus', function() {
				$(this).addClass('activeFocus');
			});

			$(this.page.share.email.textarea).live('blur', function() {
				$(this).removeClass('activeFocus');
			});

			$(this.page.share.email.textareaText).live('focus', function() {
				if ($(this).val() == $(this).attr('rel')) {
					$(this).val('');
				}
			});

			$(this.page.share.email.textareaText).live('blur', function() {
				if ($(this).val() == '') {
					$(this).val($(this).attr('rel'));
				}
			});

			$(this.page.share.email.input).live('focus', function() {
				$(this).addClass('activeFocus').parent(0).addClass('activeFocus').parent(0).addClass('activeFocus');
				if ($(this).val() == $(this).attr('rel')) {
					$(this).val('');
				}
			});

			$(this.page.share.email.input).live('blur', function() {
				$(this).removeClass('activeFocus').parent(0).removeClass('activeFocus').parent(0).removeClass('activeFocus');
				if ($(this).val() == '') {
					$(this).val($(this).attr('rel'));
				}
			});

			$(this.page.share.email.form).live('submit', function(e) {
				e.cancelBubble = true;
				e.stopPropagation();
				window.tinysong.shareEmail();
				return false;
			});

			$(this.page.share.email.button).live('click', function(e) {
				e.cancelBubble = true;
				e.stopPropagation();
				window.tinysong.shareEmail();
				return false;
			});
		},
		scroll: function(y) {
			if (!this.isScrollable())
			return null;

			switch (this.getState()) {
				case 'share':
				case 'shareEmail':
				case 'result':
					this.changePagePosition(y);
					break;
				default:
					break;
				}
			},
			search: function(query) {
				if (this.equalState(['search','result']) && this.equalSearchText(query))
				return;
				this.clearContent();
				this.changeState('search');
				this.changeSearchText(query, true);
				$.post(this.settings.host.search,{q: [query,0]}, function(resp) {
					if (resp.extraParams.offset)
						window.tinysong.states.searchIndexOffset = resp.extraParams.offset;

					window.tinysong.changePagePosition(window.tinysong.settings.scroll.to.bottom, function() {
						window.tinysong.showContent(resp, null);
						window.tinysong.changeState('result');
						window.tinysong.page.search.input.blur();
					}, true);
				},
				'json');
			},
			moreSongs: function(query) {
				this.changeState('search');
				$.post(this.settings.host.search, {q: [query,window.tinysong.states.searchIndexOffset]}, function(resp) {
					if (resp.extraParams.offset) {
						window.tinysong.states.searchIndexOffset = resp.extraParams.offset;
					}

					window.tinysong.showContent(resp, function() {
						window.tinysong.changePagePosition(window.tinysong.getPageOffset($(window.tinysong.page.search.results), true, window.tinysong.settings.scroll.moreSongsDuration),function(){window.tinysong.changeState('result');window.tinysong.page.search.input.blur();},true);},true);},'json');},share:function(info){this.clearContent();info[2]=this.getSearchText();$.post(this.settings.host.share,{q:info},function(resp){window.tinysong.changePagePosition(window.tinysong.settings.scroll.to.bottom,function(){window.tinysong.changeState('share');window.tinysong.showContent(resp);},true);},'json');},shareEmail:function(){toAddr=$(window.tinysong.page.share.email.toAddr);fromAddr=$(window.tinysong.page.share.email.fromAddr);message=$(window.tinysong.page.share.email.textareaText);base62=$(window.tinysong.page.share.email.base62);challenge=$(window.tinysong.page.share.email.challenge);response=$(window.tinysong.page.share.email.response);var
isError=false;$(window.tinysong.page.share.email.errors.emailError).hide();$(window.tinysong.page.share.email.errors.recaptcha).hide();toAddr.removeClass('emailError').parent(0).removeClass('emailError').parent(0).removeClass('emailError');fromAddr.removeClass('emailError').parent(0).removeClass('emailError').parent(0).removeClass('emailError');if(toAddr.val()==toAddr.attr('rel')||!this.validEmail(toAddr.val())){toAddr.addClass('emailError').parent(0).addClass('emailError').parent(0).addClass('emailError');$(window.tinysong.page.share.email.errors.emailError).show();return;}
if(fromAddr.val()==fromAddr.attr('rel')||!this.validEmail(fromAddr.val())){fromAddr.addClass('emailError').parent(0).addClass('emailError').parent(0).addClass('emailError');$(window.tinysong.page.share.email.errors.emailError).show();return;}
$.post(window.tinysong.settings.host.recaptcha,{q:[challenge.val(),response.val()]},function(resp){if(!resp.valid){$(window.tinysong.page.share.email.errors.recaptcha).show();}else{if(message.val()==message.attr('rel')){message.val('');}
$.post(window.tinysong.settings.host.shareEmail,{q:[base62.val(),toAddr.val(),fromAddr.val(),message.val()]},function(){$(window.tinysong.page.share.email.body).slideUp(window.tinysong.settings.shareEmail.up);window.tinysong.changeState('share');},'json');}},'json');},shareLog:function(info){$.post(this.settings.host.shareLog,{q:info},function(resp){},'plaintext');},changeSearchText:function(text,condition,tempSave){if(condition==false)return;this.page.search.input.val(text);if(text==''||text=='Search
Any
Song'||this.equalSearchText(text)||tempSave==true)return;this.states.searchText=text;this.states.searchIndexOffset=0;},equalSearchText:function(text){return
this.states.searchText==text;},getSearchText:function(){return
this.states.searchText;},changeState:function(state){this.states.state=state;if(this.states.loading!=null)clearTimeout(this.states.loading);this.states.loading=null;if(state=='search'){if(this.states.clipboard!=null){this.states.clipboard.destroy();this.states.clipboard=null;}}},equalState:function(state){if(this.states.state==null){return
false;} if(!$.isArray(state)){return this.states.state==state;} var
isTrue=false;$.each(state,function(s){if(state[s]==window.tinysong.states.state){isTrue=true;return;}});return
isTrue;},getState:function(){return
this.states.state;},getPageOffset:function(e){return
e.offset().top+e.height();},isScrollable:function(){return($(window).height()<$(document).height()-this.settings.scroll.threshold.nominal);},equalPagePosition:function(position){return
window.tinysong.states.pagePosition==position;},findPagePosition:function(y){if(y<window.tinysong.settings.scroll.threshold.bottom){return'top';}else
if(y>window.tinysong.settings.scroll.threshold.top){return'bottom';}else{return'bottom';}},changePagePosition:function(y,callback,force,duration){var
newPagePosition=this.findPagePosition(y);if(window.tinysong.equalPagePosition(newPagePosition)&&force!=true)return
callback==null?null:callback();window.tinysong.states.pagePosition=newPagePosition;if(this.states.state!=null){if(!this.isScrollable())return
callback==null?null:callback();if(window.tinysong.states.animationComplete==false)return
callback==null?null:callback();if(window.tinysong.states.animation)window.tinysong.states.animation.stop();}
window.tinysong.states.animationComplete=false;var
scrollTo=force?y:window.tinysong.settings.scroll.to[newPagePosition];window.tinysong.states.animation=window.tinysong.page.body.animate({scrollTop:scrollTo},{complete:function(){window.tinysong.states.animationComplete=true;if(callback!=null)callback();},duration:duration?duration:window.tinysong.settings.scroll.duration,easing:window.tinysong.settings.scroll.easing});},clearContent:function(callback){$(window.tinysong.page.loading).show();this.page.message.text.html('');if(this.states.messageClass!='start'){this.page.message.className.removeClass(this.states.messageClass).addClass('start');this.states.messageClass='start';}
this.page.content.slideUp(this.settings.results.up,callback);},showContent:function(content,callback,append){if(!append){$(window.tinysong.page.loading).hide();window.tinysong.page.message.text.html(content.message);window.tinysong.page.message.className.switchClass(window.tinysong.states.messageClass,content.className,window.tinysong.settings.messageSwitch);window.tinysong.states.messageClass=content.className;}else{if(content.className=='error'){$(window.tinysong.page.search.moreText).html('No
more songs found!');}}
if(content.html.length>0){if(append){$('.last').removeClass('last');var
newDiv=$('<div/>').hide().append(content.html);$(window.tinysong.page.search.results).append(newDiv);newDiv.slideDown(window.tinysong.settings.results.down,callback);}else{window.tinysong.page.content.html(content.html).slideDown(window.tinysong.settings.results.down,callback);}}},validEmail:function(addr){return/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(addr);},loading:function(stateNum){setTimeout(function(){var
position=-1*stateNum*window.tinysong.settings.loading.height;$(window.tinysong.page.loading).css({backgroundPosition:'0
'+position+'px'});if(stateNum>=3){stateNum=-1;}
window.tinysong.loading(++stateNum);},100);}};})();