describe("Threadify worker", function () {

    it("can returns a value", function (done) {
        var callbacks = {
            done: function () {},
            failed: function () {},
            terminated: function () {
                expect(callbacks.done).toHaveBeenCalledWith("ok");
                expect(callbacks.failed).not.toHaveBeenCalled();
                expect(callbacks.terminated).toHaveBeenCalled();
                done();
            }
        };

        spyOn(callbacks, "done");
        spyOn(callbacks, "failed");
        spyOn(callbacks, "terminated").and.callThrough();

        var fn = threadify(function (a) {
            return a;
        });

        var job = fn("ok");

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;
    });

    it("can returns multiple values", function (done) {
        var callbacks = {
            done: function () {},
            failed: function () {},
            terminated: function () {
                expect(callbacks.done).toHaveBeenCalledWith("foo", "bar");
                expect(callbacks.failed).not.toHaveBeenCalled();
                expect(callbacks.terminated).toHaveBeenCalled();
                done();
            }
        };

        spyOn(callbacks, "done");
        spyOn(callbacks, "failed");
        spyOn(callbacks, "terminated").and.callThrough();

        var fn = threadify(function (a, b) {
            this.return(a, b);
        });

        var job = fn("foo", "bar");

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;
    });

    it("can returns a value (async)", function (done) {
        var callbacks = {
            done: function () {},
            failed: function () {},
            terminated: function () {
                expect(callbacks.done).toHaveBeenCalledWith("foo", "bar");
                expect(callbacks.failed).not.toHaveBeenCalled();
                expect(callbacks.terminated).toHaveBeenCalled();
                done();
            }
        };

        spyOn(callbacks, "done");
        spyOn(callbacks, "failed");
        spyOn(callbacks, "terminated").and.callThrough();

        var fn = threadify(function (a, b) {
            var thread = this;
            setTimeout(function () {
                thread.return(a, b);
            }, 100);
        });

        var job = fn("foo", "bar");

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;
    });

    it("is not terminated if it does not return nothing", function (done) {
        var callbacks = {
            done: function () {},
            failed: function () {},
            terminated: function () {}
        };

        spyOn(callbacks, "done");
        spyOn(callbacks, "failed");
        spyOn(callbacks, "terminated").and.callThrough();

        var fn = threadify(function () {});

        var job = fn();

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;

        setTimeout(function () {
            expect(callbacks.done).not.toHaveBeenCalled();
            expect(callbacks.failed).not.toHaveBeenCalled();
            expect(callbacks.terminated).not.toHaveBeenCalled();
            job.terminate();
            done();
        }, 100);
    });

    it("can terminates itself", function (done) {
        var callbacks = {
            done: function () {},
            failed: function () {},
            terminated: function () {
                expect(callbacks.done).not.toHaveBeenCalled();
                expect(callbacks.failed).not.toHaveBeenCalled();
                expect(callbacks.terminated).toHaveBeenCalled();
                done();
            }
        };

        spyOn(callbacks, "done");
        spyOn(callbacks, "failed");
        spyOn(callbacks, "terminated").and.callThrough();

        var fn = threadify(function () {
            this.terminate();
        });

        var job = fn();

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;
    });

    it("can reports non fatal error without terminating", function (done) {
        var callbacks = {
            done: function () {},
            failed: function () {},
            terminated: function () {}
        };

        spyOn(callbacks, "done");
        spyOn(callbacks, "failed");
        spyOn(callbacks, "terminated").and.callThrough();

        var fn = threadify(function () {
            this.error("test-error");
        });

        var job = fn();

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;

        setTimeout(function () {
            expect(callbacks.done).not.toHaveBeenCalled();
            expect(callbacks.failed).toHaveBeenCalledWith("test-error");
            expect(callbacks.terminated).not.toHaveBeenCalled();
            job.terminate();
            done();
        }, 100);
    });

    it("can reports errors thrown in the threadified function (and terminating itself)", function (done) {
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

        var fn = threadify(function () {
            throw "test-error";
        });

        var job = fn();

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;
    });

});
