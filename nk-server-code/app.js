if ($.api === undefined) {
    $.api = {};
}
$.api.app = {

    currentUser: "",

    restoreSession: function (toRestore) {

        if (toRestore == "session" || toRestore == "all") {
            this.sessionID = this.getCookie("sessionID");
        }

        this.setAppInfo([
            this.getCookie("appID"),
            this.getCookie("skuID"),
            this.getCookie("skuSignature"),
        ])
    },

    logout: function (dontRefresh) {

        this.setCookie("sessionID", "");
        this.setCookie("appID", "");
        this.setCookie("skuID", "");
        this.setCookie("skuSignature", "");
        $.api.app.sessionID = null;
        $.api.app.skuID = null;
        $.api.app.appID = null;
        localStorage.clear();
        if (dontRefresh !== true) {
            location.reload();
        }

    },

    userDetailsBackup: function (nkapiID, displayName, shortcode) {
        $.api.app.backup = {};
        $.api.app.backup.nkapiID = nkapiID;
        $.api.app.backup.displayName = displayName;
        $.api.app.backup.shortcode = shortcode;
    },

    request: function (endpoint, body, callback, errorCallback, blockInput, method) {

        var bodyString = JSON.stringify(body);

        setTimeout(function () {

            var md5 = "";
            var nonce = new Date().getTime().toString(36) + Math.random();
            var x = undefined;

            if (bodyString.length > 1024 * 1024) {
                var length = 1024 * 1024;
                md5 = "W/" + length + "/" + hex_md5($.api.app.sessionID + $.api.app.skuSignature + bodyString.substr(0, length) + nonce);
            } else if ($.api.app.sessionID != null) {
                md5 = hex_md5($.api.app.sessionID + $.api.app.skuSignature + bodyString + nonce);
            } else {
                md5 = hex_md5($.api.app.skuSignature + bodyString + nonce);
            }

            var postBody = {
                data: bodyString,
                auth: {
                    appID: $.api.app.appID,
                    skuID: $.api.app.skuID,
                    session: $.api.app.sessionID ? $.api.app.sessionID : undefined
                },
                sig: md5,
                nonce: nonce
            };

            if (blockInput === undefined || blockInput == true) {
                // UI Loader Start
                $('#boom').fadeIn();
                try {
                    addNotification("Task Started", "info", 10000);
                } catch (e) { }
                //$('#loader_hide').hide();
                // setTimeout(function () {
                //     $('#loader_hide').fadeIn();
                // }, 1000)
            }

            $.ajax({
                url: $.api.app.getApiHost() + endpoint,
                headers: {
                    "nk_locale": $.api.app.getCurrentLocale()
                },
                method: method === undefined ? "POST" : method,
                data: JSON.stringify(postBody),
                contentType: "application/json; charset=utf-8",
                dataType: "text",
                timeout: 180 * 1000,
            })
                .done(function (data) {

                    var dataJSON = null;
                    try {
                        dataJSON = JSON.parse(data);
                    } catch (e) {

                    }

                    if (dataJSON === null) {
                        window.onerror("Call to " + $.api.app.getApiHost() + endpoint + " returned " + data, "sdk17.js", 0, 0, "");
                        var errorObject = {
                            type: "NETWORK ERROR",
                            error: data
                        };
                        if (errorCallback) {
                            errorCallback(errorObject);
                        } else {
                            $.api.app.error(errorObject);
                        }
                        return;
                    }

                    var dataStr = JSON.stringify(dataJSON);
                    var rawData = JSON.parse(dataStr);

                    if (typeof dataJSON.data == "string") {
                        dataJSON.data = JSON.parse(dataJSON.data);
                    }

                    if (dataJSON.error && errorCallback === undefined) {
                        $.api.app.error(dataJSON.error);
                        return;
                    }
                    callback(dataJSON.error, dataJSON.data, rawData);
                }).error(function (error) {

                    if (window.location.pathname.indexOf("admin") !== -1 && document.cookie.indexOf("sessionID") === -1) {
                        if ($.api.app.blockLoginPrompt === true) {
                            return;
                        }
                        $.api.app.blockLoginPrompt = true;
                        window.open("/moab/oauth/start", "", "width=600,height=480");
                        return;
                    }

                    var errorObject = {
                        type: "NETWORK ERROR",
                        error: error.responseText,
                        endpoint: endpoint,
                        rawError: error
                    };

                    if (errorCallback) {
                        errorCallback(errorObject);
                    } else {
                        $.api.app.error(errorObject);
                    }
                }).complete(function () {

                    if (blockInput === undefined || blockInput == true) {

                        // UI Loader Start
                        $('#boom').fadeOut();
                        // Close all existing notifications
                        $('.notifyjs-wrapper').each(function (i, obj) {
                            $(this).trigger('notify-hide');
                        });
                        // Show task success notification
                        try {
                            addNotification("Task Completed", "success");
                        } catch (e) { }
                    };
                });

        }, 1)

    },

    error: function (errorDetails) {

        /*$('<div>').simpledialog2({
            mode: 'blank',
            headerText: "Error",
            headerClose: true,
            forceInput: false,
            blankContent: "<pre>" + JSON.stringify(errorObject, null, 4) + "</pre>"
        })*/

        var linkErrorPayload = errorDetails.error ? JSON.parse(errorDetails.error).error : null;
        var endpoint = errorDetails.endpoint;

        var other = {};
        $('#error_reason').val(endpoint);
        $('#error_other').val(JSON.stringify(errorDetails));

        if (linkErrorPayload === null) {
            try {
                $('#error_type').val(errorDetails.type + " / " + errorDetails.rawError.statusText);
            } catch (e) { }
            $('#error_fix').val("The endpoint took too long to respond or the server could not be reached. Full error details are below")
        }
        else {
            if (linkErrorPayload.type == "ERR_ACCESS_DENIED") {
                $('#popup_access_permission').html(errorDetails.missing)
                $('#popup_access').popup("open");
                return;
            }
            else {
                $('#error_type').val("Server Error / " + linkErrorPayload.type);
                if (linkErrorPayload.details) {
                    $('#error_fix').val(linkErrorPayload.details.reason + "." + linkErrorPayload.details.fix);
                }
                else {
                    $('#error_fix').val("This error has been reported to the infra team")
                }
            }
        }




        try {
            $('#popup_error').popup("open");
        } catch (e) { }

    },

    setSession: function (sessionID) {
        this.setCookie("sessionID", sessionID, 60);
        this.sessionID = sessionID;
    },

    setAppInfo: function (appInfo) {

        this.appID = parseInt(appInfo[0]);
        this.skuID = parseInt(appInfo[1]);
        this.skuSignature = appInfo[2];

        this.setCookie("appID", this.appID, 90);
        this.setCookie("skuID", this.skuID, 90);
        this.setCookie("skuSignature", this.skuSignature, 90);

        try {
            window.dispatchEvent(new Event("appInfoAvailable"));
        } catch (e) {
            //Fallback for really old Android devices running 4.2.x
            getCountry();
        }

        if (this.appID === 0) {
            $('#boom').show();
            $('#appIDError').modal("show");
        }

    },

    setCurrentProviders: function (loggedInProviders) {
        this.loggedInProviders = loggedInProviders;
        try {
            window.dispatchEvent(new Event("loggedInProvidersAvailable"));
        } catch (e) {
        }

    },

    setCookie: function (c_name, value, exdays) {
        if (exdays === undefined) {
            exdays = 1;
        }

        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        // var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());

        try {
            Cookies.set(c_name, value, { SameSite: "None", expires: exdate, path: '/admin', secure: (window.location.toString().indexOf("ninjakiwi.com") != -1 ? true : false) })

        }
        catch (e) {
            document.cookie = c_name + "=" + value + ";" + (window.location.toString().indexOf("ninjakiwi.com") != -1 ? "secure" : "");

        }
        // 
        // Using js-cookie library https://github.com/js-cookie/js-cookie
    },

    getCookie: function (c_name) {

        try {
            // Using js-cookie library https://github.com/js-cookie/js-cookie
            return Cookies.get(c_name);
        } catch (e) {
            //lets fall back to the old code
            var i, x, y, ARRcookies = document.cookie.split(";");
            for (i = 0; i < ARRcookies.length; i++) {
                x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
                y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
                x = x.replace(/^\s+|\s+$/g, "");
                if (x == c_name) {
                    return unescape(y);
                }
            }
        }
    },

    syntaxHighlight: function (json) {
        if (typeof json != 'string') {
            json = JSON.stringify(json, undefined, 2);
        }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    },

    getApiHost: function () {

        if (window.location.toString().indexOf("api-staging.ninjakiwi.com") != -1) {
            return "//api-staging.ninjakiwi.com";
        } else if (window.location.toString().indexOf("api.ninjakiwi.com") != -1) {
            return "//api.ninjakiwi.com";
        } else {
            return "";
        }
    },

    getStaticHost: function (deployment) {

        var host = "https:"
        if (deployment === "staging" || window.location.toString().indexOf("api-staging.ninjakiwi.com") != -1) {
            host += "//static-api-staging.nkstatic.com";
        } else if (deployment === "production" || window.location.toString().indexOf("api.ninjakiwi.com") != -1) {
            host += "//static-api.nkstatic.com";
        } else {
            host += '//s3.amazonaws.com/nkapi-user-documents-dev';
        }

        if (host.indexOf("https") != -1) {
            host = host.replace("static.api", "static-api");
        }
        return host;
    },

    getPriorityStaticHost: function () {

        var host = location.protocol;
        if (window.location.toString().indexOf("api-staging.ninjakiwi.com") != -1) {
            host += "//priority-static-api-staging.nkstatic.com/storage/static";
        } else if (window.location.toString().indexOf("api.ninjakiwi.com") != -1) {
            host += "//priority-static-api.nkstatic.com/storage/static";
        } else {
            host += '//s3.amazonaws.com/nkapi-user-documents-dev';
        }

        if (host.indexOf("https") != -1) {
            host = host.replace("static.api", "static-api");
        }
        return host;
    },
    getCFStaticHost: function () {
        var host = "https:";
        if (window.location.toString().indexOf("api-staging.ninjakiwi.com") != -1) {
            host += "//static-api-staging.nkstatic.com";
        } else if (window.location.toString().indexOf("api.ninjakiwi.com") != -1) {
            host += "//static-api.nkstatic.com";
        } else {
            host += '//s3.amazonaws.com/nkapi-user-documents-dev';
        }

        return host;
    },
    getBucket: function (deployment) {

        if (deployment === "staging" || (deployment === undefined && window.location.toString().indexOf("api-staging.ninjakiwi.com") != -1)) {
            return "nkapi-user-documents-staging";
        } else if (deployment === "production" || (deployment === undefined && window.location.toString().indexOf("api.ninjakiwi.com") != -1)) {
            return "nkapi-user-documents-production";
        } else {
            return 'nkapi-user-documents-dev';
        }
    },

    getBucketForDeployment: function (deployment) {

        if (deployment === "staging") {
            return "nkapi-user-documents-staging";
        } else if (deployment === "production") {
            return "nkapi-user-documents-production";
        } else {
            return 'nkapi-user-documents-dev';
        }
    },

    getQueryVariable: function (variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == variable) {
                return decodeURIComponent(pair[1]);
            }
        }
    },

    getFragmentValue: function (variable) {
        var query = window.location.hash.substr(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == variable) {
                return decodeURIComponent(pair[1]);
            }
        }
    },

    setCurrentUser: function (nkapiID, displayName) {
        this.currentUser = nkapiID;

        var previousUsers = localStorage.previousUsers;
        if (previousUsers == null) {
            previousUsers = [];
        } else {
            previousUsers = JSON.parse(previousUsers);
        }

        for (var index in previousUsers) {
            if (previousUsers[index].nkapiID == nkapiID) {
                return;
            }
        }
        previousUsers.unshift({
            nkapiID: nkapiID,
            displayName: displayName
        });

        if (previousUsers.length >= 10) {
            previousUsers.pop();
        }

        localStorage.setItem("previousUsers", JSON.stringify(previousUsers));
    },

    getCurrentUser: function () {
        return this.currentUser;
    },

    getCurrentLocale: function () {

        var locale = this.getQueryVariable("locale");
        if (locale) {
            this.setCookie("locale", this.getQueryVariable("locale"));
        } else {
            locale = this.getCookie("locale");
        }
        return locale ? locale : "en";
    },

    hideLoader: function () {
        $('#boom').fadeOut();
    },


    addClicker: function (search, handler) {
        if ($(search).length > 1) {
            return;
        }
        $(search).click(handler);
    },
    writeClipboard: function (text) {
        navigator.clipboard.writeText(text);
    },
    readClipboard: function () {
        navigator.clipboard.readText().then(function (clipText) {
            console.log(clipText);
            return clipText;
        });
    },
    getTimeFormat: function () {
        return "MMM DD, YYYY HH:mm:ss";
    },
    getAppName: function (appID) {
        var appName = "";
        $.each(ddData, function (index, appData) {
            var currentAppID = appData.value.split(":")[0];

            if (appID == currentAppID) {
                appName = appData.description.split("-")[0].trim();
            }
        });
        return appName;
    }
};

