/**
 * Created by kascode on 05.04.16.
 */

var messages = [];
var response = null;
var vkToken = '';
var userId = 0;
var chatId = 42;
var chatSize = 0;
var chat = {};
var chats = [];
var users = {
  userList: [],
  getUserName: function (id) {
    console.log("getUserName", id);

    for (var i = 0; i < users.userList.length; i++) {
      var user = users.userList[i];

      if (user.id == id) {
        return user.first_name + ' ' + user.last_name;
      }
    }

    return null;
  }
};

function init_main() {
  vkToken = window.location.hash.split('#')[1].split('&')[0];
  userId = window.location.hash.split('#')[1].split('&')[1];

  var allChatsScript = document.createElement('script');
  allChatsScript.id = 'vkchatscript';
  allChatsScript.src = 'https://api.vk.com/method/messages.getDialogs?unread=0&count=200&access_token=' + vkToken + '&callback=getChats&v=5.50';
  document.getElementsByTagName('head')[0].appendChild(allChatsScript);
}

function startChatLoad(id) {
  chatId = id;
  // Get messages
  loaderShow();
  var script = document.createElement('script');
  script.src = 'https://api.vk.com/method/messages.getHistory?offset=0&count=200&peer_id=' + (chatId + 2000000000) +
    '&user_id=' + userId + '&access_token=' + vkToken + '&callback=getMessages&v=5.50';
  document.getElementsByTagName('head')[0].appendChild(script);

  // Get chat info
  var chatScript = document.createElement('script');
  chatScript.id = 'vkchatscript';
  chatScript.src = 'https://api.vk.com/method/messages.getChat?chat_id=' + chatId +
    '&fields=photo_200_orig&access_token=' + vkToken + '&callback=getChatInfo&v=5.50';
  document.getElementsByTagName('head')[0].appendChild(chatScript);
}

document.addEventListener('DOMContentLoaded', init_main);

function loaderShow() {
  console.log("loader show");
  //$('.loader').css({
  //  'height': '28px',
  //  'border-top-width': '4px',
  //  'border-bottom-width': '4px'
  //});
  $('.loader').removeClass('hidden');
}

function loaderHide() {
  //$('.loader').css({
  //  'height': 0
  //});
  //setTimeout(function () {
  //  $('.loader').css({
  //    'border-top-width': 0,
  //    'border-bottom-width': 0
  //  })
  //}, 300)
  $('.loader').addClass('hidden');
}

function statShow() {
  var h = $('.stat__container').height();
  $('.stat-list').height(h);
}

function loaderUpdate() {
  console.log(chatSize, messages.length);
  var percent = 100 / (chatSize / messages.length);
  console.log(Math.round(percent) + '%');
  $('.loader__progress-bar').width(Math.round(percent) + '%');
  $('.loader__percent').text(Math.round(percent) + '%');

  if (percent == 100) {
    loaderHide();
  }
}

function addChats(res) {
  var response = res.response;

  console.log("addChats got", res);

  if (!response)
    console.log("No response", response);

  chats = chats.concat(response.items);
}

function getChats(res) {
  var response = res.response;
  console.log("Chats:", response);

  if (response.count > 200) {
    getAllChats(response.count);
  } else {
    chats = response.items;
  }
}

function displayChatSelect() {
  //var chat_select = document.getElementById('chat-select');
  //var chatEls = chats
  //  .filter(function (el) {
  //    return el.message.title !== ' ... ' && el.message.title !== '...';
  //  })
  //  .map(function (el) {
  //    var option = document.createElement('option');
  //    option.setAttribute('value', el.message.chat_id);
  //    option.innerHTML = el.message.title;
  //    return option;
  //  });
  //for (var i = 0; i < chatEls.length; i++) {
  //  var el = chatEls[i];
  //  chat_select.appendChild(el);
  //}

  var chat_select = document.querySelector('.chat-select');

  chat_select.onkeyup = function() {
    var val = this.value;
    if (this.value !== '') {
      var count = 0;
      var res = chats.filter(function (chat) {
        return chat.message.title.toLowerCase().indexOf(val.toLowerCase()) > -1 && count++ < 100;
      });

      console.log(res);

      redrawChatList(res);
    }
  };

  //chat_select.onclick = function(e) {
  //  startChatLoad(parseInt(this.value));
  //}
}

