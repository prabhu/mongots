module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ['dist'],
    ts: {
      default: {
        src: ['src/index.ts', 'src/lib/**/*.ts', 'src/test_ts/**/*.ts', '!src/**/.baseDir.ts'],
        outDir: 'dist',
        options: {
          module: 'commonjs',
          target: 'es5',
          verbose: true,
          declaration: true
        }
      }
    },
    watch: {
      files: '**/*.ts',
      tasks: ['ts']
    }
  });

  grunt.registerTask('default', ['clean', 'ts']); 
}
