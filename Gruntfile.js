module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        browserify: {
            dist: {
                files: {
                  'dist/<%= pkg.name %>.js': ['src/<%= pkg.name %>.js'],
                },
                options: {
                    browserifyOptions: {
                        'standalone': '<%= pkg.name %>'
                    }
                }
            }
        },

        uglify: {
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js': ['dist/<%= pkg.name %>.js']
                }
            }
        },

        jshint: {
            all: ['src/*.js'],
            options: {
                futurehostile: true,
                freeze: true,
                latedef: true,
                noarg: true,
                nocomma: true,
                nonbsp: true,
                nonew: true,
                undef: true,
                node: true,
                browser: true
            }
        },

        jasmine: {
            pivotal: {
                src: 'dist/<%= pkg.name %>.js',
                options: {
                    specs: 'test/*Spec.js'
                }
            }
        }

    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    // Default task(s).
    grunt.registerTask('default', ['browserify', 'uglify']);
    grunt.registerTask('test', ['jshint'/*, 'browserify', 'jasmine'*/]);

};
