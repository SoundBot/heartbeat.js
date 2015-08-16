![](http://soundbot.github.io/heartbeat.js/logo.png)

##### Console monitoring library

HeartBeat.js is a small (8Kb minified), zero-dependency library for sending console events to user-defined URL. Supports all major console events (log, warn, etc.) and errors.

### Usage

Minimal example:

```javascript
var options = {
   url: 'http://example.com/logger'
};
hearbeat.start(options);
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
