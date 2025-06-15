# 🌍 环境配置与构建流程

## 📋 环境概览

你的 `chalee-bff` 项目支持两种环境配置：

### 🔧 开发环境 (Development)
- **NODE_ENV**: `development`
- **端口**: `8081`
- **静态资源路径**: `../../../dist/web/` (相对于 dist 目录)
- **模板缓存**: `false` (关闭缓存，便于开发)
- **构建**: 包含 sourcemap，便于调试

### 🚀 生产环境 (Production)
- **NODE_ENV**: `production`
- **端口**: `8082`
- **静态资源路径**: `/web/` (绝对路径)
- **模板缓存**: `memory` (内存缓存，提升性能)
- **构建**: 代码压缩优化，无 sourcemap

## 🛠️ 可用脚本命令

### 开发相关
```bash
# 开发模式 - 构建+监听+热重载 (端口8081)
npm run dev
npm run server:dev

# 开发构建 - 仅构建，不启动服务器
npm run build
npm run build:dev
npm run server:build

# 快速重构建 - 跳过清理步骤
npm run rebuild:dev

# 启动已构建的开发版本
npm run start:dev
npm run server:start:dev
```

### 生产相关
```bash
# 生产构建 - 代码优化压缩 (端口8082)
npm run build:prod
npm run server:build:prod

# 快速重构建生产版本
npm run rebuild:prod

# 启动生产服务器
npm run start
npm run start:prod
npm run server:start:prod
```

### 一键部署
```bash
# 构建并启动开发环境
npm run deploy:dev

# 构建并启动生产环境  
npm run deploy:prod
```

### 辅助工具
```bash
# 清理构建目录
npm run clean

# 检查环境配置
npm run check:config

# 测试配置是否正确
npm run test:config

# 显示帮助信息
npm run help
```

## 📁 构建输出结构

```
dist/
├── app.js              # 主应用入口 (来自 src/server/app.ts)
├── index.js            # 启动脚本 (根据环境生成)
├── package.json        # 依赖信息
├── config/             # 配置目录
│   └── index.js        # 环境配置文件
├── controllers/        # 控制器目录
├── services/           # 服务目录 (awilix 自动注入)
├── entity/             # 实体目录
├── interfaces/         # 接口定义目录
└── typings/            # 类型定义目录
```

## 🔍 环境配置详解

### 配置文件解析
你的 `src/server/config/index.ts` 会根据 `NODE_ENV` 自动选择配置：

```typescript
// 开发环境配置
if (process.env.NODE_ENV === 'development') {
  config = {
    port: 8081,
    viewDir: join(__dirname, '../../../dist/web/'),
    staticDir: join(__dirname, '../../../dist/web/'),
    memoryFlag: false
  };
}

// 生产环境配置
if (process.env.NODE_ENV === 'production') {
  config = {
    port: 8082,
    viewDir: join(__dirname, '/web/'),
    staticDir: join(__dirname, '/web/'),
    memoryFlag: 'memory'
  };
}
```

### 启动脚本差异

**开发环境启动脚本 (dist/index.js)**:
```javascript
process.env.NODE_ENV = 'development';
console.log('🚀 启动开发服务器 (端口: 8081)');
require('./app.js');
```

**生产环境启动脚本 (dist/index.js)**:
```javascript
process.env.NODE_ENV = 'production';
console.log('🚀 启动生产服务器 (端口: 8082)');
require('./app.js');
```

## 🚀 构建流程检查

### 1. 开发构建流程
```bash
npm run build:dev
```

**执行步骤**:
1. 清理 `dist/` 目录
2. 编译 TypeScript 文件 (包含 sourcemap)
3. 使用 Babel 转译代码
4. 复制 JSON 和静态文件
5. 处理路径别名
6. 生成开发环境启动脚本
7. 验证构建结果

### 2. 生产构建流程
```bash
npm run build:prod
```

**执行步骤**:
1. 清理 `dist/` 目录
2. 编译 TypeScript 文件 (无 sourcemap)
3. 使用 Babel 转译并压缩代码
4. 复制 JSON 和静态文件
5. 处理路径别名
6. 生成生产环境启动脚本
7. 验证构建结果

### 3. 验证构建
```bash
npm run test:config
```

**检查项目**:
- ✅ 入口文件 `dist/app.js` 存在
- ✅ 关键目录存在 (config, controllers, services)
- ✅ 配置文件支持环境区分
- ✅ 启动脚本正确生成

## 🔧 troubleshooting

### 常见问题解决

#### 1. 端口冲突
```bash
# 检查端口占用
lsof -ti:8081  # 开发环境
lsof -ti:8082  # 生产环境

# 杀死占用进程
kill -9 $(lsof -ti:8081)
```

#### 2. 构建失败
```bash
# 完全清理重建
npm run clean
rm -rf node_modules
npm install
npm run build:dev
```

#### 3. 环境变量问题
```bash
# 检查环境配置
npm run check:config

# 手动设置环境变量 (Linux/Mac)
export NODE_ENV=development
npm start

# 手动设置环境变量 (Windows)
set NODE_ENV=development
npm start
```

#### 4. 路径问题
检查你的静态资源路径是否正确：
- 开发环境: `../../../dist/web/`
- 生产环境: `/web/`

#### 5. awilix 注入问题
确保服务文件在 `src/server/services/` 目录下，awilix 会自动扫描并注册。

## 🌐 部署建议

### 开发部署
```bash
# 本地开发
npm run dev

# 开发服务器部署
npm run deploy:dev
```

### 生产部署
```bash
# 构建生产版本
npm run build:prod

# 使用 PM2 部署
npm install -g pm2
pm2 start dist/index.js --name chalee-bff-prod

# 或直接启动
npm run start:prod
```

### Docker 部署
```dockerfile
FROM node:18-alpine
WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci --only=production

# 复制构建产物
COPY dist/ ./

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口
EXPOSE 8082

# 启动应用
CMD ["node", "index.js"]
```

## 📊 性能对比

| 特性 | 开发环境 | 生产环境 |
|------|----------|----------|
| 端口 | 8081 | 8082 |
| Sourcemap | ✅ | ❌ |
| 代码压缩 | ❌ | ✅ |
| 模板缓存 | ❌ | ✅ (内存) |
| 热重载 | ✅ | ❌ |
| 构建速度 | 快 | 慢 |
| 运行性能 | 一般 | 优化 |

---

🎉 现在你的 awilix + koa 项目已经完全支持环境区分的构建流程！
