describe("Threadify factory", function () {

    it("can returns a job factory function", function () {
        var fn = threadify(function () {});

        expect(fn instanceof Function).toBeTruthy();
        expect(fn.toString()).toMatch(/return\s+new\s+Job/);
    });

});

describe("Job factory", function () {

    it("can spawns a worker", function (done) {
        var callbacks = {
            done: function () {
                expect(callbacks.done).toHaveBeenCalledWith("ok");
                done();
            }
        };

        spyOn(callbacks, "done").and.callThrough();

        var fn = threadify(function () {
            return "ok";
        });

        var job = fn();

        job.done = callbacks.done;
    });

    it("can sends arguments to the worker", function (done) {
        var callbacks = {
            done: function () {
                expect(callbacks.done).toHaveBeenCalledWith("foobar");
                done();
            }
        };

        spyOn(callbacks, "done").and.callThrough();

        var fn = threadify(function (a, b) {
            return a + b;
        });

        var job = fn("foo", "bar");

        job.done = callbacks.done;
    });

});
