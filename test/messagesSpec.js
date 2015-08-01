// jscs:disable maximumLineLength

describe("messages", function () {
    it("can pass simple values (String, Number, Boolean, Object, Array, null, undefined, NaN) between the main thread and the worker", function (done) {
        var callbacks = {
            done: function (values) {
                expect(values.length).toEqual(9);
                expect(values[0]).toBe("test");
                expect(values[1]).toBe(42);
                expect(values[2]).toBe(true);
                expect(values[3]).toBe(false);

                expect(values[4].length).toEqual(2);
                expect(values[4][0]).toBe(1);
                expect(values[4][1]).toBe(2);

                expect(values[5].a).toBe(1);
                expect(values[5].b).toBe(2);

                expect(values[6]).toBe(null);
                expect(values[7]).toBe(undefined);
                expect(values[8]).toBeNaN();
            },
            failed: function () {},
            terminated: function () {
                expect(callbacks.done).toHaveBeenCalled();
                expect(callbacks.failed).not.toHaveBeenCalled();
                expect(callbacks.terminated).toHaveBeenCalled();
                done();
            }
        };

        spyOn(callbacks, "done").and.callThrough();
        spyOn(callbacks, "failed");
        spyOn(callbacks, "terminated").and.callThrough();

        var fn = threadify(function () {
            var args = [];

            for (var i = 0 ; i < arguments.length ; i++) {
                args.push(arguments[i]);
            }

            return args;
        });

        var job = fn("test", 42, true, false, [1, 2], {a: 1, b: 2}, null, undefined, NaN);

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;
    });

    it("can pass mathematical values/const (Infinity, Math.PI, Math.E) between the main thread and the worker", function (done) {
        var callbacks = {
            done: function () {},
            failed: function () {},
            terminated: function () {
                expect(callbacks.done).toHaveBeenCalledWith([Infinity, Math.PI, Math.E]);
                expect(callbacks.failed).not.toHaveBeenCalled();
                expect(callbacks.terminated).toHaveBeenCalled();
                done();
            }
        };

        spyOn(callbacks, "done");
        spyOn(callbacks, "failed");
        spyOn(callbacks, "terminated").and.callThrough();

        var fn = threadify(function () {
            var args = [];

            for (var i = 0 ; i < arguments.length ; i++) {
                args.push(arguments[i]);
            }

            return args;
        });

        var job = fn(Infinity, Math.PI, Math.E);

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;
    });

    it("can pass Error objects between the main thread and the worker", function (done) {
        var obj = new Error("test-error");

        var callbacks = {
            done: function () {},
            failed: function () {},
            terminated: function () {
                expect(callbacks.done).toHaveBeenCalledWith(obj);
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

        var job = fn(obj);

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;
    });

    it("can transfer ArrayBuffer between the main thread and the worker", function (done) {
        var buff = new ArrayBuffer(32);

        var view = new DataView(buff);
        view.setInt8(0, 42);

        var callbacks = {
            done: function (a) {
                expect(new DataView(a).getInt8(0)).toEqual(42);
                expect(new DataView(a).byteLength).toEqual(32);
            },
            failed: function () {},
            terminated: function () {
                expect(callbacks.done).toHaveBeenCalled();
                expect(callbacks.failed).not.toHaveBeenCalled();
                expect(callbacks.terminated).toHaveBeenCalled();
                done();
            }
        };

        spyOn(callbacks, "done").and.callThrough();
        spyOn(callbacks, "failed");
        spyOn(callbacks, "terminated").and.callThrough();

        var fn = threadify(function (a) {
            var thread = this;
            setTimeout(function () {
                thread.return(a);
            }, 100);
        });

        expect(view.getInt8(0)).toEqual(42);
        expect(view.byteLength).toEqual(32);

        var job = fn(buff);

        expect(view.byteLength).toEqual(0);  // transfered

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;
    });

    it("can transfer TypedArray between the main thread and the worker", function (done) {
        var arr = new Uint8Array(32);
        arr[0] = 42;

        var callbacks = {
            done: function (a) {
                expect(a instanceof Uint8Array).toBeTruthy();
                expect(a[0]).toEqual(42);
                expect(a.length).toEqual(32);
            },
            failed: function () {},
            terminated: function () {
                expect(callbacks.done).toHaveBeenCalled();
                expect(callbacks.failed).not.toHaveBeenCalled();
                expect(callbacks.terminated).toHaveBeenCalled();
                done();
            }
        };

        spyOn(callbacks, "done").and.callThrough();
        spyOn(callbacks, "failed");
        spyOn(callbacks, "terminated").and.callThrough();

        var fn = threadify(function (a) {
            var thread = this;
            setTimeout(function () {
                thread.return(a);
            }, 100);
        });

        expect(arr[0]).toEqual(42);
        expect(arr.length).toEqual(32);

        var job = fn(arr);

        expect(arr.length).toEqual(0);  // transfered

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;
    });

    it("can transfer DataView between the main thread and the worker", function (done) {
        var buff = new ArrayBuffer(32);

        var view = new DataView(buff);
        view.setInt8(0, 42);

        var callbacks = {
            done: function (a) {
                expect(a instanceof DataView).toBeTruthy();
                expect(a.getInt8(0)).toEqual(42);
                expect(a.byteLength).toEqual(32);
            },
            failed: function () {},
            terminated: function () {
                expect(callbacks.done).toHaveBeenCalled();
                expect(callbacks.failed).not.toHaveBeenCalled();
                expect(callbacks.terminated).toHaveBeenCalled();
                done();
            }
        };

        spyOn(callbacks, "done").and.callThrough();
        spyOn(callbacks, "failed");
        spyOn(callbacks, "terminated").and.callThrough();

        var fn = threadify(function (a) {
            var thread = this;
            setTimeout(function () {
                thread.return(a);
            }, 100);
        });

        expect(view.getInt8(0)).toEqual(42);
        expect(view.byteLength).toEqual(32);

        var job = fn(view);

        expect(view.byteLength).toEqual(0);  // transfered

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;
    });

    it("can copy Blob between the main thread and the worker", function (done) {
        var blob = new Blob(["hello"], {type: "text/x-test"});

        var callbacks = {
            done: function (b) {
                expect(b instanceof Blob).toBeTruthy();
                expect(b.size).toEqual(5);
                expect(b.type).toEqual("text/x-test");
            },
            failed: function () {},
            terminated: function () {
                expect(callbacks.done).toHaveBeenCalled();
                expect(callbacks.failed).not.toHaveBeenCalled();
                expect(callbacks.terminated).toHaveBeenCalled();
                done();
            }
        };

        spyOn(callbacks, "done").and.callThrough();
        spyOn(callbacks, "failed");
        spyOn(callbacks, "terminated").and.callThrough();

        var fn = threadify(function (a) {
            var thread = this;
            setTimeout(function () {
                thread.return(a);
            }, 100);
        });

        var job = fn(blob);

        job.done = callbacks.done;
        job.failed = callbacks.failed;
        job.terminated = callbacks.terminated;
    });
});

// jscs:enable
