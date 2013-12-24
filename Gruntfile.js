module.exports = function (grunt) {
	grunt.initConfig({
		pkg:grunt.file.read('package.json'),
		coffee:{
			compile:{
				files:{
					'js/binaural.js' : 'js/coffee/binaural.coffee'
				}
			}
		},
		sass: {
			dist: {
				options: {
					style: 'expanded'
				},
				files: {
					'css/binaural.css' : 'css/sass/binaural.scss'
				}
			}
		},

		watch: {
			scripts: {
				files: 'js/coffee/**',
				tasks: ['coffee']
			},
			styles: {
				files: 'css/sass/**',
				tasks: ['sass'],
				options: {
					livereload: true,
				},
			}
		},
	});
	
	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default',['coffee', 'sass']);
}