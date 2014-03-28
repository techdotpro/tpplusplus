module.exports = function (grunt) {
	'use strict';
    // Project configuration
    grunt.initConfig({
        // Metadata
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            '*/\n',
        // Task configuration
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: [
                    'lib/intro.js',
                    'lib/shims.js',
                    'lib/tp.js',
                    'lib/utils.js',
                    'lib/events.js',
                    'lib/dom.js',
                    'lib/frames.js',
					'lib/user.js',
                    'lib/widgets.js',
                    'lib/ui.js',
                    'lib/run.js',
                    'lib/outro.js'
                ],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            options: {
                jshintrc: true
            },
            gruntfile: {
                src: 'gruntfile.js'
            },
            all: {
                src: ['lib/**/*.js', '!lib/intro.js', '!lib/outro.js', '!lib/utils.js']
            }
        },
        qunit: {
            files: ['test/**/*.html']
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            all: {
                files: 'lib/**/*.js',
                tasks: ['concat', 'uglify']
            }
        },
        docco: {
            debug: {
                src: ['dist/tpplusplus.js'],
                options: {
                    output: 'docs/'
                }
            }
        }

    });

    // These plugins provide necessary tasks
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-docco');

    // Default task
    grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
};
