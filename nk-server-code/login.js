if ($.api === undefined) {
	$.api = {};
}

$.api.login = {

	anonAccountDetails: null,
	fbRateLimit: 0,
	fbRateLimitVar: Math.random() * 100,
	displayNameData: null,

	dotsTarget: null,

	validProviders: 0,

	recoverCodeInFlight: false,

	init: function () {
		$('[data-toggle="tooltip"]').tooltip({
			template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
		});

		$('#main_agecheck_input_age').change($.api.login.ageGateInputTest);
		$('#main_agecheck_input_age').keyup($.api.login.ageGateInputTest);

		$('button').on('click', function (element) {
			$(element.currentTarget).fadeTo(100, 0.7).fadeTo(100, $(element.currentTarget).css('opacity') ? $(element.currentTarget).css('opacity') : 1);
		})

		if (navigator.userAgent && (navigator.userAgent.indexOf("6_1_6") !== -1 || navigator.userAgent.indexOf("4.1.2") !== -1)) {
			$('[data-row-remove=true]').removeClass("row");
			$('.input_black_addon').hide();

			$('input').css("width", (window.innerWidth * 0.85) + "px");
			$('input').css("max-width", (window.innerWidth * 0.85) + "px");
		}

		$('#provider_picker').hide();
		$('#provider_agegate_confirm').hide();

		var checkForPreviousUser = function () {

			$.api.app.request("/user/recovery/seenbefore", {}, function (error, result, raw) {

				if (result && result.found === true) {
					window.onerror("seenBefore:true", "seenBefore", 1, 1);
					$.api.login.setupAccountPrompt(result, null, false);
					changePage('#previousPlayer', true);
				}
				else {
					window.onerror("seenBefore:false", "seenBefore", 1, 1);
					getCountry();
				}

			}, function () {
				if ($.api.app.loggedInProviders !== undefined) {
					$.api.app.request("/user/search", {
						"method": "provider",
						"keys": $.api.app.loggedInProviders,
						"includeOnlineStatus": true
					}, function (error, data) {
						var users = data.users;
						var usersFound = Object.keys(users);
						if (usersFound.length === 1) {
							var provider = usersFound[0].split("_")[0];
							window.onerror("seenBefore:loggedin", "seenBefore", 1, 1);
							$.api.login.setupAccountPrompt({ user: users[usersFound[0]] }, [provider], true);
							changePage('#previousPlayer', true);
						}
						else {
							getCountry()
						}
					}, function () { getCountry() })
				}
				else {
					getCountry();
				}

			});
		};

		var doAppSpecificActions = function () {
			if ($.api.app.getQueryVariable("supports") !== undefined) {
				//Let the code in showOptionalPlatformProviders select what providers to show
			}
			else {
				var currentPlatform = $.api.app.getQueryVariable('platform');
				if (currentPlatform === "amazon") {
					switch ($.api.app.appID) {
						//game circle is only enabled for these games 
						case 1: /** BMC */
						case 2: /** Battles */
						case 3: /** SAS4 */
						case 6: /** Fortress */
						case 8: /** TK */
						case 10: /** BSM */
							$('#fbwebview_deprication').show();
							break;
					}
				}

				switch ($.api.app.appID + currentPlatform) {
					case "3android":
					case "16android":
					case "1android":
						$('#fbwebview_deprication').show();
						break;
				}
				if (currentPlatform === "ios" && navigator.userAgent) {

					if (navigator.userAgent.indexOf('13_') !== -1 || navigator.userAgent.indexOf('14_') !== -1 || navigator.userAgent.indexOf('15_') !== -1) {
						switch ($.api.app.appID) {
							//sign in with Apple is only enabled for these games 
							case 14: /** CS */
								$('#optional_login_apple').show();
								break;
							default:
								if (window.location.hostname.indexOf("192") !== -1 || window.location.hostname === "api-staging.ninjakiwi.com") {
									$('#optional_login_apple').show();
									$('#optional_login_apple').find('.flat_button_text').text("Sign in with Apple (test," + $.api.app.appID + ")");
								}
								break;
						}
					}
				}
				if (currentPlatform === "steam") {
				}
				else {
					$('#optional_login_twitch').hide();
				}

			}
		}

		if ($.api.app.getQueryVariable("browser") === "true") {
			checkForPreviousUser();
			doAppSpecificActions();
		} else {
			window.addEventListener('appInfoAvailable', checkForPreviousUser, false);
			window.addEventListener('appInfoAvailable', doAppSpecificActions, false);
		}

		setTimeout(function () {
			// Login Form Macros - Listen for input change - BTD6 WinStore only
			if ($.api.app.appID === 11 && ($.api.app.skuID === 35 || $.api.app.skuID === 1101)) {

				$('[data-emailPrompt]').on('input', function (event) {

					var currentTarget = event.currentTarget;
					var targetLocation = currentTarget.dataset.emailprompt;

					$('[data-emailPromptLocation=' + targetLocation + ']').show();
				})

				$('[data-emailPromptButton').on('click', function (event) {

					var currentTarget = event.currentTarget;
					var targetLocation = currentTarget.dataset.emailpromptbutton;

					$('[data-emailPrompt=' + targetLocation + ']').val(
						$('[data-emailPrompt=' + targetLocation + ']').val() + currentTarget.innerText
					)

					$('[data-emailPromptLocation=' + targetLocation + ']').hide();
				})
			}

		}, 1000)

	},

	setupAccountPrompt: function (seenUserDetails, overrideProviders, hideBottomBlurb) {
		$('#previousPlayer').find('[data-playerName=true]').text(seenUserDetails.user.displayName);

		$.api.login.validProviders = 0;

		var providers = overrideProviders ? overrideProviders : seenUserDetails.user.providersAvailable;
		if (providers.indexOf('kloud') !== -1) {
			var clonedButton = $('#email_button').clone();
			clonedButton.find('.flat_button_text').text(seenUserDetails.email);
			$('#previousPlayer').find('#providerButtons').append(clonedButton);

			$.api.login.validProviders++;
			clonedButton.attr('onclick', '');
			clonedButton.click(function () {
				$.api.login.cancelPreviousPlayer(function (reason) {
					window.onerror("seenBefore:login:email", "seenBefore", 1, 1);
					$.api.login.ageGate('full');
					$.api.login.ageGateComplete();
					setTimeout(function () {
						$.api.login.startLoginWithEmail();
						$('#login_form_email').focus();
					}, 200)

				}, 'gotoemail');

			});
		};

		var seenProviders = {};
		providers.forEach(function (provider) {

			if (seenProviders[provider] !== undefined) {
				return;
			}
			seenProviders[provider] = true;

			switch (provider) {
				default:
					var clonedButton = $('[data-providerName=' + provider + ']').clone();
					if (clonedButton.length === 0) {
						return;
					}
					var clonedButtonPlatform = clonedButton.data('platform');
					var currentPlatform = $.api.app.getQueryVariable("platform");

					clonedButton.show();
					if (clonedButtonPlatform !== undefined && clonedButtonPlatform !== currentPlatform) {
						clonedButton.css('opacity', 0.7);
						clonedButton.find('.flat_button_text').html(clonedButton.find('.flat_button_text').text() + "<span  style='font-size:0.8em'>(not available on this platform)</span>");

						$('#previousPlayer').find('#providerButtonsDisabled').append(clonedButton);

						window.onerror("seenBefore:provider:" + provider + ":false:" + hideBottomBlurb, "seenBefore", 1, 1);
						return;
					}
					else {

						$.api.login.validProviders++;

						window.onerror("seenBefore:provider:" + provider + ":true:" + hideBottomBlurb, "seenBefore", 1, 1);

						$.api.login.addSeenUserLoginClick(clonedButton, provider);
						$('#previousPlayer').find('#providerButtons').append(clonedButton);
					}
			}
		});

		$($.api.login.validProviders === 0 ? '[data-providerFound="false"]' : '[data-providerFound="true"]').show();
		if ($.api.login.validProviders === 0) {
			$('#previousPlayer').find('#providerButtonsDisabled').empty();
		}

		if (hideBottomBlurb === true) {
			$('[data-recoverySameAccountPrompt]').hide();
		}
	},

	usePromptedCode: function () {

		window.onerror("seenBefore:provider:promptedCode", "seenBefore", 1, 1);
	},

	addSeenUserLoginClick: function (button, provider) {

		var click = button[0].onclick;
		button.attr('onclick', '');
		button.click(function () {
			window.onerror("seenBefore:provider:select:" + provider + ":" + $.api.login.validProviders, "seenBefore", 1, 1);
			click();
		})
	},

	cancelPreviousPlayer: function (callback, reason) {

		window.onerror("seenBefore:imnot:" + reason + ":" + $.api.login.validProviders, "seenBefore", 1, 1);
		$('#previousPlayer').hide();
		changePage('#main');
		setTimeout(function () {
			getCountry(callback);
		}, 200);
	},

	ageGateInputTest: function () {
		var age = parseInt($('#main_agecheck_input_age').val());
		if (age <= 0 || age > 120 || isNaN(age)) {
			$('#main_agecheck_input_button').fadeTo(1, 0.5);
		}
		else {
			$('#main_agecheck_input_button').fadeTo(1, 1);
		}
	},

	ageGateInput: function () {

		var age = parseInt($('#main_agecheck_input_age').val());
		if (age <= 0 || age > 120 || isNaN(age)) {
			$('#main_agecheck_input_age').css('background-color', '#f77');
			setTimeout(function () {
				$('#main_agecheck_input_age').css('background-color', '#fff');
			}, 100);
			return;
		}

		if (age >= ageGateAge) {
			$.api.login.ageGate('full');
		}
		else {
			$.api.login.ageGate('limited');
		}
	},

	ageGate: function (type) {

		if (type === "full") {
			$('#provider_agegate').hide();
			$('#provider_agegate_confirm').fadeIn();
			$('[data-ageCheckFull=cn]').hide();
			$('[data-ageCheckFull=nk]').show();
			return;
		}

		changePage('#anon_info', true);
		$.ajax('https://static-api.nkstatic.com/appdocs/4/appdocs/prettynames.json').done(function (result) {
			$.api.login.displayNameData = result;
		})
	},

	ageGateComplete: function () {
		$('#provider_picker').show();
		$('#provider_agegate_confirm').hide();
		showOptionalPlatformProviders();
	},

	cancelAnonAccount: function () {
		$('#provider_agegate').show();
	},

	createAnonAccount: function () {
		if ($.api.login.createAnonAccountPending === true) {
			return;
		}
		$.api.login.createAnonAccountPending = true;
		$.api.app.request("/user/create/anonymous", {}, function (error, result, raw) {

			setTimeout(function () { $.api.login.createAnonAccountPending = false; }, 1000);
			$('#anon_setup_displayname').attr('placeholder', result.user.displayName);
			$('#anon_setup_displayname').val(result.user.displayName);

			$('#anon_setup_recovery').html(result.user.shortcode + "-" + result.recoverCode);

			$.api.login.anonAccountDetails = result;
			$.api.login.anonAccountDetailsRaw = raw;
			changePage("#anon_setup", true);

		}, function (error) {
			setTimeout(function () { $.api.login.createAnonAccountPending = false; }, 1000);
		});


	},

	finishAnonSetup: function () {

		var newName = $('#anon_setup_displayname').val();
		if (newName.length != 0 && newName !== $.api.login.anonAccountDetails.user.displayName) {
			$.api.login.anonAccountDetails.user.displayName = newName;
			var updatedRaw = JSON.parse($.api.login.anonAccountDetailsRaw.data);
			updatedRaw.user.displayName = newName;
			$.api.login.anonAccountDetailsRaw.data = JSON.stringify(updatedRaw);
			//$.api.login.anonAccountDetailsRaw = JSON.stringify($.api.login.anonAccountDetails);
			$.api.app.sessionID = $.api.login.anonAccountDetails.session.sessionID;

			$.api.app.request("/user/update", $.api.login.anonAccountDetails.user, function (error, result, raw) {
				$.api.app.request("/user/current", $.api.login.anonAccountDetails.user, function (error, result, raw) {

					beginRedirect("//login/?new=true", raw);
				})
			});
		} else {
			beginRedirect("//login/?new=true", $.api.login.anonAccountDetailsRaw);
		}
	},

	startSteamFlow: function (step) {
		$('[data-steamapp=' + $.api.app.appID + "]").show();
		$('#steamflow' + step).modal();
	},

	startLoginWithEmail: function () {
		$('#email_login_form_form').show();
		$('#email_login_form_instructions').hide();
		$('#email_button').css('opacity', 0.5);
	},

	loginWithEmail: function () {
		var payload = {
			email: $('#login_form_email').val(),
			password: $('#login_form_password').val()
		}

		$('#login_form_website').hide();

		$.api.app.request("/user/login/kloud", payload, function (error, result, raw) {
			beginRedirect("//login/?new=false", raw);
		}, function (error) {
			try {
				error = JSON.parse(error.error);
				var hasWebsiteEmail = error.error.hasWebsiteEmail;
				if (hasWebsiteEmail === true) {
					$('#login_form_website').fadeIn();
					return;
				}
			} catch (e) { }
			showToolTip('#login_form_password', 2000);
		});
	},

	loginWithFacebook: function () {

		var platformName = $.api.app.getQueryVariable("platform");
		if (platformName == "steam") {
			$.api.login.loginWithFacebookOnSteam();
			return;
		}

		$.api.navigation.sendToSDK("//login?provider=facebook");
	},

	loginWithTwitch: function () {
		changePage('#steamFacebookLogin')

		$.api.app.request("/user/twitch/start", {}, function (error, data, raw) {

			$.api.login.steamFacebookLoginData = data;
			$.api.login.oauthProviderLogin = "/user/login/twitch";
			$.api.login.oauthProviderCreate = "/user/create/twitch";
			$.api.login.steamFacebookLoginInterval = setInterval($.api.login.steamFacebookLoginUpdate, 2000);
			//window.open($.api.login.steamFacebookLoginData.facebookStartRedirectURL, '_blank');
			window.location = $.api.login.steamFacebookLoginData.facebookStartRedirectURL;
			$('#socialButton').attr('href', $.api.login.steamFacebookLoginData.facebookStartRedirectURL);

		}, function (error) {
			console.log(error)
		});
	},

	disableLogins: function (dotsTarget) {
		$('[data-wrapper=content]').hide();
	},

	enableLogins: function (dotsTarget) {
		$('[data-wrapper=content]').show();
	},

	loginWithFacebookOnSteam: function () {
		changePage('#steamFacebookLogin')

		$.api.app.request("/user/facebook/start", {}, function (error, data, raw) {

			$.api.login.steamFacebookLoginData = data;
			$.api.login.oauthProviderLogin = "/user/login/facebook";
			$.api.login.oauthProviderCreate = "/user/create/facebook";
			$.api.login.steamFacebookLoginInterval = setInterval($.api.login.steamFacebookLoginUpdate, 2000);

			var platformName = $.api.app.getQueryVariable("platform");
			window.location = $.api.login.steamFacebookLoginData.facebookStartRedirectURL;

		}, function (error) {
			console.log(error)
		});
	},

	steamFacebookLoginUpdate: function () {

		$.api.app.request("/user/facebook/update", {
			linkToken: $.api.login.steamFacebookLoginData.linkToken
		}, function (error, data, raw) {

			$.api.login.steamFacebookLoginData = data;

			if ($.api.login.steamFacebookLoginData.facebookToken != "NONE") {
				clearInterval($.api.login.steamFacebookLoginInterval);
				changePage('#steamFacebookLoginComplete');

				setTimeout(function () {
					$.api.login.steamFacebookLoginComplete();
				}, 2000)
			}
		}, function (error) {
			console.log(error)
		}, false);

	},

	steamFacebookLoginComplete: function (showErrorIfCantLogin) {

		$.api.app.request($.api.login.oauthProviderLogin, {
			accessToken: $.api.login.steamFacebookLoginData.facebookToken
		}, function (error, data, raw) {

			beginRedirect("//login/?new=false", raw);

		}, function (error) {
			var linkError = JSON.parse(error.error);
			if (linkError.error.type == "ERR_USER_CANNOT_FIND_LINK") {

				if (showErrorIfCantLogin) {
					$.api.login.showToolTip("#steamFacebookLoginComplete_click", error);
				} else {
					$.api.app.request($.api.login.oauthProviderCreate, {
						accessToken: $.api.login.steamFacebookLoginData.facebookToken,
						"displayName": "Player"
					}, function (error, data, raw) {
						$.api.login.steamFacebookLoginComplete(true);
					});
				}
			}
		});

	},

	loginWithProvider: function (provider) {
		$.api.login.disableLogins(event.currentTarget);
		$.api.navigation.sendToSDK("//login?provider=" + provider);

	},

	startSignup: function () {
		if ($('#login_form_email').val() !== "") {
			$('#signup_form_email').val($('#login_form_email').val());
		}
		changePage("#signup", true);
	},

	startRecoverPassword: function () {

		changePage('#recoverpassword');
	},

	signup: function () {

		var payload = {
			username: "Player",
			email: $('#signup_form_email').val().toLowerCase(),
			password: $('#signup_form_password').val()
		}

		if (payload.email.indexOf("@") == -1 || payload.email.indexOf(".") == -1 || payload.email.indexOf(" ") !== -1) {
			showToolTip('#signup_form_email', 2000);
			return;
		}

		if (payload.email.indexOf(" ") !== -1) {
			showToolTip('#signup_form_email', 2000);
			return;
		}

		if (payload.email.split("@").length !== 2) {
			showToolTip('#signup_form_email', 2000);
			return;
		}

		if (payload.password.length == 0) {
			showToolTip('#signup_form_password', 2000);
			return;
		}

		if (payload.password.length < 6) {
			showToolTip('#signup_form_password', 2000);
			return;
		}

		if ($('#signup_usa_consent').is(":checked") === false) {
			showToolTip('#signup_usa_consent', 2000);
			return;
		}

		$.api.app.request("/user/create/kloud", payload, function (error, result, raw) {

			$.api.app.request("/user/login/kloud", payload, function (error, result, raw) {
				beginRedirect("//login/?new=true", raw);
			});

		}, function (error) {
			$('#signin_form_login_button').attr('data-original-title', JSON.parse(error.error).error.details.reason);
			showToolTip('#signin_form_login_button', 2000);
		});
	},

	recoverPassword: function () {
		var payload = {
			email: $('#recoverpassword_form_email').val()
		}

		$.api.app.request("/support/generateNewPassword", payload, function (error, data, raw) {
			$('#recoverpassword_form_email_input').hide();
			$('#recoverpassword_form_email_info').show();
		}, function (error) {
			showToolTip('#recoverpassword_form_email', 2000);
		});
	},

	showModal: function (title, path) {

		//deprecated? check sdk17.js
		switch ($.api.app.appID) {
			case 16:
				path = path.replace("[[appid]]", 16);
				break;
			default:
				path = path.replace("[[appid]]", 4);
				break;
		}
		$('#privacy_terms_modal').modal();
		$('#privacy_terms_modal_title').html(title);
		$.ajax({
			url: path,
			complete: function (result) {
				$('#privacy_terms_modal_body').html(result.responseText);

				var currentLocale = $.api.app.getQueryVariable("local");
				var displayLocale = "en";

				if ($('#privacy_terms_modal_body').find('#locale_' + currentLocale).length !== 0) {
					displayLocale = currentLocale;
				}
				alert(displayLocale);
			}
		})
	},

	showToolTipWithText: function (element, title, error) {

		$.api.login.enableLogins();

		setTimeout(function () {
			if (element && element.charAt(0) !== '#') {
				element = "#" + element;
			}

			if (element.indexOf("facebook") !== -1) {
				showToolTip("#optional_login_facebook", 4000);
				showToolTip("#login_facebook", 4000);
			}
			else {
				showToolTip(element, 4000);
			}

		}, 1)

	},

	steamLink: function () {

		var code = $('#steam_linking_code_1').val();
		$('.steam_link_input_wrong').hide();
		$('#steamlink_button').css('opacity', 0.1);
		if ($.api.login.recoverCodeInFlight === true) {
			return;
		}
		$.api.login.recoverCodeInFlight = true;
		var codeStripped = code.replace(":", "").replace("-", "");
		$.api.app.request("/user/login/token", {
			token: codeStripped
		}, function (error, data, raw) {
			beginRedirect("//login/?new=false", raw);
		}, function (error) {

			//maybe a recovery code!
			if (code.length === 14) {
				$.api.login.checkRecoveryCode(code);
			}
			else {
				$.api.login.recoverCodeInFlight = false;
				$('#steamlink_button').css('opacity', 1);
				$('.steam_link_input_wrong').fadeIn();
			}

		});
	},

	checkRecoveryCode: function (code) {

		$.api.app.request("/user/login/recovery", {
			token: code
		}, function (error, data, raw) {
			beginRedirect("//login/?new=false", raw);
			$('#steamlink_button').css('opacity', 1);
		}, function (error) {

			$.api.login.recoverCodeInFlight = false;
			$('#steamlink_button').css('opacity', 1);
			$('.steam_link_input_wrong').fadeIn();
		});

	},

	goneToNextBox: false,
	steamInputBoxChecks: function () {
		if ($('#steam_linking_code_1').val() === undefined) {
			return;
		}
		try {
			$('#steam_linking_code_1').val($('#steam_linking_code_1').val().toUpperCase());
			$('#steam_linking_code_2').val($('#steam_linking_code_2').val().toUpperCase());

			if ($('#steam_linking_code_1').val().length === 5 && $.api.login.goneToNextBox === false) {
				$.api.login.goneToNextBox = true;
				$('#steam_linking_code_2').focus();
			}
		} catch (e) { }
	},

	nextBox: function (element) {

	},

	rerollDisplayName: function () {
		var prettnames = $.api.login.displayNameData;

		var name = prettnames.first[Math.floor(Math.random() * prettnames.first.length)] + prettnames.second[Math.floor(Math.random() * prettnames.second.length)]
		var addedNumbers = 0;
		while (name.length < 14 && addedNumbers++ < 4) {
			name += Math.floor(9 * Math.random());
		}

		$('#anon_setup_displayname').val(name);
	},

	previousPassword: null,
	checkPasswordStrength: function () {
		var p1 = $('#signup_form_password').val();
		if (p1 === undefined) {
			return;
		}
		if (p1.length < 6) {
			$('#password_weak').hide();
			return;
		}


		var sha = sha1(p1).toUpperCase();
		if (sha === $.api.previousPassword) {
			return;
		}
		$.api.previousPassword = sha;


		if (p1.length < 10 && /^[a-z]+$/.test(p1)) {
			$('#password_weak').show();
			return;
		}

		$.ajax("https://api.pwnedpasswords.com/range/" + sha.substr(0, 5)).done(function (data) {

			if (data.indexOf(sha.substr(6)) !== -1) {
				var count = data.split(sha.substr(6) + ":").pop().split("\n")[0];
				count = parseInt(count);
				console.log("hibp");
				if (count > 100) {
					$('#password_weak').show();
				}
				else {
					$('#password_weak').hide();
				}
			}
			else {
				$('#password_weak').hide();
			}
		});
	}
}

$.api.user = {};
$.api.user.login = $.api.login;

function upperCaseF(a) {
	setTimeout(function () {
		a.value = a.value.toUpperCase();
	}, 1);
}

setInterval($.api.login.steamInputBoxChecks, 50);
setInterval($.api.login.checkPasswordStrength, 100);

var showToolTipWithText = $.api.login.showToolTipWithText;