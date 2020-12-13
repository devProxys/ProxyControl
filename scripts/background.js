chrome.commands.onCommand.addListener(function (command) {

    switch (command) {
        case "options":
            window.open("options.html");
            break;
        case "onProxy":
            proxy = onProxy();

            iconSet("on");

            var notification = new Notification(chrome.i18n.getMessage("notification_1") + " - " + proxy.host , {
                body: chrome.i18n.getMessage("notification_hit"),
                dir: 'auto',
                icon: 'icon.png'
            });
            break;
        case "offProxy":
            offProxy();

            iconSet("off");

            var notification = new Notification(chrome.i18n.getMessage("notification_2"), {
                dir: 'auto',
                icon: 'icon.png'
            });
            break;
        default:
            alert("I love you :)");
    }

});

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {

        var proxySetting = {
            'http_host': '',
            'http_port': '',
            'proxy_rule': 'singleProxy',
            'auth': {
                'enable': '',
                'user': '',
                'pass': ''
            }
        }

        localStorage.proxySetting = JSON.stringify(proxySetting);
        localStorage.mainProxiesList = JSON.stringify([]);
        localStorage.ID = -1;
        localStorage.whiteList = '<local>,192.168.0.0/16,172.16.0.0/12,169.254.0.0/16,10.0.0.0/8'
    }
});

function callbackFn(details) {
    var proxySetting = JSON.parse(localStorage.proxySetting);

    if (proxySetting) {
        var auth = proxySetting['auth'];
        var username = auth['user'];
        var password = auth['pass'];
    }

    if (proxySetting['auth']['user'] == '' &&
        proxySetting['auth']['pass'] == '')
        return {};

    return details.isProxy === !0 ? {
        authCredentials: {
            username: username,
            password: password
        }
    } : {}
}

chrome.webRequest.onAuthRequired.addListener(
    callbackFn, {
        urls: ["<all_urls>"]
    },
    ['blocking']);
