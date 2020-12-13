$('#saveWhileListButton').click(function () {
    this.blur();

    localStorage.whiteList = document.querySelector('#whiteListEntry').value.split(',');

    onProxy();

    var notification = new Notification(chrome.i18n.getMessage("notification_3"), {
        body: chrome.i18n.getMessage("notification_hit"),
        dir: 'auto',
        icon: 'icon.png'
    });
});

document.querySelector('#whiteListEntry').value = localStorage.whiteList;

$(document).ready(function() {
    updateLocalization();
});
