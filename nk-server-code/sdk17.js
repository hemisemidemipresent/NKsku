function begin() {

    if (this['$'] == null) {
        if (window.onerror) {
            window.onerror("JQuery can't be loaded", "sdk17.js", 0, 0, null);
        }
        return;
    }
    if ($.api.app.getQueryVariable("appID")) {

        $.api.app.setAppInfo([
            $.api.app.getQueryVariable("appID"),
            $.api.app.getQueryVariable("skuID"),
            $.api.app.getFragmentValue("secret")
        ]);

        if ($.api.app.getQueryVariable("sessionID")) {
            $.api.app.setSession($.api.app.getQueryVariable("sessionID"))
        }
    }

    $.api.navigation.moduleFolder = "sdk";

    $.api.navigation.noSessionData = function () {

        if ($.api.app.appID === undefined &&
            $.api.app.getQueryVariable("platform") === "steam" &&
            (window.location.href.includes("index.html") || window.location.href.includes("profile.html"))
        ) {
            var userAgent = navigator.userAgent;
            if ($.api.app.getQueryVariable("unity") === "true" &&
                (userAgent.indexOf("btd6") == -1)
            ) {
                $('#noSessionData_wrongUA').show();
            }
            changePage('#noSessionData');
            window.onerror("WrongBrowser", "sdk17.js", 0, 0, {});
        }
    }

    setTimeout(function () {

        if ($.api.app.getQueryVariable("browser") != "true" && $.api.app.getQueryVariable("autoload") != "false") {

            if ($.api.app.getQueryVariable("restore") != null) {
                // window.location = "http://restored";
                $.api.navigation.sendToSDK("//restored");
            } else {
                // window.location = "http://loaded";
                $.api.navigation.sendToSDK("//loaded");

                $.api.navigation.somethingWentWrongTimeout = setTimeout($.api.navigation.noSessionData, 3000);
            }
        }
    }, 10);


    setTimeout(function () {
        // if ($.api.app.getQueryVariable("unity") === "true") {
        history.pushState({
            close: true
        }, "unityclose");
        history.pushState({
            close: false
        }, "unityclose");
        //  }
        
        window.onpopstate = function () {
           
            var currentState = history.state;
            console.log(currentState);
            if (currentState === null || currentState === undefined) {
                 if($.api.app.appID === 17) {
                    $.api.navigation.sendToSDK('//close');
                }
                return;
            }
            if (currentState.close === true) {
                $.api.navigation.sendToSDK('//close');
            } else {
                changePage('#main');
            }
        }

    }, 500);

}

focusOnSelectedElement = function () {
    var element = document.activeElement;
    if (element && element.tagName.toLowerCase() === 'input') {
        element.scrollIntoView();
        window.scrollBy(0, -10);
    }
}

var showOptionalPlatformProviders = function () {
    var platformName = $.api.app.getQueryVariable("platform");
    if (platformName === "android_with_gp") {
        platformName = "android";
    }

    if ($.api.app.getQueryVariable("supports") !== undefined) {

        var providers = $.api.app.getQueryVariable("supports").split(",");
        $('[data-providerName]').hide();

        for (var i = 0; i < providers.length; i++) {
            $('[data-providerName="' + providers[i] + '"]').show();
        }


        if (platformName === "amazon") {//never show amazon
            $('[data-providerName="gcir"]').hide();
        }

        //We handle the FB/TW logins outside of the games
        //so we can show link
        if (platformName === "steam") {
            $('[data-providerName="tw"]').show();
            $('[data-providerName="fb"]').show();
        }
        $('[data-providerName="email"]').show();
    }
    else {

        var allowProvider = false;
        switch (platformName) {

            case "amazon":

                switch ($.api.app.appID) {
                    //game circle is only enabled for these games 
                    case 1: /** BMC */
                    case 2: /** Battles */
                    case 3: /** SAS4 */
                    case 6: /** Fortress */
                    case 8: /** TK */
                    case 10: /** BSM */
                        allowProvider = true;
                        break;
                }
                break;
            default:
                allowProvider = true;
                break;
        }

        if (allowProvider === true) {
            var platformLogin = $('#optional_login_' + platformName);
            platformLogin.show();
        }
    }

}

var changeLanguage = function (event) {
    var language = event.currentTarget.dataset.lang;
    var newURL = window.location.href;
    if (newURL.indexOf("language=") !== -1) {
        newURL = window.location.href.replace(/(language=)[^\&]+/, '$1' + language);
    } else {
        newURL += "&language=" + language;
    }

    window.location = newURL;
}

var showModal = function (title, path) {

    path = path.replace("[[appid]]", 4);


    var useLocale = $.api.app.getQueryVariable("local");

    //path = path.replace("[[locale]]", useLocale);

    $('#privacy_terms_modal').modal();
    $('#privacy_terms_modal_title').html(title);
    // $('#privacy_terms_modal_body_iframe').attr('src', path + "?cb=" + Date.now() + "&locale=" + useLocale);
    // return;
    $.ajax({
        url: path,
        complete: function (result) {
            if (result.status === 200) {
                $('#privacy_terms_modal_body').html(result.responseText);
            }
            else {
                $('#privacy_terms_modal_body').html("An error occured loading this document: " + result.statusText + "<br><br><a style='text-decoration:underline' target='_blank' href='" + path + "'>Click here to try loading the file in your browser</a>");
            }

        }
    })


};

