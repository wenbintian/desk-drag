/**
 * Created by tianwenbin on 2019/9/26.
 */
var gulp = require("gulp");
var del = require("del");
var sass = require("gulp-sass");
var p = "./examples/componentSource/";

gulp.task('move',function(){
  del.sync(['./packages/**','./src/**','./dist/**']);//同步删除这些文件夹
  //拷贝examples里的源文件到外层来
  gulp.src(['./examples/componentSource/packages/**','./examples/componentSource/src/**'],{base:"./examples/componentSource/"}).pipe(gulp.dest("./"));
});
gulp.task('sass', function (cb) {
  gulp.src([p+'packages/theme/default/index.scss'], {base: p+'packages/'}).pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError)).pipe(gulp.dest('./dist/'));
});
gulp.task("default",function(){
  gulp.start(["move","sass"]);
})