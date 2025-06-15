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
    static: 'src/server/**/*.{yaml,yml,env,txt,html}',
    // 配置文件路径
    configIndex: 'src/server/config/index.ts',
    configDev: 'src/server/config/dev.ts',
    configProd: 'src/server/config/prod.ts'
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

// 编译 TypeScript 文件（开发环境）
gulp.task('compile:ts:dev', () => {
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

// 编译 TypeScript 文件（生产环境）
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

// 创建开发环境专用配置
gulp.task('create:config:dev', () => {
  // 创建开发环境专用的 index.js，直接使用 dev 配置
  const devConfigContent = `import { join } from "path";
import _ from 'lodash';

// 开发环境配置 (内联)
const devConfig = {
    port: 8081,
    viewDir: join(__dirname, '../../../dist/web/'),
    staticDir: join(__dirname, '../../../dist/web/'),
};

let config = {
  port: 8081,
  memoryFlag: false,
};

// 合并开发环境配置
config = _.merge(config, devConfig);

export default config;
`;

  const fs = require('fs');
  const configDir = path.join(paths.dist, 'config');
  
  return new Promise((resolve) => {
    // 确保目录存在
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // 写入开发环境配置文件
    fs.writeFileSync(path.join(configDir, 'index.ts'), devConfigContent);
    console.log('✅ 开发环境配置创建成功 (内联配置)');
    resolve();
  });
});

// 创建生产环境专用配置
gulp.task('create:config:prod', () => {
  // 创建生产环境专用的 index.js，直接使用 prod 配置
  const prodConfigContent = `import { join } from "path";
import _ from 'lodash';

// 生产环境配置 (内联)
const prodConfig = {
    port: 8082,
    memoryFlag: 'memory',
    viewDir: join(__dirname, '../web/'),
    staticDir: join(__dirname, '../web/'),
};

let config = {
  port: 8081,
  memoryFlag: false,
};

// 合并生产环境配置
config = _.merge(config, prodConfig);

export default config;
`;

  const fs = require('fs');
  const configDir = path.join(paths.dist, 'config');
  
  return new Promise((resolve) => {
    // 确保目录存在
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // 写入生产环境配置文件
    fs.writeFileSync(path.join(configDir, 'index.ts'), prodConfigContent);
    console.log('✅ 生产环境配置创建成功 (内联配置)');
    resolve();
  });
});

// 编译配置文件（开发环境）
gulp.task('compile:config:dev', gulp.series('create:config:dev', () => {
  return gulp.src(['dist/config/index.ts'])
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
    .pipe(gulp.dest('dist/config'));
}));

// 编译配置文件（生产环境）
gulp.task('compile:config:prod', gulp.series('create:config:prod', () => {
  return gulp.src(['dist/config/index.ts'])
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
    .pipe(gulp.dest('dist/config'));
}));

// 复制 JSON 配置文件（排除 config 目录）
gulp.task('copy:json', () => {
  return gulp.src([paths.src.json, '!src/server/config/**/*.json'])
    .pipe(gulp.dest(paths.dist));
});

// 复制静态文件（排除 config 目录）
gulp.task('copy:static', () => {
  return gulp.src([paths.src.static, '!src/server/config/**'])
    .pipe(gulp.dest(paths.dist));
});

// 创建开发环境启动脚本
gulp.task('create:launcher:dev', () => {
  const launcherContent = `#!/usr/bin/env node
// 开发环境启动脚本 - 精简版
process.env.NODE_ENV = 'development';
console.log('🚀 启动开发服务器 (端口: 8081)');
console.log('📁 配置: 开发环境 (内联配置)');
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
// 生产环境启动脚本 - 精简版
process.env.NODE_ENV = 'production';
console.log('🚀 启动生产服务器 (端口: 8082)');
console.log('📁 配置: 生产环境 (内联配置)');
require('./app.js');
`;
  
  const fs = require('fs');
  const launcherPath = path.join(paths.dist, 'index.js');
  
  return new Promise((resolve) => {
    fs.writeFileSync(launcherPath, launcherContent);
    resolve();
  });
});

// 处理路径别名（排除 config 目录，因为已经单独处理）
gulp.task('process:aliases', () => {
  const replace = require('gulp-replace');
  
  return gulp.src([`${paths.dist}/**/*.js`, `!${paths.dist}/config/**/*.js`])
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

// 清理编译后的 TypeScript 文件和不必要的文件
gulp.task('cleanup:files', () => {
  return del([
    'dist/**/*.ts',
    'dist/**/*.ts.map',
    'dist/package.json'  // 移除 package.json
  ]);
});

// 监听文件变化
gulp.task('watch', () => {
  gulp.watch([paths.src.server, '!src/server/config/**'], gulp.series('compile:ts:dev', 'process:aliases'));
  gulp.watch(['src/server/config/**'], gulp.series('compile:config:dev'));
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

// 验证构建结果
gulp.task('validate:build', (done) => {
  const fs = require('fs');
  const appPath = paths.entry;
  
  if (fs.existsSync(appPath)) {    
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
    
    // 检查配置文件（只有 index.js）
    const configIndex = 'dist/config/index.js';
    if (fs.existsSync(configIndex)) {
      console.log('✅ 配置文件存在 (单一环境配置)');
    }
    
    // 检查不应该存在的文件
    const unwantedFiles = [
      'dist/package.json',
      'dist/config/dev.js',
      'dist/config/prod.js'
    ];
    
    unwantedFiles.forEach(file => {
      if (!fs.existsSync(file)) {
        console.log(`✅ ${file} 已正确移除`);
      } else {
        console.warn(`⚠️  ${file} 仍然存在 (应被移除)`);
      }
    });
    
    // 显示最终构建大小
    const { execSync } = require('child_process');
    try {
      const size = execSync('du -sh dist/ 2>/dev/null || echo "无法计算大小"', { encoding: 'utf8' });
      console.log(`📦 构建产物大小: ${size.trim()}`);
    } catch (error) {
      console.log('📦 构建产物大小: 无法计算');
    }
    
    done();
  } else {
    done(new Error('❌ 构建失败 - 入口文件不存在'));
  }
});

// 基础构建任务（不包含 package.json）
const buildTasks = [
  'copy:json',
  'copy:static'
  // 移除 'copy:package'
];

// 开发构建
gulp.task('build:dev', gulp.series(
  'clean',
  'compile:ts:dev',
  gulp.parallel(...buildTasks),
  'compile:config:dev',
  'process:aliases',
  'cleanup:files',
  'create:launcher:dev',
  'validate:build'
));

// 生产构建
gulp.task('build:prod', gulp.series(
  'clean',
  'compile:ts:prod',
  gulp.parallel(...buildTasks),
  'compile:config:prod',
  'process:aliases',
  'cleanup:files',
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
  'compile:ts:dev',
  gulp.parallel(...buildTasks),
  'compile:config:dev',
  'process:aliases',
  'cleanup:files'
));

gulp.task('rebuild:prod', gulp.series(
  'compile:ts:prod',
  gulp.parallel(...buildTasks),
  'compile:config:prod',
  'process:aliases',
  'cleanup:files'
));

// 只构建不启动（默认开发模式）
gulp.task('build', gulp.series('build:dev'));

// 检查环境配置
gulp.task('check:config', (done) => {
  const fs = require('fs');
  
  // 检查构建后的配置文件
  if (fs.existsSync('dist/config/index.js')) {
    console.log('✅ dist/config/index.js - 存在 (唯一配置文件)');
    
    // 读取配置文件大小
    const stats = fs.statSync('dist/config/index.js');
    console.log(`📏 配置文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
  } else {
    console.log('❌ dist/config/index.js - 不存在');
  }
  
  // 确认不需要的文件已被移除
  const checkFiles = [
    { path: 'dist/package.json', shouldExist: false, name: 'package.json' },
    { path: 'dist/config/dev.js', shouldExist: false, name: 'dev.js' },
    { path: 'dist/config/prod.js', shouldExist: false, name: 'prod.js' }
  ];
  
  checkFiles.forEach(({ path, shouldExist, name }) => {
    const exists = fs.existsSync(path);
    if (exists === shouldExist) {
      console.log(`✅ ${name} - ${shouldExist ? '存在' : '已正确移除'}`);
    } else {
      console.log(`❌ ${name} - ${exists ? '不应存在' : '缺失'}`);
    }
  });
  
  done();
});

// 默认任务
gulp.task('default', gulp.series('dev'));

// 帮助任务
gulp.task('help', (done) => {
  done();
});
