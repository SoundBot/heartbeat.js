describe("initErrorlog", function() {
    it("window.onerror should be a function", function(){
        heartbeat.initErrorlog();
        expect(typeof window.onerror).toBe('function');
    });

    it("window.onerror should send a message", function(){
        spyOn(heartbeat, 'sendMessage');
        window.onerror('test', 'http://test.loc', 5, 6, {});
        expect(heartbeat.sendMessage).toHaveBeenCalled();
    });

    it("Should call initErrorlog", function(){
        spyOn(heartbeat, 'initErrorlog');
        heartbeat.start({url: 'http://test.loc', logError: true});
        expect(heartbeat.initErrorlog).toHaveBeenCalled();
    });
});

describe("readProperties", function() {
    it("Should extract only booleans, numbers and strings", function(){
        var object = {
          test1: 'test',
          test2: 5,
          test3: function(){ return true; },
          test4: {test5: false}
        };
        expect(readProperties(object)).toBe('test1testtest25test3test4test5false');
    });
});

describe("makeHash", function() {
    it("Should be zero for empty string", function(){
        expect(makeHash('')).toBe(0);
    });

    it("Should be 3556498 for test string", function(){
        expect(makeHash('test')).toBe(3556498);
    });
});

describe("prepareId", function() {
    it("Should return a number", function(){
        expect(prepareId()).toEqual(jasmine.any(Number));
    });
});

describe("xdr", function() {
      it("Should return promise", function(){
        var promise = xdr('http://localhost', 'POST', 'test');
        expect(promise.then).toBeDefined();
    });
});

describe("start", function() {
      it("Should set options", function(){
        var nop = function(){};

        heartbeat.start({
          url: 'http://localhost',
          logConsole: true,
          logError: false,
          callback: nop
        });

        var opt = {
          url: 'http://localhost',
          delay: 0,
          methods: ["log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"],
          logConsole: true,
          logError: false,
          callback: nop
        };

        expect(options).toEqual(opt);
    });
});

describe("sendMessage", function() {
    it("Should be defined", function(){
      expect(heartbeat.sendMessage('test', 'test')).toBe(undefined);
    });
});

describe("initConsole", function() {
    it("Should modify console.log", function(){
      var warn = console.warn;

      heartbeat.start({url: 'http://localhost', methods: ['warn']});
      expect(console.warn).not.toEqual(warn);
    });
});
