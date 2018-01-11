'use strict';

module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				freeze: true,
				latedef: true,
				strict: true,
				undef: true,
				unused: true,
				esnext: true
			},
			node_src: {
				options: {
					node: true
				},
				src: ['Gruntfile.js', 'lib/*.js']
			},
			test_src: {
				options: {
					node: true,
					mocha: true
				},
				src: ['test/*.js']
			},
			browser_src: {
				options: {
					strict: 'global',
					browser: true,
					browserify: true,
					jquery: true
				},
				src: ['web/js/*.js']
			}
		},

		htmlhint: {
			src: ['web/*.html']
		},

		jscs: {
			options: {
				preset: 'airbnb',
				validateIndentation: '\t',
				maximumLineLength: 120,
				requireTrailingComma: false,
				disallowTrailingComma: true,
				requirePaddingNewLinesAfterBlocks: false,
				requirePaddingNewLinesBeforeLineComments: false,
				requireCamelCaseOrUpperCaseIdentifiers: false
			},
			src: ['Gruntfile.js', 'lib/*.js', 'test/*.js', 'web/js/*.js']
		},

		mochaTest: {
			test: {
				options: {
					reporter: 'spec'
				},
				src: ['test/**/*.js']
			}
		},

		browserify: {
			compile: {
				src: ['web/js/*.js', 'lib/*.js'],
				dest: 'build/temp/main.bundled.js',
				options: {
					alias: {
						cgr: './lib/cgr.js'
					}
				}
			}
		},

		babel: {
			options: {
				presets: ['env'],
				plugins: ['transform-remove-strict-mode']
			},
			compile: {
				files: {
					'build/temp/main.babeld.js': 'build/temp/main.bundled.js'
				}
			}
		},

		uglify: {
			compile: {
				options: {
					banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */',
					output: {
						ascii_only: true
					},
					mangle: false
				},
				src: 'build/temp/main.babeld.js',
				dest: 'build/web/main.js'
			}
		},

		htmlmin: {
			compile: {
				options: {
					removeComments: true,
					collapseWhitespace: true,
					minifyCSS: true
				},
				files: {
					'build/web/index.html': 'web/index.html'
				}
			}
		},

		clean: {
			temp: ['build/temp'],
			web: ['build/web'],
			all: ['build']
		}
	});

	grunt.registerTask('test', ['mochaTest', 'jscs', 'jshint', 'htmlhint']);
	grunt.registerTask('web', [
		'clean:web', 'clean:temp', 'browserify', 'babel', 'uglify', 'htmlmin'
	]);

	grunt.registerTask('default', ['test', 'web']);
};
