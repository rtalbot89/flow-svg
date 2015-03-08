/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    //banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
    //  '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
    //  '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
    //  '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
   //   ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
      
      banner:  '/* <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
       '<%= grunt.template.today("yyyy-mm-dd") %>*/\n' +
      '/*global SVG, console, window, document, jQuery*/\n',
    // Task configuration.
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: [
        'src/intro.js', 
        'src/init.js',
        'src/generatelookups.js',
        'src/arrowhead.js',
        'src/arrowline.js',
        'src/linelabel.js',
        'src/decision.js',
        'src/finish.js',
        'src/process.js',
        'src/shapefuncs.js',
        'src/start.js',
        'src/setroot.js',
        'src/buttonbar.js',
        'src/makeshapes.js',
        'src/yesnoids.js',
        'src/referringids.js',
        'src/positionshapes.js',
        'src/hideshapes.js',
        'src/togglenext.js',
        'src/staticnodepoints.js',
        'src/nodepoints.js',
        'src/addlabels.js',
        'src/staticaddlabels.js',
        'src/addarrows.js',
        'src/staticaddarrows.js',
        'src/angleline.js',
        'src/addconnectors.js',
        'src/staticaddconnectors.js',
        'src/layoutshapes.js',
        'src/outro.js'
        ],
        dest: 'dist/flowsvg.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/flowsvg.min.js'
      }
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {
          jQuery: true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['lib/**/*.js', 'test/**/*.js']
      }
    },
    jasmine: {
    all: {
      src: 'dist/flowsvg.js',
      options: {
        vendor: ['vendor/svg.js'],
        specs: 'spec/*Spec.js'
        //helpers: 'spec/*Helper.js'
      }
    }
  },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'qunit']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  //grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

  // Default task.
  grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);

};
