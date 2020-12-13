Notification.requestPermission(function (permission) {
});

function fillProxiesTable() {
    var proxySetting = JSON.parse(localStorage.proxySetting);
    document.querySelector('td:nth-child(2)').innerHTML = proxySetting['http_host'];
    document.querySelector('td:nth-child(3)').innerHTML = proxySetting['http_port'];
    document.querySelector('td:nth-child(4)').innerHTML = proxySetting['auth']['user'];
    document.querySelector('td:nth-child(5)').innerHTML = proxySetting['auth']['pass'];
}

$(document).on('click', '#editProxyIcon', function () {
    var proxySetting = JSON.parse(localStorage.proxySetting);
    document.querySelector('#proxyEntry').value = proxySetting['http_host'];
    document.querySelector('#portEntry').value = proxySetting['http_port'];
    document.querySelector('#loginEntry').value = proxySetting['auth']['user'];
    document.querySelector('#passwordEntry').value = proxySetting['auth']['pass'];
});

$(document).on('click', '#manualSetProxyButton', function () {
    $(this).blur();

    if (document.querySelector('#proxyEntry').value.trim() === "" || document.querySelector('#portEntry').value.trim() === "") {
        alert(chrome.i18n.getMessage("main_notification_4"));
        return;
    }

    if (!validateIP(document.querySelector('#proxyEntry').value.trim())) {
        alert(chrome.i18n.getMessage("main_notification_4"));
        return;
    }

    var proxy = {
        host: document.querySelector('#proxyEntry').value.trim(),
        port: document.querySelector('#portEntry').value.trim(),
        user: document.querySelector('#loginEntry').value.trim(),
        password: document.querySelector('#passwordEntry').value.trim()
    };

    syncProxy(proxy);
    setProxy(proxy);

    localStorage.ID = JSON.parse(localStorage.mainProxiesList).length - 1;

    document.querySelector('#proxyEntry').value = "";
    document.querySelector('#portEntry').value = "";
    document.querySelector('#loginEntry').value = "";
    document.querySelector('#passwordEntry').value = "";

    fillProxiesTable();
});

$(document).on('click', '#fastSetProxyButton', function () {
    $(this).blur();

    if (document.querySelector('#proxyDataEntry').value.trim() === "") {
        alert(chrome.i18n.getMessage("main_notification_4"));
        return;
    }

    proxyData = document.querySelector('#proxyDataEntry').value.trim();

    separators = [':', '@', '#', '|'];
    separators.forEach(function(item, i, arr) {
        proxyData = proxyData.split(item).join("~/~");
    });
    proxyData = proxyData.split("~/~");

    if (proxyData.length == 2 || proxyData.length == 4) {
        if (proxyData.length == 2) {
            if (!validateIP(proxyData[0])) {
                alert(chrome.i18n.getMessage("main_notification_4"));
                return;
            }
            proxyData[2] = "";
            proxyData[3] = "";
        } else {
            if (!validateIP(proxyData[0])) {
                if (!validateIP(proxyData[2])) {
                    alert(chrome.i18n.getMessage("main_notification_4"));
                    return;
                } else {
                    proxyData[2] = [proxyData[0], proxyData[0] = proxyData[2]][0];
                    proxyData[3] = [proxyData[1], proxyData[1] = proxyData[3]][0];
                }
            }
        }
    } else {
        alert(chrome.i18n.getMessage("main_notification_4"));
        return;
    }

    var proxy = {
        host: proxyData[0],
        port: proxyData[1],
        user: proxyData[2],
        password: proxyData[3]
    };

    syncProxy(proxy);
    setProxy(proxy);

    localStorage.ID = JSON.parse(localStorage.mainProxiesList).length - 1;

    document.querySelector('#proxyDataEntry').value = "";

    fillProxiesTable();
})

$(document).on('click', '#confirmSelectProxyButton', function () {
    index = 1;

    if (document.querySelector('#selectProxySelect').value != "Выбрать прокси") {
        var ip = document.querySelector('#selectProxySelect').value;
    } else {
        var ip = document.querySelector('#selectProxyEntry').value.trim();
    }

    var apiProxiesList = JSON.parse(localStorage.apiProxiesList);

    apiProxiesList.forEach((item, i) => {
        if (item['ip'] == ip) {
            index = i + 1;
        }
    });

    this.blur();
    document.querySelector('#selectProxy').hidden = true;
    document.querySelector('#apiKeyEntry').disabled = false;
    document.querySelector('#apiKeyEntry').value = "";
    document.querySelector('#getProxyFromApiButton').disabled = false;
    // document.querySelector('#getProxyFromApiButton').innerHTML = "Получить прокси";
    updateLocalization();
    document.querySelector('.navbar').scrollIntoView();
    setProxyFromApi(index);
});