function redrawChatList(chats) {
  var chats_container = document.querySelector('.chats');
  chats_container.innerHTML = "";

  for (var i = 0; i < chats.length; i++) {
    var chat = chats[i];
    chats_container.appendChild(constructChatEntry(chat.message.chat_id, chat.message.title));
  }
}

function constructChatEntry(id, title) {
  var entry = document.createElement('div');
  entry.classList.add('chat');
  entry.dataset.id = id;
  entry.innerHTML = title;

  entry.onclick = function() {
    startChatLoad(parseInt(this.dataset.id));
  }

  return entry;
}

function getAllChats(numOfChats) {
  var offset = 0;

  var int = setInterval(function () {
    if (offset > numOfChats + 200) {
      clearInterval(int);
      displayChatSelect();
    } else {
      addVkScript('messages.getDialogs', {
        offset: offset,
        count: 200,
        callback: 'addChats'
      });
      offset += 200;
    }
  }, 400);
}

function addVkScript(method, params) {
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  var url = 'https://api.vk.com/method/' + method + '?';

  for (var p in params) {
    if (params.hasOwnProperty(p)) {
      url += p + '=' + params[p] + '&';
    }
  }

  url += 'access_token=' + vkToken + '&v=5.50';
  script.src = url;
  head.appendChild(script);
}

function loadAllMessages(callback) {
  var count = response.response.count;
  //var count = 600;
  var offset = 200;

  var int = setInterval(function () {
    loaderUpdate();
    if (offset > count + 200) {
      clearInterval(int);
      callback();
    } else {
      addVkScript('messages.getHistory', {
        offset: offset,
        peer_id: chatId + 2000000000,
        count: 200,
        callback: 'addMessages'
      });
      offset += 200;
    }
  }, 300);
}

function getMessages(resp) {
  messages = resp.response.items;
  response = resp;
  chatSize = resp.response.count;
  loadAllMessages(Analizer.analize);
  //Analizer.analize();
}

function addMessages(msgs) {
  messages = messages.concat(msgs.response.items);
}

function getChatInfo(info) {
  console.log("Chat info:", info);
  chat.title = info.response.title;
  chat.photo = info.response.photo_200;
  users.userList = info.response.users;

  displayChatInfo();
}

function displayChatInfo() {
  $('.chat-title').text(chat.title);
}

function appendOrIncrement(obj, param, inc) {
  inc = inc || 1;
  if (!obj.hasOwnProperty(param)) {
    obj[param] = inc;
  } else {
    obj[param] += inc;
  }

  return obj;
}

function appendOrIncrement2(obj, param, prop, prop2, inc, inc2) {
  inc = inc || 0;
  inc2 = inc2 || 0;
  if (!obj.hasOwnProperty(param)) {
    obj[param] = {};
    obj[param][prop] = inc;
    obj[param][prop2] = inc2;
  } else {
    obj[param][prop] += inc;
    obj[param][prop2] += inc2;
  }

  return obj;
}

