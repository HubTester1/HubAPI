
const gulp = require('gulp');
const run = require('gulp-run');
const { argv } = require('yargs');

const gulpConfig = require('./gulp.config');


// DOCUMENTATION

// remove local documentation
gulp.task('d-clean', () => run('rimraf _book').exec());
// build local documentation
gulp.task('d-build', () => run('node docs/_build/build.js').exec());
// build local documentation gitbook
gulp.task('d-gb-build', () => run('gitbook build').exec());
// serve local documentation gitbook
gulp.task('d-gb-serve', () => run('gitbook serve').exec());
// watch code; upon changes, execute d-build
gulp.task('d-watch-rebuild', () => {
	gulp.watch('./src', gulp.series('d-build'));
});

// LAMBDA FUNCTIONS LOCAL

// run lambda function locally
gulp.task('ll-run', () => run(gulpConfig.ReturnLLFunctionRunCommand(argv.d, argv.f, argv.e)).exec());
// watch lambda function code; upon changes, run lambda function locally
gulp.task('ll-watch-run', () => {
	gulp.watch(
		gulpConfig.ReturnLLFunctionWatchLocation(argv.d), 
		{ ignored: ['serverless.yaml', './serverless/*'] }, 
		() => run(gulpConfig.ReturnLLFunctionRunCommand(argv.d, argv.f, argv.e)).exec(),
	);
});
// watch lambda function code; upon changes, run lambda function locally
gulp.task('ll-watch-all-run', () => {
	gulp.watch(
		'./src',
		() => run(gulpConfig.ReturnLLFunctionRunCommand(argv.d, argv.f, argv.e)).exec(),
	);
});

// AWS

gulp.task('aws-i', () => run(
	`sls invoke -f ${argv.f} -l`, 
	{ cwd: `src/Lambdas${argv.d}` },
).exec());