$(document).on('click', '#addAllProxiesButton', function () {
    this.blur();

    var apiProxiesList = JSON.parse(localStorage.apiProxiesList);
    var mainProxiesList = JSON.parse(localStorage.mainProxiesList);
    var index = apiProxiesList.length - 1;

    apiProxiesList.forEach(function (proxy, i) {
        if (i != index - 1) {
            var proxySetting = JSON.parse(localStorage.proxySetting);
            proxySetting['http_host'] = proxy['ip'];
            proxySetting['http_port'] = proxy['port_http'];
            proxySetting['auth']['enable'] = "";
            proxySetting['auth']['user'] = proxy['login'];
            proxySetting['auth']['pass'] = proxy['pass'];
            mainProxiesList.push(proxySetting);
        }
    });

    localStorage.mainProxiesList = JSON.stringify(mainProxiesList);

    document.querySelector('#selectProxy').hidden = true;
    document.querySelector('#apiKeyEntry').disabled = false;
    document.querySelector('#apiKeyEntry').value = "";
    document.querySelector('#getProxyFromApiButton').disabled = false;
    // document.querySelector('#getProxyFromApiButton').innerHTML = "Получить прокси";
    updateLocalization();
    document.querySelector('.navbar').scrollIntoView();
    setProxyFromApi(index);
});

$(document).on('click', '#getProxyFromApiButton', function () {

    this.blur();

    if (document.querySelector('#apiKeyEntry').value.trim() === "") {
        alert(chrome.i18n.getMessage("main_notification_2"));
        return;
    }

    var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;

    var xhr = new XHR();

    var apiKey = document.querySelector('#apiKeyEntry').value;
    xhr.timeout = 5000;
    xhr.open('GET', 'https://proxys.io/ru/api/v2/ip?key=' + apiKey, true);

    document.querySelector('#getProxyFromApiButton').innerHTML = chrome.i18n.getMessage("main_optional_text_1");
    document.querySelector('#getProxyFromApiButton').disabled = true;

    xhr.onload = function () {

        if (xhr.status === 403) {
            // alert('Заблокирован доступ к нашему API, попробуйте решить капчу на нашем сайте или отключить прокси.');
            alert(chrome.i18n.getMessage("main_notification_1"))
            window.open("https://proxys.io");
            // document.querySelector('#getProxyFromApiButton').innerHTML = "Получить прокси";
            updateLocalization();
            return;
        }

        var data = this.responseText;

        data = JSON.parse(data);

        if (data.success == true) {

            document.querySelector('#getProxyFromApiButton').innerHTML = chrome.i18n.getMessage("main_optional_text_2");
            document.querySelector('#apiKeyEntry').disabled = true;
            document.querySelector('#getProxyFromApiButton').disabled = true;

            var apiProxiesList = [];
            var proxyLogin;
            var proxyPass;

            if (data['data'].length != undefined) {
                data['data'].forEach((order, i) => {
                    // proxyLogin = order['username'];
                    // proxyPass = order['password'];
                    order['list_ip'].forEach((proxy, i) => {
                        proxy['login'] = order['username'];
                        proxy['pass'] = order['password'];
                        apiProxiesList.push(proxy);
                    });
                });
            } else {
                // proxyLogin = data['data']['username'];
                // proxyPass = data['data']['password'];
                data['data']['list_ip'].forEach((proxy, i) => {
                    proxy['login'] = data['data']['username'];
                    proxy['pass'] = data['data']['password'];
                    apiProxiesList.push(proxy);
                });
            }

            localStorage.apiProxiesList = JSON.stringify(apiProxiesList);
            // localStorage.proxyLogin = proxyLogin;
            // localStorage.proxyPass = proxyPass;

            if (apiProxiesList.length == 1) {
                setProxyFromApi(1);
            } else {
                document.querySelector('#selectProxy').hidden = false;
                document.querySelector('#selectProxy').scrollIntoView();
                var selectProxySelect = document.querySelector('#selectProxySelect');
                selectProxySelect.innerHTML = `<option disabled="disabled" selected="selected" data-resource="main_option_text_1"></option>`;
                updateLocalization();
                document.querySelector('#getProxyFromApiButton').innerHTML = chrome.i18n.getMessage("main_optional_text_2");
                apiProxiesList.forEach((item, i) => {
                    let newOption = new Option(item['ip']);
                    selectProxySelect.append(newOption);
                });
            }
        } else {
            document.querySelector('#getProxyFromApiButton').innerHTML = "Получить прокси";
            updateLocalization();
            alert(chrome.i18n.getMessage("main_notification_2"));
        }

    }

    xhr.onerror = function () {
        alert(chrome.i18n.getMessage("main_notification_3"));
        // document.querySelector('#getProxyFromApiButton').innerHTML = "Получить прокси";
        document.querySelector('#getProxyFromApiButton').disabled = false;
        updateLocalization();
    }

    xhr.ontimeout = function () {
        alert(chrome.i18n.getMessage("main_notification_3"));
        // document.querySelector('#getProxyFromApiButton').innerHTML = "Получить прокси";
        document.querySelector('#getProxyFromApiButton').disabled = false;
        updateLocalization();
    }

    xhr.send();

});

function setProxyFromApi(index) {
    index--;

    var apiProxiesList = JSON.parse(localStorage.apiProxiesList);

    var proxy = {
        host: apiProxiesList[index]['ip'],
        port: apiProxiesList[index]['port_http'],
        user: apiProxiesList[index]['login'],
        password: apiProxiesList[index]['pass']
    };

    syncProxy(proxy);
    setProxy(proxy);


    localStorage.ID = JSON.parse(localStorage.mainProxiesList).length - 1;

    fillProxiesTable();
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


$(document).ready(function() {
	fillProxiesTable();
    updateLocalization();
});
