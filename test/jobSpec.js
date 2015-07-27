describe("Job", function () {

    it("can reports that the worker was terminated", function (done) {
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

    it("can retrieves a value from the worker", function (done) {
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

    it("can retrieves multiple values from the worker", function (done) {
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

    it("can reports error that occurred in the worker", function (done) {
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

    it("can terminates the worker", function (done) {
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

        var fn = threadify(function () {});

        var job = fn();

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;

        job.terminate();
    });

});
