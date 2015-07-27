module.exports =  {

    // /!\ This function should be duplicated in the worker code
    serializeArgs: function (args) {
        var serializedArgs = [];
        var transferrable = [];

        return {
            args: serializedArgs,
            transferrable: transferrable
        };
    },

    // /!\ This function should be duplicated in the worker code
    unserializeArgs: function (args) {
        var unserializedArgs = [];

        return unserializedArgs;
    }
};
