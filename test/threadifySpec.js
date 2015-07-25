describe("Threadify", function() {

    it("can spawn a worker from a function", function() {
        var threadifiedFunction = threadify(function() { return 1; });

        var job = threadifiedFunction();

        expect(job._worker instanceof Worker).toBeTruthy();
    });

    it("can send arguments to the worker and receive the returned value from the worker", function(done) {
        var threadifiedFunction = threadify(function(param1, param2) {
            return param1 + param2;
        });

        var job = threadifiedFunction("foo", "bar");
        job.done = function(value) {
            expect(value).toEqual("foobar");
            done();
        }

    });
});
