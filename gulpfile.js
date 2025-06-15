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

// 复制开发环境配置
gulp.task('copy:config:dev', () => {
  const replace = require('gulp-replace');
  
  // 创建开发环境专用的 index.js
  const devConfigContent = `import _ from 'lodash';
import devConfig from './dev';

let config = {
  port: 8081,
  memoryFlag: false,
};

// 开发环境固定使用 dev 配置
config = _.merge(config, devConfig);

export default config;
`;

  const fs = require('fs');
  return Promise.all([
    // 复制 dev.ts
    new Promise((resolve) => {
      gulp.src([paths.src.configDev])
        .pipe(gulp.dest('dist/config'))
        .on('end', resolve);
    }),
    // 创建开发环境的 index.ts
    new Promise((resolve) => {
      fs.writeFileSync('dist/config/index.ts', devConfigContent);
      resolve();
    })
  ]);
});

// 复制生产环境配置
gulp.task('copy:config:prod', () => {
  const replace = require('gulp-replace');
  
  // 创建生产环境专用的 index.js
  const prodConfigContent = `import _ from 'lodash';
import prodConfig from './prod';

let config = {
  port: 8081,
  memoryFlag: false,
};

// 生产环境固定使用 prod 配置
config = _.merge(config, prodConfig);

export default config;
`;

  const fs = require('fs');
  return Promise.all([
    // 复制 prod.ts
    new Promise((resolve) => {
      gulp.src([paths.src.configProd])
        .pipe(gulp.dest('dist/config'))
        .on('end', resolve);
    }),
    // 创建生产环境的 index.ts
    new Promise((resolve) => {
      fs.writeFileSync('dist/config/index.ts', prodConfigContent);
      resolve();
    })
  ]);
});

// 编译特定环境的配置文件
gulp.task('compile:config:dev', gulp.series('copy:config:dev', () => {
  return gulp.src(['dist/config/*.ts'])
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

gulp.task('compile:config:prod', gulp.series('copy:config:prod', () => {
  return gulp.src(['dist/config/*.ts'])
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
console.log('📁 配置: 使用开发环境配置');
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
console.log('📁 配置: 使用生产环境配置');
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

// 清理编译后的 TypeScript 文件
gulp.task('cleanup:ts', () => {
  return del([
    'dist/**/*.ts',
    'dist/**/*.ts.map'
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
    const configIndex = 'dist/config/index.js';
    if (fs.existsSync(configIndex)) {
      console.log('✅ 配置文件存在，支持环境区分');
      
      // 检查环境特定配置
      const env = process.env.BUILD_ENV || 'development';
      const envConfigFile = env === 'production' ? 'dist/config/prod.js' : 'dist/config/dev.js';
      if (fs.existsSync(envConfigFile)) {
        console.log(`✅ ${env} 环境配置文件存在`);
      } else {
        console.warn(`⚠️  ${env} 环境配置文件缺失`);
      }
    }
    
    done();
  } else {
    done(new Error('❌ 构建失败 - 入口文件不存在'));
  }
});

// 基础构建任务（排除配置）
const buildTasks = [
  'copy:json',
  'copy:static',
  'copy:package'
];

// 开发构建
gulp.task('build:dev', gulp.series(
  'clean',
  'compile:ts:dev',
  gulp.parallel(...buildTasks),
  'compile:config:dev',
  'process:aliases',
  'cleanup:ts',
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
  'cleanup:ts',
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
  'cleanup:ts'
));

gulp.task('rebuild:prod', gulp.series(
  'compile:ts:prod',
  gulp.parallel(...buildTasks),
  'compile:config:prod',
  'process:aliases',
  'cleanup:ts'
));

// 只构建不启动（默认开发模式）
gulp.task('build', gulp.series('build:dev'));

// 检查环境配置
gulp.task('check:config', (done) => {
  const fs = require('fs');
  
  console.log(`
🔍 环境配置检查:
  
当前环境: ${process.env.NODE_ENV || 'undefined'}

开发环境配置 (dev.ts):
  - 端口: 8081
  - 静态资源: ../../../dist/web/
  - 模板缓存: false (未设置)

生产环境配置 (prod.ts):
  - 端口: 8082
  - 静态资源: /web/
  - 模板缓存: memory

构建后配置文件:
  `);
  
  // 检查构建后的配置文件
  if (fs.existsSync('dist/config/index.js')) {
    console.log('✅ dist/config/index.js - 存在');
  } else {
    console.log('❌ dist/config/index.js - 不存在');
  }
  
  if (fs.existsSync('dist/config/dev.js')) {
    console.log('✅ dist/config/dev.js - 存在');
  } else {
    console.log('❌ dist/config/dev.js - 不存在');
  }
  
  if (fs.existsSync('dist/config/prod.js')) {
    console.log('✅ dist/config/prod.js - 存在');
  } else {
    console.log('❌ dist/config/prod.js - 不存在');
  }
  
  done();
});

// 默认任务
gulp.task('default', gulp.series('dev'));

// 帮助任务
gulp.task('help', (done) => {
  console.log(`
🚀 Chalee BFF Gulp 构建工具 - 环境配置版

开发相关命令:
  gulp dev              - 开发模式（构建+监听+热重载，端口8081）
  gulp build:dev        - 开发构建（只包含 dev.js 配置）
  gulp rebuild:dev      - 快速重构建（开发）

生产相关命令:
  gulp build:prod       - 生产构建（只包含 prod.js 配置）
  gulp rebuild:prod     - 快速重构建（生产）
  gulp prod             - 生产构建（不启动服务器）

通用命令:
  gulp build            - 默认构建（开发模式）
  gulp clean            - 清理构建目录
  gulp check:config     - 检查环境配置
  gulp help             - 显示帮助信息

配置文件处理:
  开发构建: 只复制 dev.ts + 生成开发版 index.ts
  生产构建: 只复制 prod.ts + 生成生产版 index.ts
  
构建优化:
  ✅ 环境特定配置
  ✅ 减少不必要文件
  ✅ 配置文件编译
  ✅ TypeScript 清理
  `);
  done();
});
