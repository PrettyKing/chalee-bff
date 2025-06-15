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

// 生产环境编译（无 sourcemap，压缩）
gulp.task('compile:ts:prod', () => {
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

// 创建开发环境启动脚本
gulp.task('create:launcher:dev', () => {
  const launcherContent = `#!/usr/bin/env node
// 开发环境启动脚本
process.env.NODE_ENV = 'development';
console.log('🚀 启动开发服务器 (端口: 8081)');
require('./app.js');
`;
  
  const fs = require('fs');
  const launcherPath = path.join(paths.dist, 'index.js');
  
  return new Promise((resolve) => {
    fs.writeFileSync(launcherPath, launcherContent);
    console.log('✅ 开发环境启动脚本创建成功');
    resolve();
  });
});

// 创建生产环境启动脚本
gulp.task('create:launcher:prod', () => {
  const launcherContent = `#!/usr/bin/env node
// 生产环境启动脚本
process.env.NODE_ENV = 'production';
console.log('🚀 启动生产服务器 (端口: 8082)');
require('./app.js');
`;
  
  const fs = require('fs');
  const launcherPath = path.join(paths.dist, 'index.js');
  
  return new Promise((resolve) => {
    fs.writeFileSync(launcherPath, launcherContent);
    console.log('✅ 生产环境启动脚本创建成功');
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
gulp.task('serve:dev', () => {
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
    console.log('🔄 开发服务器重启中...');
  });
});

// 生产服务器（不用 nodemon，直接启动）
gulp.task('serve:prod', (done) => {
  process.env.NODE_ENV = 'production';
  require(path.resolve(paths.entry));
  done();
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
    
    // 检查配置文件
    const configPath = 'dist/config/index.js';
    if (fs.existsSync(configPath)) {
      console.log('✅ 配置文件存在，支持环境区分');
    }
    
    done();
  } else {
    done(new Error('❌ 构建失败 - 入口文件不存在'));
  }
});

// 基础构建任务
const buildTasks = [
  'copy:json',
  'copy:static',
  'copy:package'
];

// 开发构建
gulp.task('build:dev', gulp.series(
  'clean',
  'compile:ts',
  gulp.parallel(...buildTasks),
  'process:aliases',
  'create:launcher:dev',
  'validate:build'
));

// 生产构建
gulp.task('build:prod', gulp.series(
  'clean',
  'compile:ts:prod',
  gulp.parallel(...buildTasks),
  'process:aliases',
  'create:launcher:prod',
  'validate:build'
));

// 开发任务（构建+监听+热重载）
gulp.task('dev', gulp.series(
  'build:dev',
  gulp.parallel('watch', 'serve:dev')
));

// 生产任务（仅构建，不启动服务器）
gulp.task('prod', gulp.series('build:prod'));

// 快速重构建（跳过清理）
gulp.task('rebuild:dev', gulp.series(
  'compile:ts',
  gulp.parallel(...buildTasks),
  'process:aliases'
));

gulp.task('rebuild:prod', gulp.series(
  'compile:ts:prod',
  gulp.parallel(...buildTasks),
  'process:aliases'
));

// 只构建不启动（默认开发模式）
gulp.task('build', gulp.series('build:dev'));

// 检查环境配置
gulp.task('check:config', (done) => {
  console.log(`
🔍 环境配置检查:
  
当前环境: ${process.env.NODE_ENV || 'undefined'}

开发环境配置:
  - NODE_ENV: development
  - 端口: 8081
  - 静态资源: ../../../dist/web/
  - 模板缓存: false

生产环境配置:
  - NODE_ENV: production  
  - 端口: 8082
  - 静态资源: /web/
  - 模板缓存: memory
  `);
  done();
});

// 默认任务
gulp.task('default', gulp.series('dev'));

// 帮助任务
gulp.task('help', (done) => {
  console.log(`
🚀 Chalee BFF Gulp 构建工具

开发相关命令:
  gulp dev              - 开发模式（构建+监听+热重载，端口8081）
  gulp build:dev        - 开发构建
  gulp rebuild:dev      - 快速重构建（开发）
  gulp serve:dev        - 启动开发服务器

生产相关命令:
  gulp build:prod       - 生产构建（代码优化，端口8082）
  gulp rebuild:prod     - 快速重构建（生产）
  gulp prod             - 生产构建（不启动服务器）

通用命令:
  gulp build            - 默认构建（开发模式）
  gulp clean            - 清理构建目录
  gulp check:config     - 检查环境配置
  gulp help             - 显示帮助信息

环境说明:
  开发环境: NODE_ENV=development, 端口8081
  生产环境: NODE_ENV=production,  端口8082

构建输出:
  src/server/ → dist/ (平铺结构)
  支持环境区分的配置文件
  `);
  done();
});
