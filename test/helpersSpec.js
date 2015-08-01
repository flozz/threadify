describe("helpers", function () {
    describe("serializeArgs", function () {

        it("can serialize simple arguments", function () {
            var result = testHelpers.serializeArgs(["test", 42, true, false, [1, 2], {a: 1, b: 2}, null, undefined]);

            expect(result.args).toBeDefined();
            expect(result.args.length).toEqual(8);

            expect(result.args[0].type).toEqual("arg");
            expect(result.args[0].value).toEqual("test");

            expect(result.args[1].type).toEqual("arg");
            expect(result.args[1].value).toEqual(42);

            expect(result.args[2].type).toEqual("arg");
            expect(result.args[2].value).toBe(true);

            expect(result.args[3].type).toEqual("arg");
            expect(result.args[3].value).toBe(false);

            expect(result.args[4].type).toEqual("arg");
            expect(result.args[4].value).toEqual([1, 2]);

            expect(result.args[5].type).toEqual("arg");
            expect(result.args[5].value).toEqual({a: 1, b: 2});

            expect(result.args[6].type).toEqual("arg");
            expect(result.args[6].value).toBe(null);

            expect(result.args[7].type).toEqual("arg");
            expect(result.args[7].value).toBe(undefined);

            expect(result.transferable).toBeDefined();
            expect(result.transferable.length).toBe(0);
        });

        it("can mark ArrayBuffer as transferable", function () {
            var result = testHelpers.serializeArgs([new ArrayBuffer(32)]);

            expect(result.args).toBeDefined();
            expect(result.args.length).toEqual(1);

            expect(result.transferable).toBeDefined();
            expect(result.transferable.length).toBe(1);

            expect(result.transferable[0] instanceof ArrayBuffer).toBeTruthy();
        });
    });

    describe("unserializeArgs", function () {

        it("can unserialize simple arguments", function () {
            var sArgs = [
                {type: "arg", value: "param1"},
                {type: "arg", value: "param2"}
            ];

            var result = testHelpers.unserializeArgs(sArgs);

            expect(result.length).toEqual(2);
            expect(result[0]).toEqual("param1");
            expect(result[1]).toEqual("param2");
        });
    });
});
