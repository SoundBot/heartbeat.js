; (function(window) {
  'use strict';

  var heartbeat = {};
  var options = {};
  var internalConsoleError = 'HeartBeat';

  heartbeat.start = function(opt) {
    options.url = opt.url;
    options.delay = opt.delay || 0;
    options.methods = opt.methods || ["log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"];
    options.logConsole = opt.logConsole || true;
    options.logError = opt.logError || true;
    options.callback = opt.callback || function(){};

    if (options.logConsole){
      this.initConsole();
    }
    if (options.logError){
      this.initErrorlog();
    }

  };

  heartbeat.initErrorlog = function(){

    window.onerror = (function(message, url, line, col, error) {
      if (message !== internalConsoleError){
        var data = {
          message: message,
          url: url,
          line: line,
          col: col
        };

        this.sendMessage(data, 'error');
      }

    }).bind(this);


  };


  heartbeat.sendMessage = function(data, event) {
    options.callback(data, event);
    if (options.url) {
      var id = prepareId();

      var content = JSON.stringify({
        id: id,
        timestamp: (new Date()).getTime(),
        data: data,
        event: event,
        useragent: window.navigator.userAgent
      });

        xdr(options.url, 'POST', content);
    }
  };

  heartbeat.initConsole = function() {
    var regexp = /at (.*)\:([0-9]{1,})\:([0-9]{1,})/;

    options.methods.forEach((function(method) {

      var cLog = console[method];
      console[method] = (function(message) {
        var stack = (new Error()).stack.split(/\n/);
         if (stack[0].indexOf('Error') === 0) {
           stack = stack.slice(1);
         }

        var matches = regexp.exec(stack[1].trim());
        var content = {
          message: message,
          url: matches[1],
          line: matches[2],
          col: matches[3]
        };

        this.sendMessage(content, 'console.' + method);
        cLog.apply(console, arguments);
      }).bind(this);
    }).bind(this));
  };

/**
 * Makes a request
 * @param  {String}   url      URL
 * @param  {String}   method   Method type (GET/POST)
 * @param  {String}   data     Content
 * @param  {Function} callback Function to invoke on success
 * @param  {Function}   errback  Function to invoke on error
 */
  var xdr = function(url, method, data, callback, errback) {
    var req;

    if (XMLHttpRequest) {
      req = new XMLHttpRequest();

      if ('withCredentials' in req) {
        req.open(method, url, true);
        req.onerror = errback;
        req.onreadystatechange = function() {
          if (req.readyState === 4) {
            if (req.status >= 200 && req.status < 400) {
              callback(req.responseText);
            } else {
              //errback(new Error('Response returned with non-OK status'));
              //console.log('err');
            }
          }
        };
        req.send(data);
      }
    } else if (XDomainRequest) {
      req = new XDomainRequest();
      req.open(method, url);
      req.onerror = errback;
      req.onload = function() {
        callback(req.responseText);
      };
      req.send(data);
    } else {
      if (errback){
        //errback();
      }

    }
  };

  var makeHash = function(string) {
    var hash = 0;
    if (string.length === 0) {
      return hash;
    }
    for (var i = 0; i < string.length; i++) {
      var chr = string.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return hash;
  };

  var prepareId = function() {
    var idString = readProperties(navigator) + readProperties(screen) + readProperties(history);
    return makeHash(idString);
  };

  var readProperties = function(obj, depth, result, info) {
    depth = depth || 1;
    result = result || '';
    info = info || {};
    if (depth < 3) {
      for (var property in obj) {
        if (obj[property]) {
          result += property;
          switch (typeof obj[property]) {
            case 'object':
              readProperties(obj[property], ++depth, result, info);
              break;
            case 'number':
            case 'string':
            case 'boolean':
              result += obj[property].toString();
              break;
          }
        }
      }
    }
    return result;

  };

  window.heartbeat = heartbeat;

})(window);
