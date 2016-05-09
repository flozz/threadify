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
            },
           testHelpers: {
                files: {
                  'test/_tmp/helpers.js': ['src/helpers.js'],
                },
                options: {
                    browserifyOptions: {
                        'standalone': 'testHelpers'
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
                browser: true,
                globals: {
                    ImageData: false
                }
            }
        },

        jscs: {
            src: ['src/*.js', 'test/*Spec.js'],
            options: {
                config: ".jscsrc"
            }
        },

        jasmine: {
            pivotal: {
                src: [
                    'dist/<%= pkg.name %>.js',
                    'test/_tmp/*.js'
                ],
                options: {
                    specs: 'test/*Spec.js'
                }
            }
        }

    });

    // Load the plugins.
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks("grunt-jscs");

    // Default task(s).
    grunt.registerTask('default', ['browserify:dist', 'uglify']);
    grunt.registerTask('test', ['jshint', 'jscs', 'browserify:testHelpers', 'browserify:dist' /*, 'jasmine'*/]);

};