$.api.userUtils = {

    isPlatformProviderLinked: function (user) {
        var found = false;
        user.providersAvailable.forEach(function (provider) {
            switch (provider) {
                case "gc":
                case "gp":
                case "gcir":
                    found = true;
            }
        })
        return found;
    },

    isProviderAlreadyLinked: function (user, findProvider) {

        if ($.api.user.login.currentUser == null) {
            return;
        }

        var found = false;
        user.providersAvailable.forEach(function (provider) {
            if (findProvider == provider) {
                found = true;
            }
        })
        return found;
    }
}

$.api.navigation = {

    currentModule: null,
    moduleName: null,
    moduleFolder: "shared",
    previousElement: null,
    timeoutRefs: [],
    popupRefs: {},
    update: function (data, isFromPop, querystring) {

        for (var key in $.api.navigation.popupRefs) {
            if ($.api.navigation.popupRefs[key].closed) {
                delete $.api.navigation.popupRefs[key];
            }
        }
        if (Object.keys($.api.navigation.popupRefs).length != 0) {
            if (!confirm("You have " + Object.keys($.api.navigation.popupRefs).length + " popup windows open, do you want to navigate away and close these windows?")) {
                return;
            }

            $.api.navigation.flushPopupRefs();
        }

        if ($.api.navigation.allowPageNavigation() == false) {
            return;
        }

        var moduleName;

        if (typeof data == "string") {
            moduleName = data;
        } else {
            moduleName = $(this).data("value");
        }

        $.api.navigation.moduleName = moduleName;

        $('#navigation_choice').val(moduleName);
        if (!$(this).hasClass("hotbar_page")) {
            $(this).addClass("selected");
        }
        if (moduleName == "") {
            return;
        }

        // Send page anylitics - track how many times a page has been visted
        var environment = window.location.toString().includes("api.ninjakiwi.com") ? "production" : "staging";
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "https://analytics.ninjakiwi.com/link/mobile/librato", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify({
            metricname: "admin:" + environment + ":" + moduleName,
            count: 1
        }));

        if ($.api.navigation.previousElement) {
            $($.api.navigation.previousElement).removeClass("selected");
        }
        $.api.navigation.previousElement = this;

        $.api.navigation.reload();
        if (isFromPop !== true) {
            if (querystring !== undefined) {
                history.pushState(null, null, "/admin/?${querystring}#${moduleName}");
            }
            else {
                history.pushState(null, null, "/admin/#" + moduleName);
            }

        }
        window.scrollTo(0, 0);
        try {
            document.getElementById('feature-container').scrollTo(0, 0);
        } catch (e) { }
    },

    reload: function () {

        $.api.navigation.flushTimeouts();
        var currentModule = $('#navigation_choice').val();
        $.ajax({
            url: "/" + $.api.navigation.moduleFolder + "/modules/" + currentModule + ".html",
            method: "GET"
        })
            .done(function (data) {

                $('#feature-container').html("----");
                $('#feature-container').html(data);
                var parts = currentModule.split("-");
                var module = $.api;
                while (parts.length != 0) {
                    module = module[parts.shift()];
                }
                module.start();
                $.api.navigation.currentModule = module;
                $('#admin').trigger("create")

                //Show a warning if the input isn't a nkapiID
                $('[data-currentUser]').on('input', function (event) {
                    var target = event.currentTarget;
                    var value = target.value;
                    if (value.length !== 24 && value.toLowerCase().startsWith("no_") === false) {
                        target.style.background = 'rgba(255,0,255,0.1)';
                        target.title = "This input expects an nkapiID or no_link id";
                    }
                    else {
                        target.style.background = 'inherit'
                        target.title = null;
                    }
                })
            })
    },


    flushTimeouts: function () {
        if ($.api.navigation.timeoutRefs) {
            $.api.navigation.timeoutRefs.forEach(function (timeoutRef) {
                clearInterval(timeoutRef)
            });
        }
        $.api.navigation.timeoutRefs = [];
    },

    addTimeoutRef: function (timeoutRef) {
        $.api.navigation.timeoutRefs ? $.api.navigation.timeoutRefs.push(timeoutRef) : $.api.navigation.timeoutRefs = [timeoutRef];
    },

    addPopupRef: function (popup, key) {

        var stillOpen = true;
        try {
            stillOpen = !$.api.navigation.popupRefs[key].closed;
        } catch (e) {
            stillOpen = false;
        }

        if (stillOpen === true && $.api.navigation.popupRefs[key]) {
            if (confirm("You already have a popup for this feature open. Do you want to close the old popup?")) {
                $.api.navigation.popupRefs[key].close();
                $.api.navigation.popupRefs[key] = null;
            }
        }

        $.api.navigation.popupRefs[key] = popup;
        popup.onclose = function () {
            console.log("closed " + key);
        }

    },

    flushPopupRefs: function () {
        for (var key in $.api.navigation.popupRefs) {
            $.api.navigation.popupRefs[key].close();
        }
        $.api.navigation.popupRefs = {};
    },

    flushPopupRef: function (name) {
        delete $.api.navigation.popupRefs[name]
    },

    sendToSDK: function (url, data) {


        if (url === "//close") {
            //lets clean up and timers and intervals
            var tID = setTimeout(function () { }, 1000);
            while (tID !== -1) {
                clearTimeout(tID);
                tID--;
            }

            var iID = setInterval(function () { }, 1000);
            while (iID !== -1) {
                clearInterval(iID);
                iID--;
            }
        }
        // check for query parameters passed when loading this SDK
        var testMode = $.api.app.getQueryVariable("browser") == "true";
        var unityMode = $.api.app.getQueryVariable("unity") == "true";

        // add the data to the url string, if any was passed
        if (data != null) {
            // base64 encode the data
            var dataAsString = JSON.stringify(data);
            var dataAsBase64 = btoa(dataAsString);
            // add it as a query parameter
            if (url.indexOf("?") == -1) {
                url += "?data=" + dataAsBase64
            } else {
                url += "&data=" + dataAsBase64
            }
        }

        // add the protocol to the start of the url
        if (unityMode) {
            url = "uniwebview:" + url;
        } else {
            url = "http:" + url;
        }

        if ($.api.app.getQueryVariable("platform") == "winrt") {
            var full = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + "/";
            url = url.replace("http://", full)
        }

        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "https://analytics.ninjakiwi.com/link/mobile/sdk", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify({
            currentPage: currentPage,
            info: url.substring(0, 256),
            user: $.api.app.currentUser + " / " + ($.api.profile && $.api.profile.currentUser ? $.api.profile.currentUser.nkapiID : ""),
            agent: navigator.userAgent
        }));

        if (testMode) {
            // when testing in a browser, just log the results
            console.log(url);
        } else {
            // finally navigate to the url
            $.api.navigation.navigateWindow(url);
        }
    },

    navigateWindow: function (url) {

        if ($.api.app.getQueryVariable("platform") == "winrt") {
            window.location.href = url;
        } else {
            window.location = url;
        }

    },

    allowPageNavigation: function () {
        var prompt = $.api.navigation.beforeUnload();
        if (prompt) {
            return confirm(prompt);
        }

        return true;
    },
    beforeUnload: function () {
        if ($.api.navigation.currentModule && $.api.navigation.currentModule.promptOnLeave) {
            return $.api.navigation.currentModule.promptOnLeave();
        }
    },
};

$(window).bind('beforeunload', $.api.navigation.beforeUnload);

window.onpopstate = function (e) {
    if (window.location.hash !== "") {
        $.api.navigation.update(window.location.hash.substr(1), true);
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

function numberWithCommas(x) {
    if (x === null || x === undefined) {
        return x;
    }
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}