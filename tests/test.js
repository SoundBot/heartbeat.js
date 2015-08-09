
describe("initErrorlog", function() {
    it("window.onerror should be a function", function(){
        heartbeat.initErrorlog();
        expect(typeof window.onerror).toBe('function');
    });
});
