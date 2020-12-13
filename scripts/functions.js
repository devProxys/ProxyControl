function updateLocalization() {
    
    var elements = document.querySelectorAll('[data-resource]');
    elements.forEach(function(el) {
        let message = chrome.i18n.getMessage(el.getAttribute('data-resource'))
        if (el.getAttribute('data-resource').indexOf("placeholder") != -1) {
            el.placeholder = chrome.i18n.getMessage(el.getAttribute('data-resource'))
        } else if (el.getAttribute('data-resource').indexOf("title") != -1) {
            el.title = chrome.i18n.getMessage(el.getAttribute('data-resource'))
        } else {
            el.innerText = chrome.i18n.getMessage(el.getAttribute('data-resource'))
        }
    })

    var elements = document.querySelectorAll('[data-href]');
    elements.forEach(function(el) {
        let message = chrome.i18n.getMessage(el.getAttribute('data-href'))
        el.href = chrome.i18n.getMessage(el.getAttribute('data-href'))
    })
}

function validateIP(data) {
    var regex = /^([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])\.([01]?\d\d?|2[0-4]\d|25[0-5])$/;
    return regex.test(data);
}

function onProxy() {
    var proxySetting = JSON.parse(localStorage.proxySetting);

    var proxy = {
        type: 'http',
        host: proxySetting['http_host'],
        port: proxySetting['http_port']
    };

    var config = {
        mode: 'fixed_servers',
        pacScript: {},
        rules: {
            bypassList: [""]
        },
    };

    var rule = "singleProxy";

    var whiteList = localStorage.whiteList.split(',');

    config.rules.bypassList = uniqueArray(whiteList);

    config["rules"][rule] = {
        scheme: proxy.type,
        host: proxy.host,
        port: parseInt(proxy.port)
    };

    chrome.proxy.settings.set({
        value: config,
        scope: 'regular'
    }, function () {
    });

    localStorage.proxySetting = JSON.stringify(proxySetting);

    return proxy;
}

function offProxy() {
    var config = {
        mode: 'direct',
    };

    chrome.proxy.settings.set({
        value: config,
        scope: 'regular'
    }, function () {
    });
}

function iconSet(str) {

    var icon = {
        path: 'icons/on.png',
    }
    if (str == 'off') {
        icon['path'] = 'icons/off.png';
    }
    chrome.browserAction.setIcon(icon);
}

function setProxy(proxy) {

    var config = {
        mode: 'fixed_servers',
        pacScript: {},
        rules: {
            bypassList: [""]
        },
    };

    var rule = "singleProxy";

    var whiteList = localStorage.whiteList.split(',');

    config.rules.bypassList = uniqueArray(whiteList);

    config["rules"][rule] = {
        scheme: proxy.type,
        host: proxy.host,
        port: parseInt(proxy.port)
    };

    chrome.proxy.settings.set({
        value: config,
        scope: 'regular'
    }, function () {
    });

    var notification = new Notification(chrome.i18n.getMessage("notification_1") + " - " + proxy.host , {
        body: chrome.i18n.getMessage("notification_hit"),
        dir: 'auto',
        icon: 'icon.png'
    });

    iconSet("on");
}

function syncProxy(proxy) {
    var proxySetting = JSON.parse(localStorage.proxySetting);

    proxySetting['http_host'] = proxy.host;
    proxySetting['http_port'] = proxy.port;
    proxySetting['auth']['enable'] = "";
    proxySetting['auth']['user'] = proxy.user;
    proxySetting['auth']['pass'] = proxy.password;

    localStorage.proxySetting = JSON.stringify(proxySetting);

    var mainProxiesList = JSON.parse(localStorage.mainProxiesList);

    mainProxiesList.push(proxySetting);

    localStorage.mainProxiesList = JSON.stringify(mainProxiesList);
}

function uniqueArray(ar) {
    var j = {};

    ar.forEach(function (v) {
        j[v + '::' + typeof v] = v;
    });

    return Object.keys(j).map(function (v) {
        return j[v];
    });
}
