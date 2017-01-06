/*
 ** file: js/main.js
 ** description: javascript code for "html/main.html" page
 */

/**
 * Retrieve a value of a parameter from the given URL string
 *
 * @param  {string} url           Url string
 * @param  {string} parameterName Name of the parameter
 *
 * @return {string}               Value of the parameter
 */
function getUrlParameterValue(url, parameterName) {
  "use strict";

  var urlParameters = url.substr(url.indexOf("#") + 1),
    parameterValue = "",
    index,
    temp;

  urlParameters = urlParameters.split("&");

  for (index = 0; index < urlParameters.length; index += 1) {
    temp = urlParameters[index].split("=");

    if (temp[0] === parameterName) {
      return temp[1];
    }
  }

  return parameterValue;
}

/**
 * Chrome tab update listener handler. Return a function which is used as a listener itself by chrome.tabs.obUpdated
 *
 * @param  {string} authenticationTabId Id of the tab which is waiting for grant of permissions for the application
 *
 * @return {function}                   Listener for chrome.tabs.onUpdated
 */
function listenerHandler(authenticationTabId) {
  "use strict";

  return function tabUpdateListener(tabId, changeInfo) {
    var vkAccessToken,
      vkAccessTokenExpiredFlag;

    if (tabId === authenticationTabId && changeInfo.url !== undefined && changeInfo.status === "loading") {

      if (changeInfo.url.indexOf('oauth.vk.com/blank.html') > -1) {
        authenticationTabId = null;
        chrome.tabs.onUpdated.removeListener(tabUpdateListener);

        vkAccessToken = getUrlParameterValue(changeInfo.url, 'access_token');

        if (vkAccessToken === undefined || vkAccessToken.length === undefined) {
          console.error('vk auth response problem', 'access_token length = 0 or vkAccessToken == undefined');
          return;
        }

        vkAccessTokenExpiredFlag = Number(getUrlParameterValue(changeInfo.url, 'expires_in'));

        if (vkAccessTokenExpiredFlag == 0) {
          console.error('vk auth response problem', 'vkAccessTokenExpiredFlag == 0 ' + vkAccessToken);
          return;
        }

        var userId = Number(getUrlParameterValue(changeInfo.url, 'user_id'));

        console.log("test", vkAccessToken);

        chrome.storage.local.set({'vkaccess_token': vkAccessToken}, function () {
          chrome.tabs.update(
            tabId,
            {
              'url': 'html/app.html#' + vkAccessToken + '&' + userId,
              'active': true
            },
            function (tab) {
            }
          );
        });
      }
    }
  };
}

function init_main() {
  $('html').hide().fadeIn('slow');
  chrome.storage.local.clear();
  $('.vk-login').click(function (e) {
    var authUrl = 'https://oauth.vk.com/authorize?client_id=5398352&scope=messages' +
      '&redirect_uri=http%3A%2F%2Foauth.vk.com%2Fblank.html&display=page&response_type=token';


    chrome.storage.local.get({'vkaccess_token': {}}, function (items) {

      console.log(items);

      if (items.vkaccess_token.length === undefined) {
        chrome.tabs.create({
          'url': authUrl,
          'selected': true
        }, function (tab) {
          chrome.tabs.onUpdated.addListener(listenerHandler(tab.id))
        })
      }
    });
    e.preventDefault();
  })
}

//bind events to dom elements
document.addEventListener('DOMContentLoaded', init_main);
