describe("helpers", function () {
    describe("serializeArgs", function () {

        it("can serialize simple arguments", function () {
            var result = testHelpers.serializeArgs(["param1", "param2"]);

            expect(result.args).toBeDefined();
            expect(result.args.length).toEqual(2);
            expect(result.args[0].type).toEqual("arg");
            expect(result.args[0].value).toEqual("param1");
            expect(result.args[1].type).toEqual("arg");
            expect(result.args[1].value).toEqual("param2");

            expect(result.transferrable).toBeDefined();
            expect(result.transferrable.length).toBe(0);
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
