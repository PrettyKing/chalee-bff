const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const nodemon = require('gulp-nodemon');
const ts = require('gulp-typescript');
const path = require('path');

// 路径配置
const paths = {
  src: {
    server: 'src/server/**/*.ts',
    serverJs: 'src/server/**/*.js',
    json: 'src/server/**/*.json',
    static: 'src/server/**/*.{yaml,yml,env,txt,html}'
  },
  dist: 'dist',
  entry: 'dist/app.js'
};

// TypeScript 项目配置
const tsProject = ts.createProject('tsconfig.json', {
  declaration: false,
  sourceMap: false
});

// 清理构建目录
gulp.task('clean', () => {
  return del([paths.dist]);
});

// 编译 TypeScript 文件
gulp.task('compile:ts', () => {
  return gulp.src([paths.src.server])
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(babel({
      presets: [
        ['@babel/preset-env', {
          targets: { node: '18' },
          modules: 'commonjs'
        }],
        '@babel/preset-typescript'
      ],
      plugins: [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-proposal-class-properties'
      ]
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.dist));
});

// 复制 JSON 配置文件
gulp.task('copy:json', () => {
  return gulp.src([paths.src.json])
    .pipe(gulp.dest(paths.dist));
});

// 复制静态文件
gulp.task('copy:static', () => {
  return gulp.src([paths.src.static])
    .pipe(gulp.dest(paths.dist));
});

// 复制 package.json
gulp.task('copy:package', () => {
  return gulp.src(['package.json'])
    .pipe(gulp.dest(paths.dist));
});

// 创建启动脚本
gulp.task('create:launcher', () => {
  const launcherContent = `#!/usr/bin/env node
// 生产环境启动脚本
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
require('./app.js');
`;
  
  const fs = require('fs');
  const launcherPath = path.join(paths.dist, 'index.js');
  
  return new Promise((resolve) => {
    fs.writeFileSync(launcherPath, launcherContent);
    console.log('✅ 启动脚本创建成功');
    resolve();
  });
});

// 处理路径别名（将 TypeScript 路径映射转换为运行时可用的形式）
gulp.task('process:aliases', () => {
  const replace = require('gulp-replace');
  
  return gulp.src([`${paths.dist}/**/*.js`])
    .pipe(replace(/@root/g, '__dirname'))
    .pipe(replace(/@interfaces/g, `\${__dirname}/interfaces`))
    .pipe(replace(/@config/g, `\${__dirname}/config`))
    .pipe(replace(/@middlewares/g, `\${__dirname}/middlewares`))
    .pipe(replace(/@services/g, `\${__dirname}/services`))
    .pipe(replace(/@controllers/g, `\${__dirname}/controllers`))
    .pipe(replace(/@entity/g, `\${__dirname}/entity`))
    .pipe(replace(/@typings/g, `\${__dirname}/typings`))
    .pipe(gulp.dest(paths.dist));
});

// 监听文件变化
gulp.task('watch', () => {
  gulp.watch([paths.src.server], gulp.series('compile:ts', 'process:aliases'));
  gulp.watch([paths.src.json], gulp.series('copy:json'));
  gulp.watch([paths.src.static], gulp.series('copy:static'));
});

// 开发服务器
gulp.task('serve', () => {
  return nodemon({
    script: paths.entry,
    watch: [paths.dist],
    env: { 
      'NODE_ENV': 'development',
      'DEBUG': 'awilix:*'
    },
    ext: 'js json',
    ignore: ['node_modules/**', 'src/**'],
    delay: 1000,
    verbose: true
  }).on('restart', () => {
    console.log('🔄 服务器重启中...');
  });
});

// 验证构建结果
gulp.task('validate:build', (done) => {
  const fs = require('fs');
  const appPath = paths.entry;
  
  if (fs.existsSync(appPath)) {
    console.log('✅ 构建验证成功 - 入口文件存在');
    
    // 检查关键文件
    const criticalFiles = [
      'dist/config',
      'dist/controllers',
      'dist/services'
    ];
    
    criticalFiles.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file} 目录存在`);
      } else {
        console.warn(`⚠️  ${file} 目录缺失`);
      }
    });
    
    done();
  } else {
    done(new Error('❌ 构建失败 - 入口文件不存在'));
  }
});

// 构建任务组合
const buildTasks = [
  'compile:ts',
  'copy:json',
  'copy:static',
  'copy:package'
];

// 开发构建
gulp.task('build:dev', gulp.series(
  'clean',
  gulp.parallel(...buildTasks),
  'process:aliases',
  'create:launcher',
  'validate:build'
));

// 生产构建
gulp.task('build:prod', gulp.series('clean', () => {
  // 生产环境构建：不生成 sourcemap，优化代码
  return gulp.src([paths.src.server])
    .pipe(tsProject())
    .pipe(babel({
      presets: [
        ['@babel/preset-env', {
          targets: { node: '18' },
          modules: 'commonjs'
        }],
        '@babel/preset-typescript'
      ],
      plugins: [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-proposal-class-properties'
      ],
      compact: true,
      minified: true
    }))
    .pipe(gulp.dest(paths.dist));
}, gulp.parallel('copy:json', 'copy:static', 'copy:package'), 'process:aliases', 'create:launcher', 'validate:build'));

// 开发任务
gulp.task('dev', gulp.series(
  'build:dev',
  gulp.parallel('watch', 'serve')
));

// 快速重构建（跳过清理）
gulp.task('rebuild', gulp.series(
  gulp.parallel(...buildTasks),
  'process:aliases'
));

// 只构建不启动
gulp.task('build', gulp.series('build:dev'));

// 默认任务
gulp.task('default', gulp.series('dev'));

// 帮助任务
gulp.task('help', (done) => {
  console.log(`
🚀 Chalee BFF Gulp 构建工具

可用命令:
  gulp dev          - 开发模式（构建+监听+热重载）
  gulp build        - 开发构建
  gulp build:prod   - 生产构建（优化）
  gulp clean        - 清理构建目录
  gulp rebuild      - 快速重构建
  gulp help         - 显示帮助信息

项目结构:
  src/server/       - TypeScript 源码
  dist/             - 编译后的 JS 文件（平铺结构）
  dist/index.js     - 生产启动脚本

构建输出:
  src/server/app.ts        → dist/app.js
  src/server/config/       → dist/config/
  src/server/controllers/  → dist/controllers/
  src/server/services/     → dist/services/
  src/server/entity/       → dist/entity/
  src/server/interfaces/   → dist/interfaces/
  src/server/typings/      → dist/typings/

特性支持:
  ✅ TypeScript 编译
  ✅ Babel 转译
  ✅ awilix 依赖注入
  ✅ koa 框架
  ✅ 路径别名处理
  ✅ 热重载开发
  ✅ 源码映射
  ✅ 生产优化
  `);
  done();
});
