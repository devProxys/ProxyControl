function fillProxiesTable() {

    var proxiesList = JSON.parse(localStorage.mainProxiesList);

    var tbody = document.getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";

    if (proxiesList.length == 0) {
        tbody.innerHTML = '<tr><td>1</td><td></td><td></td><td></td><td></td><td width="7%"><img class="icon" src="icons/delete.svg"  data-resource="list_icon_title_1" /></td><td width="7%"><img class="icon" src="icons/apply.svg" data-resource="list_icon_title_2" /></td></tr>';
    }

    proxiesList.forEach((proxy, i) => {
        var row = document.createElement("tr");
        var number = document.createElement("td");
        number.appendChild(document.createTextNode(i + 1));
        var host = document.createElement("td");
        host.appendChild(document.createTextNode(proxy['http_host']));
        var port = document.createElement("td");
        port.appendChild(document.createTextNode(proxy['http_port']));
        var user = document.createElement("td");
        user.appendChild(document.createTextNode(proxy['auth']['user']));
        var pass = document.createElement("td");
        pass.appendChild(document.createTextNode(proxy['auth']['pass']));
        row.appendChild(number);
        row.appendChild(host);
        row.appendChild(port);
        row.appendChild(user);
        row.appendChild(pass);
        if (localStorage.ID != i) {
            var deleteIcon = document.createElement("td");
            deleteIcon.setAttribute("data-resource", "list_icon_title_1");
            deleteIcon.id = `delete:${i}`;
            deleteIcon.innerHTML = `<img class="icon" src="icons/delete.svg" />`;
            var applyIcon = document.createElement("td");
            applyIcon.setAttribute("data-resource", "list_icon_title_2");
            applyIcon.id = `apply:${i}`;
            applyIcon.innerHTML = `<img class="icon" src="icons/apply.svg" />`;
            row.appendChild(deleteIcon);
            row.appendChild(applyIcon);
        } else {
            var hit = document.createElement("td", {
                'colspan': '2'
            });
            hit.colSpan = 2;
            hit.innerHTML = `<b data-resource="list_hit_1"></b>`;
            row.appendChild(hit);
        }
        tbody.appendChild(row);
    });

    updateLocalization();
}

$(document).on('click', 'td[id^="delete"]', function () {
    if (!confirm(chrome.i18n.getMessage("list_notification_1"))) {
        return;
    }

    var mainProxiesList = JSON.parse(localStorage.mainProxiesList);

    mainProxiesList.splice($(this)[0].id.split(':')[1], 1);

    if ($(this)[0].id.split(':')[1] < localStorage.ID) {
        localStorage.ID--;
    }

    localStorage.mainProxiesList = JSON.stringify(mainProxiesList);

    fillProxiesTable();
});

$(document).on('click', 'td[id^="apply"]', function () {
    if (!confirm(chrome.i18n.getMessage("list_notification_2"))) {
        return;
    }

    var mainProxiesList = JSON.parse(localStorage.mainProxiesList);

    localStorage.ID = $(this)[0].id.split(':')[1];

    var proxyLogin = mainProxiesList[$(this)[0].id.split(':')[1]]['auth']['user'];
    var proxyPass = mainProxiesList[$(this)[0].id.split(':')[1]]['auth']['pass'];
    localStorage.proxyLogin = proxyLogin;
    localStorage.proxyPass = proxyPass;

    var proxy = {
        host: mainProxiesList[$(this)[0].id.split(':')[1]]['http_host'],
        port: mainProxiesList[$(this)[0].id.split(':')[1]]['http_port'],
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

    fillProxiesTable();
});

$(document).on('click', '.btn.btn-danger', function () {

    $(this).blur();

    localStorage.mainProxiesList = JSON.stringify([]);

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

    offProxy();
    iconSet("off");

    fillProxiesTable();
});

$(document).on('click', '.btn.btn-warning', function () {

    $(this).blur();

    var proxiesList = JSON.parse(localStorage.mainProxiesList);
    var result = 0;

    for (var i = 0; i < proxiesList.length; i++) {
        for (var j = 0; j < proxiesList.length; j++) {
            if (i != j && proxiesList[i]['http_host'] === proxiesList[j]['http_host'] && localStorage.ID != i) {
                if (i < localStorage.ID) {
                    localStorage.ID--;
                }
                proxiesList.splice(i, 1);
                if (i > 0) {
                    i--;
                }
                if (j > 0) {
                    j--;
                }
                result++;
            }
        }
    }
    if (result != 0) {
        alert(chrome.i18n.getMessage("list_notification_3") + ` - ${result}`);
    } else {
        alert(chrome.i18n.getMessage("list_notification_4"));
    }
    localStorage.mainProxiesList = JSON.stringify(proxiesList);

    fillProxiesTable();
});

$(document).ready(function() {
	fillProxiesTable();
    updateLocalization();
});
