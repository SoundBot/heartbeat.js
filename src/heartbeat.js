 'use strict';

  var heartbeat = {};
  var options = {};
  var internalConsoleError = 'HeartBeat';

/**
 * Initiate monitoring
 * @param  {Object} opt Options
 */
  heartbeat.start = function(opt) {
    options.url = opt.url;
    options.methods = typeof opt.methods !== 'undefined' ? opt.methods : ['log', 'info', 'warn', 'error', 'assert', 'dir', 'clear', 'profile', 'profileEnd'];
    options.logConsole = typeof opt.logConsole !== 'undefined' ? opt.logConsole : true;
    options.logError = typeof opt.logError !== 'undefined' ? opt.logError : true;
    options.callback = typeof opt.callback !== 'undefined' ? opt.callback : function(){};

    if (options.logConsole){
      this.initConsole();
    }
    if (options.logError){
      this.initErrorlog();
    }

  };

/**
 * Watches for console errors
 */
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

/**
 * Forms the request with data
 * @param  {Object} data  Event information
 * @param  {String} event Event name
 */
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

/**
 * Watches for console events
 */
  heartbeat.initConsole = function() {
    var regexp = /\/\/(.*)\:([0-9]{1,})\:([0-9]{1,})/;

    options.methods.forEach((function(method) {

      var cLog = console[method];
      console[method] = (function(message) {
        var stackArray = (new Error()).stack.split(/\n/);
        var content;

        for (var el = stackArray.length - 1; el >= 0; el--) {
          var matches = regexp.exec(stackArray[el]);

          for (var mch in matches) {
            if (matches[mch].length > 2) {
              content = {
                message: message,
                url: matches[1],
                line: matches[2],
                col: matches[3]
              };
              break;
            }
          }

          if (content) {
            break;
          }
        }

        // This means we cannot parse stack trace
        // At least we pass a message.
        if (!content) {
          content = {message: message};
        }

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
 */
  var xdr = function(url, method, data) {
    var promise = function(resolve, reject) {
          var xhr = new XMLHttpRequest();

          if ('withCredentials' in xhr) {
            xhr.open(method, url, true);
          } else if (typeof XDomainRequest !== 'undefined') {
            xhr = new XDomainRequest();
            xhr.open(method, url);
          } else {
            reject('CORS is not supported')
          }

          xhr.onload = function() {
            resolve(xhr.responseText);
          };

          xhr.onerror = function() {
            reject('XMLHttpRequest error');
          };

          xhr.setRequestHeader("Content-type", "application/json");

          //do it, wrapped in timeout to fix ie9
          setTimeout(function() {
            xhr.send(data);
          }, 0);

        }

        return new Promise(promise);
  };

/**
 * Creates a hash. Based on Java.lang.String hash
 * @param  {String} input Input string
 * @return {Integer}      Hash
 */
  var makeHash = function(input) {
    var hash = 0;
    if (input.length === 0) {
      return hash;
    }

    for (var i = 0; i < input.length; i++) {
     hash = hash * 31 + input.charCodeAt(i);
     hash &= hash;
    }

    return hash;
  };

/**
 * Gathers information about user
 * @return {Integer} Hash
 */
  var prepareId = function() {
    var idString = readProperties(window.navigator) + readProperties(window.screen) + readProperties(window.history);
    return makeHash(idString);
  };

/**
 * This function extracts "valuable" information from an object
 * @param  {Object} obj    Input object
 * @param  {Integer} depth  Depth of iteration
 * @param  {String} result Prefix string
 * @return {String}        All properties and values
 */
  var readProperties = function(obj, depth, result, info) {
    depth = depth || 1;
    result = result || '';
    info = info || {};
    if (depth < 3) {
      for (var property in obj) {
        if (obj[property] !== undefined) {
          result += property;
          switch (typeof obj[property]) {
            case 'object':
              result += readProperties(obj[property], ++depth, '', info);
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

  if (typeof define === 'function' && define['amd']) {
    define(['exports'], heartbeat);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = heartbeat;
  } else {
    window.heartbeat = heartbeat;
  }
