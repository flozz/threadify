module.exports = function(config) {
    var cfg = {
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
        singleRun: true,

        customLaunchers: {
            Chrome_travis_ci: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        },
    };

    if (process.env.TRAVIS) {
        cfg.browsers = ['Firefox', 'Chrome_travis_ci'];
    }

    config.set(cfg);
};
