var HeartBeat = (function() {
  'use strict';

  function HeartBeat(options) {
    var methods = ["log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"];

    this.url = options.url;
    this.delay = options.delay || 0;
    this.methods = options.methods || methods;
    this.logConsole = options.logConsole || true;
    this.logError = options.logError || true;
    this.init();
  }
//TODO: catch js errors
  HeartBeat.prototype.sendMessage = function(text, event) {
    var id = prepareId();

    var data = JSON.stringify({
      id: id,
      timestamp: (new Date()).getTime(),
      text: text,
      event: event,
      useragent: window.navigator.userAgent
    });

    xdr(this.url, 'POST', data);
  };

  HeartBeat.prototype.init = function() {
    var that = this;
    this.methods.forEach(function(method) {
      var cLog = console[method];
      console[method] = function(message) {
        that.sendMessage(message, 'console.' + method);
        cLog.apply(console, arguments);
      };
    });

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
              errback(new Error('Response returned with non-OK status'));
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
        errback();
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
  //TODO: rewrite to pass navigator object
  var readProperties = function(obj, depth, result, info) {
    depth = depth || 1;
    result = result || '';
    info = info || {};
    if (depth < 5) {
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

  return HeartBeat;

})();
