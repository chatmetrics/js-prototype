/**
 * Created by kascode on 05.04.16.
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

  var urlParameters  = url.substr(url.indexOf("#") + 1),
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