
const gulp = require('gulp');
const run = require('gulp-run');
const del = require('del');
const path = require('path');
const { argv } = require('yargs');

const gulpConfig = require('./gulp.config');

// UTILITIES

// delete
gulp.task('delete', (patternArray) => del(patternArray));


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
	gulp.watch(['./src', './docs/_build/build.js'], gulp.series('d-build'));
});

// LAMBDA FUNCTIONS LOCAL

// run lambda function locally
gulp.task('ll-run', () => run(gulpConfig.ReturnLLFunctionRunCommand(argv.d, argv.fn, argv.e)).exec());
// watch lambda function code; upon changes, run lambda function locally
gulp.task('ll-watch-run', () => {
	gulp.watch(
		gulpConfig.ReturnLambdaDirectory(argv.d), 
		{ ignored: ['serverless.yaml', './serverless/*'] }, 
		() => run(gulpConfig.ReturnLLFunctionRunCommand(argv.d, argv.fn, argv.e)).exec(),
	);
});
// watch lambda function code; upon changes, run lambda function locally
gulp.task('ll-watch-all-run', () => {
	gulp.watch(
		'./src',
		() => run(gulpConfig.ReturnLLFunctionRunCommand(argv.d, argv.fn, argv.e)).exec(),
	);
});

// SERVICE FUNCTIONS LOCAL

gulp.task('sf-run', () => run(gulpConfig.ReturnServiceFunctionRunCommand(argv.dir, argv.function)).exec());

// AWS

// run lambda function on AWS
gulp.task('aws-i', () => run(
	`sls invoke -f ${argv.fn} -l`, 
	{ cwd: gulpConfig.ReturnLambdaDirectory(argv.d) },
).exec());
// deploy entire lambda function stack, CF included, to AWS
gulp.task('aws-d-s', () => run(
	'sls deploy -v', 
	{ cwd: gulpConfig.ReturnLambdaDirectory(argv.d) },
).exec());
// deploy lambda function only to AWS
gulp.task('aws-d-f', () => run(
	`sls deploy function -f ${argv.fn}`, 
	{ cwd: gulpConfig.ReturnLambdaDirectory(argv.d) },
).exec());
// retrieve lambda function log from AWS
gulp.task('aws-l', () => run(
	`sls logs -f ${argv.fn} -t`,
	{ cwd: gulpConfig.ReturnLambdaDirectory(argv.d) },
).exec());

// MODULES

const mClean = (location) => del([
	`${location}/package-lock.json`,
	`${location}/node_modules`,
]);

const mInstall = (location) => run(`npm install --prefix ${location}`).exec();


const deploy = (location) =>
	// return a new promise
	new Promise((resolve, reject) => {
		process.chdir(location);
		run('sls deploy').exec();
		resolve();
	});

gulp.task('m-deploy', () => 
	// return a new promise
	new Promise((resolve, reject) => {
		let parentPath = path.join(__dirname, '/src');
		let modulesPath = '';
		switch (argv.e) {
		case 'd':
			parentPath += '/dev';
			break;
		case 'p':
			parentPath += '/prod';
			break;
		default:
			break;
		}
		switch (argv.t) {
		case 'layer':
			parentPath += '/Layers';
			break;
		case 'lambda':
			parentPath += `/Lambdas/${argv.st}`;
			break;
		default:
			break;
		}
		// eslint-disable-next-line no-console
		console.log(parentPath);
		parentPath += `/${argv.w}`;
		if (argv.t === 'layer') {
			modulesPath += `${parentPath}/nodejs`;
			// eslint-disable-next-line no-console
			console.log(modulesPath);
			mClean(modulesPath);
			mInstall(modulesPath);
		}
		deploy(parentPath).then(resolve());
	}));

gulp.task('m-reset', () =>
	// return a new promise
	new Promise((resolve, reject) => {
		let parentPath = path.join(__dirname, '/src');
		let modulesPath = '';
		switch (argv.e) {
		case 'd':
			parentPath += '/dev';
			break;
		case 'p':
			parentPath += '/prod';
			break;
		default:
			break;
		}
		switch (argv.t) {
		case 'l':
			parentPath += '/Layers';
			break;
		case 's':
			parentPath += '/Services';
			break;
		default:
			break;
		}
		parentPath += `/${argv.w}`;
		if (argv.t === 'l') {
			modulesPath += `${parentPath}/nodejs`;
		} else {
			modulesPath = parentPath;
		}
		console.log(parentPath);
		console.log(modulesPath);
		mClean(modulesPath);
		mInstall(modulesPath);
		deploy(parentPath).then(resolve());
	}));
