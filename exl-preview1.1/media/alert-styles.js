var blockquoteTags = document.getElementsByTagName("blockquote");
var alerts = [
  {
    "name": "NOTE",
    "icon": "docon-status-error-outline"
  },
  {
    "name": "TIP",
    "icon": "docon-lightbulb"
  },
  {
    "name": "IMPORTANT",
    "icon": "docon-status-info-outline"
  },
  {
    "name": "CAUTION",
    "icon": "docon-status-failure-outline"
  },
  {
    "name": "WARNING",
    "icon": "docon-status-warning-outline"
  }];

alerts.map(aa => {
  for (var i = 0; i < blockquoteTags.length; i++) {
    let tag = blockquoteTags[i];
    if (tag.innerHTML.toUpperCase().indexOf(`[!${aa.name.toUpperCase()}]`) > -1) {
      tag.setAttribute("class", `${aa.name.toUpperCase()}`);
      var alertType = blockquoteTags[i].innerHTML;
      var addBreak = alertType.replace(`[!${aa.name.toUpperCase()}]`, `<strong><span class="docon ${aa.icon}"></span> ${aa.name}</strong><br/><hr/>`);
      blockquoteTags[i].innerHTML = addBreak;
    }
  }
});