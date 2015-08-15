; (function(window) { 'use strict';

  var heartbeat = {};
  var options = {};
  var internalConsoleError = 'HeartBeat';

  heartbeat.start = function(opt) {
    options.url = opt.url;
    options.methods = typeof opt.methods !== 'undefined' ? opt.methods : ["log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"];
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
 */
  var xdr = function(url, method, data) {
    var promise = function(resolve, reject) {
          var xhr = new XMLHttpRequest();

          if ("withCredentials" in xhr) {
            xhr.open(method, url, true);
          } else if (typeof XDomainRequest !== "undefined") {
            xhr = new XDomainRequest();
            xhr.open(method, url);
          } else {
            reject('CORS not supported')
          }

          xhr.onload = function() {
            resolve(xhr.responseText);
          };

          xhr.onerror = function() {
            reject('Failed to load');
          };

          //do it, wrapped in timeout to fix ie9
          setTimeout(function() {
            xhr.send(data);
          }, 0);

        }

        return new Promise(promise);
  };

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

  var prepareId = function() {
    var idString = readProperties(window.navigator) + readProperties(window.screen) + readProperties(window.history);
    return makeHash(idString);
  };

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

  window.heartbeat = heartbeat;

if (typeof Promise === "undefined") {
(function () {
	function Promise(resolver) {
		var
		self = this,
		then = self.then = function () {
			return Promise.prototype.then.apply(self, arguments);
		};

		then.fulfilled = [];
		then.rejected = [];

		function timeout(state, object) {
			then.state = 'pending';

			if (then[state].length) setTimeout(function () {
				timeout(state, then.value = then[state].shift().call(self, object));
			}, 0);
			else then.state = state;
		}

		then.fulfill = function (object) {
			timeout('fulfilled', object);
		};

		then.reject = function (object) {
			timeout('rejected', object);
		};

		resolver.call(self, then.fulfill, then.reject);

		return self;
	}

	Promise.prototype = {
		'constructor': Promise,
		'then': function (onFulfilled, onRejected) {
			if (onFulfilled) this.then.fulfilled.push(onFulfilled);
			if (onRejected) this.then.rejected.push(onRejected);

			if (this.then.state === 'fulfilled') this.then.fulfill(this.then.value);

			return this;
		},
		'catch': function (onRejected) {
			if (onRejected) this.then.rejected.push(onRejected);

			return this;
		}
	};

	Promise.all = function () {
		var
		args = Array.prototype.slice.call(arguments),
		countdown = args.length;

		function process(promise, fulfill, reject) {
			promise.then(function onfulfilled(value) {
				if (promise.then.fulfilled.length > 1) promise.then(onfulfilled);
				else if (!--countdown) fulfill(value);

				return value;
			}, function (value) {
				reject(value);
			});
		}

		return new Promise(function (fulfill, reject) {
			while (args.length) process(args.shift(), fulfill, reject);
		});
	};

	window.Promise = Promise;
})();

}
if (!Function.prototype.bind) {
// Function.prototype.bind
Function.prototype.bind = function bind(scope) {
	var
	callback = this,
	prepend = Array.prototype.slice.call(arguments, 1),
	Constructor = function () {},
	bound = function () {
		return callback.apply(
			this instanceof Constructor && scope ? this : scope,
			prepend.concat(Array.prototype.slice.call(arguments, 0))
		);
	};

	Constructor.prototype = bound.prototype = callback.prototype;

	return bound;
};

}
if (!Array.prototype.forEach) {
// Array.prototype.forEach
Array.prototype.forEach = function forEach(callback, scope) {
	for (var array = this, index = 0, length = array.length; index < length; ++index) {
		callback.call(scope || window, array[index], index, array);
	}
};

}
if (!Array.prototype.indexOf) {
// Array.prototype.indexOf
Array.prototype.indexOf = function indexOf(searchElement) {
	for (var array = this, index = 0, length = array.length; index < length; ++index) {
		if (array[index] === searchElement) {
			return index;
		}
	}

	return -1;
};

}
if (!String.prototype.trim) {
// String.prototype.trim
String.prototype.trim = function trim() {
	return this.replace(/^\s+|\s+$/g, '');
};

}
if (typeof window.JSON === "undefined") {
/** @license MIT Asen Bozhilov JSON.parse (https://github.com/abozhilov/json) */
(function () {
	var
	toString = Object.prototype.toString,
	hasOwnProperty = Object.prototype.hasOwnProperty,
	LEFT_CURLY = '{',
	RIGHT_CURLY = '}',
	COLON = ':',
	LEFT_BRACE = '[',
	RIGHT_BRACE = ']',
	COMMA = ',',
	tokenType = {
		PUNCTUATOR: 1,
		STRING: 2,
		NUMBER: 3,
		BOOLEAN: 4,
		NULL: 5
	},
	tokenMap = {
		'{': 1, '}': 1, '[': 1, ']': 1, ',': 1, ':': 1,
		'"': 2,
		't': 4, 'f': 4,
		'n': 5
	},
	escChars = {
		'b': '\b',
		'f': '\f',
		'n': '\n',
		'r': '\r',
		't': '\t',
		'"': '"',
		'\\': '\\',
		'/': '/'
	},
	tokenizer = /^(?:[{}:,\[\]]|true|false|null|"(?:[^"\\\u0000-\u001F]|\\["\\\/bfnrt]|\\u[0-9A-F]{4})*"|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/,
	whiteSpace = /^[\t ]+/,
	lineTerminator = /^\r?\n/;

	function JSONLexer(JSONStr) {
		this.line = 1;
		this.col = 1;
		this._tokLen = 0;
		this._str = JSONStr;
	}

	JSONLexer.prototype = {
		getNextToken: function () {
			var
			str = this._str,
			token, type;

			this.col += this._tokLen;

			if (!str.length) {
				return 'END';
			}

			token = tokenizer.exec(str);

			if (token) {
				type = tokenMap[token[0].charAt(0)] || tokenType.NUMBER;
			} else if ((token = whiteSpace.exec(str))) {
				this._tokLen = token[0].length;
				this._str = str.slice(this._tokLen);
				return this.getNextToken();
			} else if ((token = lineTerminator.exec(str))) {
				this._tokLen = 0;
				this._str = str.slice(token[0].length);
				this.line++;
				this.col = 1;
				return this.getNextToken();
			} else {
				this.error('Invalid token');
			}

			this._tokLen = token[0].length;
			this._str = str.slice(this._tokLen);

			return {
				type: type,
				value: token[0]
			};
		},

		error: function (message, line, col) {
			var err = new SyntaxError(message);

			err.line = line || this.line;
			err.col = col || this.col;

			throw err;
		}
	};

	function JSONParser(lexer) {
		this.lex = lexer;
	}

	JSONParser.prototype = {
		parse: function () {
			var lex = this.lex, jsValue = this.getValue();

			if (lex.getNextToken() !== 'END') {
				lex.error('Illegal token');
			}

			return jsValue;
		},
		getObject: function () {
			var
			jsObj = {},
			lex = this.lex,
			token, tval, prop,
			line, col,
			pairs = false;

			while (true) {
				token = lex.getNextToken();
				tval = token.value;

				if (tval === RIGHT_CURLY) {
					return jsObj;
				}

				if (pairs) {
					if (tval === COMMA) {
						line = lex.line;
						col = lex.col - 1;
						token = lex.getNextToken();
						tval = token.value;
						if (tval === RIGHT_CURLY) {
							lex.error('Invalid trailing comma', line, col);
						}
					}
					else {
						lex.error('Illegal token where expect comma or right curly bracket');
					}
				}
				else if (tval === COMMA) {
					lex.error('Invalid leading comma');
				}

				if (token.type != tokenType.STRING) {
					lex.error('Illegal token where expect string property name');
				}

				prop = this.getString(tval);

				token = lex.getNextToken();
				tval = token.value;

				if (tval != COLON) {
					lex.error('Illegal token where expect colon');
				}

				jsObj[prop] = this.getValue();
				pairs = true;
			}
		},
		getArray: function () {
			var
			jsArr = [],
			lex = this.lex,
			token, tval,
			line, col,
			values = false;

			while (true) {
				token = lex.getNextToken();
				tval = token.value;

				if (tval === RIGHT_BRACE) {
					return jsArr;
				}

				if (values) {
					if (tval === COMMA) {
						line = lex.line;
						col = lex.col - 1;
						token = lex.getNextToken();
						tval = token.value;

						if (tval === RIGHT_BRACE) {
							lex.error('Invalid trailing comma', line, col);
						}
					} else {
						lex.error('Illegal token where expect comma or right square bracket');
					}
				} else if (tval === COMMA) {
					lex.error('Invalid leading comma');
				}

				jsArr.push(this.getValue(token));
				values = true;
			}
		},
		getString: function (strVal) {
			return strVal.slice(1, -1).replace(/\\u?([0-9A-F]{4}|["\\\/bfnrt])/g, function (match, escVal) {
				return escChars[escVal] || String.fromCharCode(parseInt(escVal, 16));
			});
		},
		getValue: function(fromToken) {
			var lex = this.lex,
				token = fromToken || lex.getNextToken(),
				tval = token.value;
			switch (token.type) {
				case tokenType.PUNCTUATOR:
					if (tval === LEFT_CURLY) {
						return this.getObject();
					} else if (tval === LEFT_BRACE) {
						return this.getArray();
					}

					lex.error('Illegal punctoator');

					break;
				case tokenType.STRING:
					return this.getString(tval);
				case tokenType.NUMBER:
					return Number(tval);
				case tokenType.BOOLEAN:
					return tval === 'true';
				case tokenType.NULL:
					return null;
				default:
					lex.error('Invalid value');
			}
		}
	};

	function filter(base, prop, value) {
		if (typeof value === 'undefined') {
			delete base[prop];
			return;
		}
		base[prop] = value;
	}

	function walk(holder, name, rev) {
		var val = holder[name], i, len;

		if (toString.call(val).slice(8, -1) === 'Array') {
			for (i = 0, len = val.length; i < len; i++) {
				filter(val, i, walk(val, i, rev));
			}
		} else if (typeof val === 'object') {
			for (i in val) {
				if (hasOwnProperty.call(val, i)) {
					filter(val, i, walk(val, i, rev));
				}
			}
		}

		return rev.call(holder, name, val);
	}

	function pad(value, length) {
		value = String(value);

		return value.length >= length ? value : new Array(length - value.length + 1).join('0') + value;
	}

	Window.prototype.JSON = {
		parse: function (JSONStr, reviver) {
			var jsVal = new JSONParser(new JSONLexer(JSONStr)).parse();

			if (typeof reviver === 'function') {
				return walk({
					'': jsVal
				}, '', reviver);
			}

			return jsVal;
		},
		stringify: function () {
			var
			value = arguments[0],
			replacer = typeof arguments[1] === 'function' ? arguments[1] : null,
			space = arguments[2] || '',
			spaceSpace = space ? ' ' : '',
			spaceReturn = space ? '\n' : '',
			className = toString.call(value).slice(8, -1),
			array, key, hasKey, index, length, eachValue;

			if (value === null || className === 'Boolean' || className === 'Number') {
				return value;
			}

			if (className === 'Array') {
				array = [];

				for (length = value.length, index = 0, eachValue; index < length; ++index) {
					eachValue = replacer ? replacer(index, value[index]) : value[index];
					eachValue = this.stringify(eachValue, replacer, space);

					if (eachValue === undefined || eachValue === null) {
						eachValue = 'null';
					}

					array.push(eachValue);
				}

				return '[' + spaceReturn + array.join(',' + spaceReturn).replace(/^/mg, space) + spaceReturn + ']';
			}

			if (className === 'Date') {
				return '"' + value.getUTCFullYear() + '-' +
				pad(value.getUTCMonth() + 1, 2)     + '-' +
				pad(value.getUTCDate(), 2)          + 'T' +
				pad(value.getUTCHours(), 2)         + ':' +
				pad(value.getUTCMinutes(), 2)       + ':' +
				pad(value.getUTCSeconds(), 2)       + '.' +
				pad(value.getUTCMilliseconds(), 3)  + 'Z' + '"';
			}

			if (className === 'String') {
				return '"' + value.replace(/"/g, '\\"') + '"';
			}

			if (typeof value === 'object') {
				array = [];
				hasKey = false;

				for (key in value) {
					if (hasOwnProperty.call(value, key)) {
						eachValue = replacer ? replacer(key, value[key]) : value[key];
						eachValue = this.stringify(eachValue, replacer, space);

						if (eachValue !== undefined) {
							hasKey = true;

							array.push('"' + key + '":' + spaceSpace + eachValue);
						}
					}
				}

				if (!hasKey) {
					return '{}';
				} else {
					return '{' + spaceReturn + array.join(',' + spaceReturn).replace(/^/mg, space) + spaceReturn + '}';
				}
			}
		}
	};
})();

}
if (!Array.prototype.filter) {
// Array.prototype.filter
Array.prototype.filter = function filter(callback, scope) {
	for (var array = this, arrayB = [], index = 0, length = array.length, element; index < length; ++index) {
		element = array[index];

		if (callback.call(scope || window, element, index, array)) {
			arrayB.push(element);
		}
	}

	return arrayB;
};

}
})(window);