var ageGateAge = 16;
var isInEU = false;

var getCountry = function (callback) {
    var done = false;
    var start = new Date().getTime();
    var doneCallback = function (source) {

        // var xhttp = new XMLHttpRequest();
        // xhttp.open("POST", "https://analytics.ninjakiwi.com/link/mobile/latency", true);
        // xhttp.setRequestHeader("Content-type", "application/json");
        // xhttp.send(JSON.stringify({
        //     avg: new Date().getTime(),
        //     ua: source
        // }));

        if (done === true) {
            return;
        }
        done = true;
        $('[data-agegate-display=true]').html(ageGateAge);

        try {
            var event = new CustomEvent("euConfirmation", { detail: { isInEU: isInEU } });
            // Dispatch/Trigger/Fire the event
            window.dispatchEvent(event);
        }
        catch (e) {
            var event = document.createEvent('CustomEvent');
            event.initCustomEvent("euConfirmation", false, false, { detail: { isInEU: isInEU } });
            // Dispatch/Trigger/Fire the event
            window.dispatchEvent(event);
        }

        switch ($.api.app.appID) {
            case 16:
                $('[data-ageCheck=cn]').show();
                $('[data-ageCheck=nk]').hide();
                break;
        }

        setTimeout(function () {
            //$('#main').css('opacity', 100);
            $('#main').fadeTo(100, 1);
            if (callback) {
                setTimeout(function () {
                    try {
                        callback();
                    } catch (e) { }
                }, 200)

            }
        }, 150)

    }
    $.api.app.request("/utility/country", {}, function (error, response) {

        if (response && response.inEU === true) {
            ageGateAge = 16;
            isInEU = true;
        } else {
            ageGateAge = 13;
            isInEU = false;
        }

        doneCallback("api");
    }, function () {
        isInEU = true;
        doneCallback("api_e");
    });;

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.readyState, this.statusText, this.responseText);
            if (this.responseText === "yes") {
                ageGateAge = 16;
                isInEU = true;
                doneCallback("wrk");
            } else if (this.responseText === "no") {
                ageGateAge = 13;
                isInEU = false;
                doneCallback("wrk");
            }
        }
    };
    xhttp.open("GET", "https://api.ninjakiwi.com/eu", true);
    xhttp.send();

}

var latencyTest = function (testsLeft, totalRequestTime, min, max) {

}

var showToolTip = function (id, duration) {
    $(id).tooltip('show');
    setTimeout(function () {
        $(id).tooltip('hide');
    }, duration)
}

var beginRedirect = function (url, data) {

    $('#boom').fadeIn();

    setTimeout(function () {
        $.api.navigation.sendToSDK(url, data);
    }, 10);

}

var blockNonASCII = function (target) {
    var limit = 14;

    var reg = /[^a-zA-Z0-9\!\@\$\%\_\(\)\;\:\-\=\+\<\>\ ]+/;

    var currentValue = target.value;
    // Test for only whitespace
    if (currentValue.length > 0 && !/[^\s]/.test(currentValue)) {
        //showToolTipWithText("#" + target.id, locale["html/character_not_supported"], locale["html/display_name_too_short"]);
        //return;
    }

    if (reg.test(currentValue)) {

        var newValue = "";
        for (var i = 0; i < currentValue.length; i++) {
            if (!reg.test(currentValue.charAt(i))) {
                newValue += currentValue.charAt(i);
            }
        }
        target.value = newValue;
        var strippedReg = reg.toString().replace("/[^", "").replace(/\\/g, " ").replace("]+/", "");
        showToolTipWithText("#" + target.id, locale["html/character_not_supported"], locale["html/display_name_valid_characters"].replace("{{CHARS}}", strippedReg));
    }

    if (currentValue.length > limit) {
        showToolTipWithText("#" + target.id, locale["html/display_name_too_long"], locale["html/display_name_max_length"].replace("{{LIMIT}}", limit));
        target.value = currentValue.substring(0, limit);
    }
}

window.onerror = function (message, source, lineno, colno, error) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://analytics.ninjakiwi.com/link/mobile/sdkerror", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify({
        message: message,
        source: source,
        lineno: lineno,
        colno: colno
    }));
}

var currentPage = "#main";
var previousPage = null;
var changePage = function (nextPage, addState) {

    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://analytics.ninjakiwi.com/link/mobile/sdk", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify({
        info: nextPage,
        currentPage: currentPage,
        agent: navigator.userAgent
    }));

    if (nextPage === currentPage) {
        return;
    }

    if (addState === true) {
        try {
            history.pushState({
                currentPage: currentPage
            }, "mystate");
        } catch (e) {
            if (window.onerror) {
                window.onerror("Couldn't add state: " + nextPage + " from " + currentPage, "sdk17.js", 0, 0, e);
            }
        }
    }

    $(currentPage).fadeOut();
    setTimeout(function () {
        $(nextPage).fadeIn();
        previousPage = currentPage;
        currentPage = nextPage;
        window.scrollTo(0, 0);
    }, 300)
}

var back = function () {
    changePage(previousPage);
}