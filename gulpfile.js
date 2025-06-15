const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('build:js', () =>
  gulp
    .src('./src/server/**/*.ts')
    .pipe(
      // 使用 .babelrc 配置
      babel()
    )
    .pipe(gulp.dest('./dist/'))
);

// 定义 default 任务
gulp.task("default", gulp.series("build:js"));

if (process.env.NODE_ENV !== 'production') {
  gulp.watch('./src/server/**/*.js', gulp.series('default'));
}