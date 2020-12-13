function updateUI() {

    updateLocalization();

    var proxySetting = JSON.parse(localStorage.proxySetting);

    var checkProxy = true;

    if (proxySetting['http_host'] === "") {
        document.querySelector('#offProxy').disabled = true;
        document.querySelector('#onProxy').disabled = true;
        document.querySelector('#selectProxySelect').disabled = true;
        iconSet("off");
    } else {
        chrome.proxy.settings.get({
                'incognito': false
            },
            function (config) {

                var selectProxySelect = document.querySelector('#selectProxySelect');

                var mode = config.value.mode.toString();
                if (mode == "direct") {
                    window.checkProxy = false;
                    selectProxySelect.innerHTML = `<option disabled="disabled" selected="selected" id="currentProxy" data-resource="popup_option_text_1">` + chrome.i18n.getMessage("popup_option_text_1") + `</option>`;
                    document.querySelector('#offProxy').disabled = true;
                    document.querySelector('#onProxy').disabled = false;
                    iconSet("off");
                } else {
                    window.checkProxy = true;
                    selectProxySelect.innerHTML = `<option disabled="disabled" selected="selected" id="currentProxy" data-resource="popup_option_text_1">` + chrome.i18n.getMessage("popup_option_text_1") + `</option>`;
                    document.querySelector('#offProxy').disabled = false;
                    document.querySelector('#onProxy').disabled = true;
                    var mainProxiesList = JSON.parse(localStorage.mainProxiesList);
                    document.querySelector('#currentProxy').innerHTML = mainProxiesList[localStorage.ID]['http_host'];
                    iconSet("on");
                }
                document.querySelector('#selectProxySelect').disabled = false;

                var mainProxiesList = JSON.parse(localStorage.mainProxiesList);

                mainProxiesList.forEach((item, i) => {
                    if (i != localStorage.ID || window.checkProxy == false) {
                        let newOption = new Option(item['http_host']);
                        newOption.value = i;
                        selectProxySelect.append(newOption);
                    }
                });

                select = document.getElementsByClassName('form-control')[0]
                select.onchange = function () {
                    localStorage.ID = select.value;

                    var proxyLogin = mainProxiesList[select.value]['auth']['user'];
                    var proxyPass = mainProxiesList[select.value]['auth']['pass'];
                    localStorage.proxyLogin = proxyLogin;
                    localStorage.proxyPass = proxyPass;

                    var proxy = {
                        host: mainProxiesList[select.value]['http_host'],
                        port: mainProxiesList[select.value]['http_port'],
                        user: proxyLogin,
                        password: proxyPass
                    };

                    var proxySetting = JSON.parse(localStorage.proxySetting);

                    proxySetting['http_host'] = proxy.host;
                    proxySetting['http_port'] = proxy.port;
                    proxySetting['auth']['enable'] = "";
                    proxySetting['auth']['user'] = proxy.user;
                    proxySetting['auth']['pass'] = proxy.password;

                    localStorage.proxySetting = JSON.stringify(proxySetting);

                    setProxy(proxy);

                    document.querySelector('#offProxy').disabled = false;
                    document.querySelector('#onProxy').disabled = true;
                }
            });
    }
}


$('#onProxy').click(function () {

    this.blur();

    proxy = onProxy();

    iconSet("on");

    var notification = new Notification(chrome.i18n.getMessage("notification_1") + " - " + proxy.host , {
        body: chrome.i18n.getMessage("notification_hit"),
        dir: 'auto',
        icon: 'icon.png'
    });

    document.querySelector('#offProxy').disabled = false;
    document.querySelector('#onProxy').disabled = true;

    updateUI();
});

$('#offProxy').click(function () {

    this.blur();

    offProxy();

    iconSet("off");

    var notification = new Notification(chrome.i18n.getMessage("notification_2"), {
        dir: 'auto',
        icon: 'icon.png'
    });

    document.querySelector('#offProxy').disabled = true;
    document.querySelector('#onProxy').disabled = false;

    updateUI();
});

$('#settingsButton').click(function () {
    window.open("options.html");
});

function uniqueArray(arr) {
    var hash = {},
        result = [];
    for (var i = 0, l = arr.length; i < l; ++i) {
        if (!hash.hasOwnProperty(arr[i])) {
            hash[arr[i]] = true;
            result.push(arr[i]);
        }
    }
    return result;
}

updateUI();
