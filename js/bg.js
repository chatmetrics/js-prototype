/**
 * Created by kascode on 05.04.16.
 */

chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.create({
    'url': 'html/main.html',
    selected: true
  });
});