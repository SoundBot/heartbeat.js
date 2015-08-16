[![Build Status](https://travis-ci.org/SoundBot/heartbeat.js.svg?branch=master)](https://travis-ci.org/SoundBot/heartbeat.js)
[![Coverage Status](https://coveralls.io/repos/SoundBot/heartbeat.js/badge.svg?branch=master&service=github)](https://coveralls.io/github/SoundBot/heartbeat.js?branch=master)

![](http://soundbot.github.io/heartbeat.js/logo.png)

Track your bugs easy!

HeartBeat.js is a small (8Kb minified), zero-dependency library for sending console events to user-defined URL. It supports all major console events (log, warn, etc.) and errors.

### Installation
#### bower
`bower install heartbeat`
#### npm
`npm install heartbeat.js`
### Usage

Minimal example:

```javascript
var options = {
   url: 'http://example.com/logger'
};
heartbeat.start(options);
```
### Data format
`id` - user identifier

`timestamp` - event timestamp

`data.message` - message (or error) text

`data.url` - page URL

`data.line` - message (or error) line number

`data.col` - message (or error) column number

`event` - event name

`useragent` - browser user agent
#### Example
```javascript
{
  "id":1375674124,
  "timestamp":1439691618654,
  "data":{
    "message":"test",
    "url":"http://example.com",
    "line":"6",
    "col":"13"
},
  "event":"console.log",
  "useragent":"Mozilla/5.0 Chrome/40.0.2403.155 Safari/537.36"
}

```
### Options

#### options.url
Type:`String`

URL where to send log information;
#### options.methods
Type:`Array` Default: `["log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"]`

Console methods to monitor.

#### options.logConsole
Type:`Boolean` Default: `true`

Enable console monitoring
#### options.logError
Type:`Boolean` Default: `true`

Enable error monitoring
#### options.callback
Type:`Function` Default: ` `

Callback function

### License
MIT, see LICENSE file
