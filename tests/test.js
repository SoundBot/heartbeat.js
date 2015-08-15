describe("initErrorlog", function() {
    it("window.onerror should be a function", function(){
        heartbeat.initErrorlog();
        expect(typeof window.onerror).toBe('function');
    });

    // it("window.onerror should send a message", function(){
    //     expect(window.onerror()).toBe('function');
    // });
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
    it("Should return a number", function(){
        expect(prepareId()).toEqual(jasmine.any(Number));
    });
});
