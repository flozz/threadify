describe("Threadify main thread", function () {

    it("can spawns a worker from a function", function () {
        var threadifiedFunction = threadify(function () {
            return null;
        });

        var job = threadifiedFunction();

        expect(job._worker instanceof Worker).toBeTruthy();
    });

    it("can sends arguments to the worker and receives the returned value from the worker", function (done) {
        var callbacks = {
            done: function () {},
            failed: function () {},
            terminated: function () {
                expect(callbacks.done).toHaveBeenCalledWith("foobar");
                expect(callbacks.failed).not.toHaveBeenCalled();
                expect(callbacks.terminated).toHaveBeenCalled();
                done();
            }
        };

        spyOn(callbacks, "done");
        spyOn(callbacks, "failed");
        spyOn(callbacks, "terminated").and.callThrough();

        var threadifiedFunction = threadify(function (param1, param2) {
            return param1 + param2;
        });

        var job = threadifiedFunction("foo", "bar");

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;
    });

    it("can spawns more than one instance of a worker", function (done) {
        var threadifiedFunction = threadify(function (param1, param2) {
            return param1 + param2;
        });

        var job1 = threadifiedFunction("foo", "bar");
        var job2 = threadifiedFunction("baz", "buz");

        job1.done = function (value) {
            expect(value).toEqual("foobar");
            job2.done = function (value) {
                expect(value).toEqual("bazbuz");
                done();
            };
        };
    });

    it("can handles errors in the threadified function", function (done) {
        var callbacks = {
            done: function () {},
            failed: function () {},
            terminated: function () {
                expect(callbacks.done).not.toHaveBeenCalled();
                expect(callbacks.failed).toHaveBeenCalledWith("test-error");
                expect(callbacks.terminated).toHaveBeenCalled();
                done();
            }
        };

        spyOn(callbacks, "done");
        spyOn(callbacks, "failed");
        spyOn(callbacks, "terminated").and.callThrough();

        var threadifiedFunction = threadify(function () {
            throw "test-error";
        });

        var job = threadifiedFunction();

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;
    });

    it("can terminates a worker", function (done) {
        var callbacks = {
            done: function () {},
            failed: function () {},
            terminated: function () {
                expect(callbacks.done).not.toHaveBeenCalledWith();
                expect(callbacks.failed).not.toHaveBeenCalled();
                expect(callbacks.terminated).toHaveBeenCalled();
                done();
            }
        };

        spyOn(callbacks, "done");
        spyOn(callbacks, "failed");
        spyOn(callbacks, "terminated").and.callThrough();

        var threadifiedFunction = threadify(function () {});

        var job = threadifiedFunction();

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;

        job.terminate();
    });

});

describe("Threadify worker thread", function () {

    it("can returns a value", function (done) {
        var callbacks = {
            done: function () {},
            failed: function () {},
            terminated: function () {
                expect(callbacks.failed).not.toHaveBeenCalled();
                expect(callbacks.done).toHaveBeenCalledWith("foobar");
                expect(callbacks.terminated).toHaveBeenCalled();
                done();
            }
        };

        spyOn(callbacks, "done");
        spyOn(callbacks, "failed");
        spyOn(callbacks, "terminated").and.callThrough();

        var threadifiedFunction = threadify(function (param1, param2) {
            return param1 + param2;
        });

        var job = threadifiedFunction("foo", "bar");

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;
    });

    it("can returns a value (async)", function (done) {
        var callbacks = {
            done: function () {},
            failed: function () {},
            terminated: function () {
                expect(callbacks.done).toHaveBeenCalledWith("foobar");
                expect(callbacks.failed).not.toHaveBeenCalled();
                expect(callbacks.terminated).toHaveBeenCalled();
                done();
            }
        };

        spyOn(callbacks, "done");
        spyOn(callbacks, "failed");
        spyOn(callbacks, "terminated").and.callThrough();

        var threadifiedFunction = threadify(function (param1, param2) {
            setTimeout(function () {
                this.return(param1 + param2);
            }.bind(this), 100);
        });

        var job = threadifiedFunction("foo", "bar");

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;
    });

    it("can returns multiple values", function (done) {
        var callbacks = {
            done: function () {},
            failed: function () {},
            terminated: function () {
                expect(callbacks.done).toHaveBeenCalledWith("bar", "foo");
                expect(callbacks.failed).not.toHaveBeenCalled();
                expect(callbacks.terminated).toHaveBeenCalled();
                done();
            }
        };

        spyOn(callbacks, "done");
        spyOn(callbacks, "failed");
        spyOn(callbacks, "terminated").and.callThrough();

        var threadifiedFunction = threadify(function (param1, param2) {
            this.return(param2, param1);
        });

        var job = threadifiedFunction("foo", "bar");

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;
    });

    it("can terminates itself", function (done) {
        var callbacks = {
            done: function () {},
            failed: function () {},
            terminated: function () {
                expect(callbacks.done).not.toHaveBeenCalledWith();
                expect(callbacks.failed).not.toHaveBeenCalled();
                expect(callbacks.terminated).toHaveBeenCalled();
                done();
            }
        };

        spyOn(callbacks, "done");
        spyOn(callbacks, "failed");
        spyOn(callbacks, "terminated").and.callThrough();

        var threadifiedFunction = threadify(function () {
            this.terminate();
        });

        var job = threadifiedFunction();

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;
    });

    it("can sends non-fatal error to the main thread", function (done) {
        var callbacks = {
            done: function () {},
            failed: function () {},
            terminated: function () {}
        };

        spyOn(callbacks, "done");
        spyOn(callbacks, "failed").and.callFake(function (error) {
            setTimeout(function () {
                expect(callbacks.done).not.toHaveBeenCalled();
                expect(callbacks.failed).toHaveBeenCalledWith("test-error");
                expect(callbacks.terminated).not.toHaveBeenCalled();
                job.terminate();
                done();
            }, 100);
        });
        spyOn(callbacks, "terminated");

        var threadifiedFunction = threadify(function () {
            this.error("test-error");
        });

        var job = threadifiedFunction();

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;
    });
});