var Analizer = {
  /**
   * Get user with max number of messages
   * @returns object {{id: number, value: number}}
   */
  getLeader: function () {
    var leaderboard = {};
    var result = {
      res: {
        id: 0,
        value: 0
      },

      isEmpty: function () {
        return !this.res.id && (!this.res[0] || !this.res[0].id)
      },

      value: function () {
        switch (this.getType()) {
          case 'obj':
            return this.res.value;
          case 'arr':
            return this.res[0].value;
        }
      },

      getType: function () {
        return typeof this.res.value !== 'undefined' ? 'obj' : 'arr';
      },

      append: function (el) {

        if (this.isEmpty())
          this.res = el;
        else {
          var rtype = this.getType();
          var v = this.value();

          if (rtype === 'obj') {
            // Replace value if new is less
            if (el.value > v) {
              this.res = el;
            }
            // Convert res to array if new is equal
            else if (el.value === v) {
              this.res = [this.res, el];
            }
          } else if (rtype === 'arr') {
            if (el.value > v)
              this.res = el;
            else if (el.value === v) {
              this.res.push(el);
            }
          }
        }
      }
    };

    for (var i = 0; i < messages.length; i++) {
      var msg = messages[i];

      leaderboard = appendOrIncrement(leaderboard, msg.from_id);

      //if (!leaderboard.hasOwnProperty(msg.from_id)) {
      //  leaderboard[msg.from_id] = 1;
      //} else {
      //  leaderboard[msg.from_id]++;
      //}

      result.append({
        id: msg.from_id,
        value: leaderboard[msg.from_id]
      });
    }

    return result.res.is !== 0 ? result.res : null;
  },

  /**
   * User with max comma/words ratio
   * @returns {*} {{id: number, value: number}} || null
   */
  commaMan: function () {
    var leaderboard = {};
    var max = {
      id: 0,
      value: 0
    };

    function targetValue(commas, words) {
      return commas / words;
    }

    for (var i = 0; i < messages.length; i++) {
      var msg = messages[i];
      var commaCount = msg.body.split(',').length - 1;
      var wordCount = msg.body.split(' ').length;

      leaderboard = appendOrIncrement2(leaderboard, msg.from_id, 'commas', 'words', commaCount, wordCount);
    }

    for (var user in leaderboard) {
      if (leaderboard.hasOwnProperty(user)) {
        var u = leaderboard[user];
        var tv = Math.round(targetValue(u.commas, u.words) * 100) / 100;

        if (u.words > 30 && tv > max.value) {
          max = {
            id: user,
            value: tv
          }
        }
      }
    }

    return max.id === 0 ? null : max;
  },

  noTalker: function () {
    var leaderboard = {};

    var result = {
      res: {
        id: 0,
        value: 0
      },

      isEmpty: function () {
        return !this.res.id && (!this.res[0] || !this.res[0].id)
      },

      value: function () {
        switch (this.getType()) {
          case 'obj':
            return this.res.value;
          case 'arr':
            return this.res[0].value;
        }
      },

      getType: function () {
        return typeof this.res.value !== 'undefined' ? 'obj' : 'arr';
      },

      append: function (el) {

        if (this.isEmpty())
          this.res = el;
        else {
          var rtype = this.getType();
          var v = this.value();

          if (rtype === 'obj') {
            // Replace value if new is less
            if (el.value < v) {
              this.res = el;
            }
            // Convert res to array if new is equal
            else if (el.value === v) {
              this.res = [this.res, el];
            }
          } else if (rtype === 'arr') {
            if (el.value < v)
              this.res = el;
            else if (el.value === v) {
              this.res.push(el);
            }
          }
        }
      }
    };

    for (var i = 0; i < messages.length; i++) {
      var msg = messages[i];

      leaderboard = appendOrIncrement(leaderboard, msg.from_id, 1);
    }

    for (var user in leaderboard) {
      if (leaderboard.hasOwnProperty(user)) {

        result.append({
          id: user,
          value: leaderboard[user]
        });

      }
    }

    return result.res.id !== 0 ? result.res : null;
  },

  //ahaMan: function() {
  //  var leaderboard = {};
  //  var result = {
  //    res: {
  //      id: 0,
  //      value: 0
  //    },
  //
  //    isEmpty: function () {
  //      return !this.res.id && (!this.res[0] || !this.res[0].id)
  //    },
  //
  //    value: function() {
  //      switch (this.getType()) {
  //        case 'obj':
  //          return this.res.value;
  //        case 'arr':
  //          return this.res[0].value;
  //      }
  //    },
  //
  //    getType: function() {
  //      return typeof this.res.value !== 'undefined' ? 'obj' : 'arr';
  //    },
  //
  //    append: function(el) {
  //
  //      if (this.isEmpty())
  //        this.res = el;
  //      else {
  //        var rtype = this.getType();
  //        var v = this.value();
  //
  //        if (rtype === 'obj') {
  //          // Replace value if new is less
  //          if (el.value > v) {
  //            this.res = el;
  //          }
  //          // Convert res to array if new is equal
  //          else if (el.value === v) {
  //            this.res = [this.res, el];
  //          }
  //        } else if (rtype === 'arr') {
  //          if (el.value > v)
  //            this.res = el;
  //          else if (el.value === v) {
  //            this.res.push(el);
  //          }
  //        }
  //      }
  //    }
  //  };
  //
  //  for (var i = 0; i < messages.length; i++) {
  //    var msg = messages[i];
  //    var r = /(.*([АаХх]{3,}))[\s|\b|$]/ig;
  //    var match = msg.body.match(r);
  //
  //    if (match) {
  //      console.log(msg.body, match, users.getUserName(msg.from_id));
  //      match = (function(arr) {
  //        if (!arr.length)
  //          return arr;
  //
  //        if (arr.length % 2 !== 0)
  //          console.log("weird array");
  //
  //        var res = [];
  //        for (var j = 0; j < arr.length - 1; j++) {
  //          var fullWord = arr[j];
  //          var match = arr[j+1];
  //
  //          if (fullWord.length - match.length <= 2)
  //            res.push(match);
  //        }
  //
  //        return res;
  //      })(match);
  //      //match = match.filter(function(el) {
  //      //  function isValid(str) {
  //      //    var cmp = str.charAt(0);
  //      //    for (var j = 0; j < str.length; j++) {
  //      //      var ch = str[j];
  //      //      if (ch !== cmp && ch !== '\n' && ch !== ' ')
  //      //        return true;
  //      //    }
  //      //    return false;
  //      //  }
  //      //
  //      //  return isValid(el);
  //      //});
  //      console.log(msg.body, match, users.getUserName(msg.from_id));
  //      if (match.length) {
  //        leaderboard = appendOrIncrement(leaderboard, msg.from_id, match.length ? match.length : 0);
  //        result.append({
  //          id: msg.from_id,
  //          value: leaderboard[msg.from_id]
  //        });
  //      }
  //    }
  //  }
  //
  //  return result.res.id !== 0 ? result.res : null;
  //},

  timeMan: function (from, to) {
    var leaderboard = {};
    var max = {
      id: 0,
      value: 0
    };

    var result = {
      res: {
        id: 0,
        value: 0
      },

      isEmpty: function () {
        return !this.res.id && (!this.res[0] || !this.res[0].id)
      },

      value: function () {
        switch (this.getType()) {
          case 'obj':
            return this.res.value;
          case 'arr':
            return this.res[0].value;
        }
      },

      getType: function () {
        return typeof this.res.value !== 'undefined' ? 'obj' : 'arr';
      },

      append: function (el) {

        if (this.isEmpty())
          this.res = el;
        else {
          var rtype = this.getType();
          var v = this.value();

          if (rtype === 'obj') {
            // Replace value if new is less
            if (el.value > v) {
              this.res = el;
            }
            // Convert res to array if new is equal
            else if (el.value === v) {
              this.res = [this.res, el];
            }
          } else if (rtype === 'arr') {
            if (el.value > v)
              this.res = el;
            else if (el.value === v) {
              this.res.push(el);
            }
          }
        }
      }
    };

    for (var i = 0; i < messages.length; i++) {
      var msg = messages[i];
      var hour = new Date(parseInt(msg.date) * 1000).getHours();

      if (hour > from && hour < to) {
        leaderboard = appendOrIncrement(leaderboard, msg.from_id, 1);

        result.append({
          id: msg.from_id,
          value: leaderboard[msg.from_id]
        });
      }
    }

    return result.res.id !== 0 ? result.res : null;
  },

  attMan: function (attachmentType) {
    var leaderboard = {};
    var result = {
      res: {
        id: 0,
        value: 0
      },

      isEmpty: function () {
        return !this.res.id && (!this.res[0] || !this.res[0].id)
      },

      value: function () {
        switch (this.getType()) {
          case 'obj':
            return this.res.value;
          case 'arr':
            return this.res[0].value;
        }
      },

      getType: function () {
        return typeof this.res.value !== 'undefined' ? 'obj' : 'arr';
      },

      append: function (el) {

        if (this.isEmpty())
          this.res = el;
        else {
          var rtype = this.getType();
          var v = this.value();

          if (rtype === 'obj') {
            // Replace value if new is less
            if (el.value > v) {
              this.res = el;
            }
            // Convert res to array if new is equal
            else if (el.value === v) {
              this.res = [this.res, el];
            }
          } else if (rtype === 'arr') {
            if (el.value > v)
              this.res = el;
            else if (el.value === v) {
              this.res.push(el);
            }
          }
        }
      }
    };

    for (var i = 0; i < messages.length; i++) {
      var msg = messages[i];
      var att = msg.attachments;

      function hasAttachment(attachments, t) {
        for (var j = 0; j < attachments.length; j++) {
          if (attachments[j].type === t)
            return true;
        }
        return false;
      }

      if (att && att.length && hasAttachment(att, attachmentType)) {
        leaderboard = appendOrIncrement(leaderboard, msg.from_id, 1);

        result.append({
          id: msg.from_id,
          value: leaderboard[msg.from_id]
        });
      }
    }

    return result.res.id !== 0 ? result.res : null;
  },

  analize: function () {
    document.querySelector('.stat__container').innerHTML = "";
    displayStat(Analizer.getLeader(), 'leader', 'Leader');
    displayStat(Analizer.commaMan(), 'comma-man', 'Запятунщик');
    displayStat(Analizer.noTalker(), 'no-talker', 'Молчун');
    //displayStat(Analizer.ahaMan(), 'aha-man', 'Ахахатель');
    displayStat(Analizer.timeMan(0, 4), 'owl-man', 'Сова');
    displayStat(Analizer.timeMan(5, 9), 'lark-man', 'Жаворонок');
    displayStat(Analizer.attMan('photo'), 'pic-man', 'Пикчер');
    displayStat(Analizer.attMan('video'), 'vid-man', 'Видеоспаммер');
    displayStat(Analizer.attMan('audio'), 'dj-man', 'DJ');
    statShow();
  }
};

function filterUser(id) {
  return messages.filter(function (el) {
    return el.from_id == id;
  });
}

function displayStat(data, name, title) {
  var stat = $('<div class="stat stat_' + name + '"/>');
  stat.append($('<h1 class="stat__title">' + title + '</h1>'));

  function generateEntry(data) {
    var name = users.getUserName(data.id);
    var entry = $('<div class="stat__entry"/>');
    entry.append($('<div class="stat__id"><strong>Имя: </strong>' + (name != null ? name : (data.value ? "Удалился" : "Нет таких")) + '</div>'));
    if (data.value)
      entry.append($('<div class="stat__value"><strong>Значение: </strong>' + data.value + '</div>'));

    return entry;
  }

  if (data) {
    if (isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        var obj = data[i];
        stat.append(generateEntry(obj));
      }
    } else {
      stat.append(generateEntry(data));
    }

    $('.stat__container').append(stat);
  }
}

function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

