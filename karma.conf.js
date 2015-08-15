var path = require('path');

module.exports = function(config) {

  config.set({

    frameworks: ['jasmine'],

    files: [
      'tests/**/*.js',
      'src/**/*.js',
    ],

    preprocessors: {
     'src/heartbeat.js': ['coverage']
    },

    coverageReporter: {
     type : 'html',
     dir : 'coverage/'
    },

    reporters: ['progress', 'saucelabs', 'coverage'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: false,

    browsers: ['Chrome', 'Firefox', 'Safari'],

    singleRun: true,

    sauceLabs: {
      testName: 'heartbeat.js',
      startConnect: true,
      options: {
        'selenium-version': '2.41.0'
      }
    }

  });

  if (process.env.TRAVIS) {
    var customLaunchers = {
      'SL_Chrome': {
        base: 'SauceLabs',
        browserName: 'chrome',
        version: '39'
      },
      'SL_Firefox': {
        base: 'SauceLabs',
        browserName: 'firefox',
        version: '31'
      },
      'SL_Safari': {
        base: 'SauceLabs',
        browserName: 'safari',
        platform: 'OS X 10.10',
        version: '8'
      },
      'SL_IE_9': {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 2008',
        version: '9'
      },
      'SL_IE_10': {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 2012',
        version: '10'
      },
      'SL_IE_11': {
        base: 'SauceLabs',
        browserName: 'internet explorer',
        platform: 'Windows 8.1',
        version: '11'
      },
      'SL_iOS': {
        base: "SauceLabs",
        browserName: "iphone",
        platform: "OS X 10.10",
        version: "8.1"
      }
    };

    var buildLabel = 'TRAVIS #' + process.env.TRAVIS_BUILD_NUMBER + ' (' + process.env.TRAVIS_BUILD_ID + ')';
    config.browserNoActivityTimeout = 120000;
    config.sauceLabs.build = buildLabel;
    config.sauceLabs.startConnect = false;
    config.sauceLabs.tunnelIdentifier = process.env.TRAVIS_JOB_NUMBER;
    config.sauceLabs.recordScreenshots = false;
    //don't kill browsers in the cloud
    config.captureTimeout = 0;
    config.customLaunchers = customLaunchers;
    config.browsers = Object.keys(customLaunchers);

  }


};
