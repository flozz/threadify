module.exports = function(config) {
    config.set({
        frameworks: ['jasmine'],
        files: [
            'dist/threadify.js',
            'test/_tmp/helpers.js',
            'test/*Spec.js'
        ],
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['Firefox', 'Chrome'],
        captureTimeout: 60000,
        singleRun: true
    });
};
