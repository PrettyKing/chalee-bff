# Chalee BFF 构建指南

## 📦 项目构建说明

这是一个基于 **awilix + koa + TypeScript** 的 BFF（Backend For Frontend）项目，使用 Gulp 进行构建和开发流程管理。

## 🚀 快速开始

### 安装依赖
```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 开发模式
```bash
# 启动开发服务器（包含热重载）
npm run dev

# 或直接使用 gulp
gulp dev
```

### 生产构建
```bash
# 构建生产版本
npm run build:prod

# 启动生产服务器
npm start
```

## 📁 项目结构

```
chalee-bff/
├── src/
│   ├── server/           # 服务端 TypeScript 源码
│   │   ├── app.ts       # 应用入口
│   │   ├── config/      # 配置文件
│   │   ├── controllers/ # 控制器（路由处理）
│   │   ├── services/    # 业务服务（awilix 自动注入）
│   │   ├── entity/      # 实体类
│   │   ├── interfaces/  # TypeScript 接口
│   │   └── typings/     # 类型定义
│   └── web/             # 前端代码
├── dist/                # 构建输出目录（平铺结构）
│   ├── app.js          # 应用入口（从 src/server/app.ts 编译）
│   ├── config/         # 配置文件目录
│   ├── controllers/    # 控制器目录
│   ├── services/       # 服务目录
│   ├── entity/         # 实体目录
│   ├── interfaces/     # 接口目录
│   ├── typings/        # 类型定义目录
│   ├── package.json    # 依赖信息
│   └── index.js        # 生产启动脚本
├── config/             # 根目录配置（不参与构建）
├── gulpfile.js         # Gulp 构建配置
└── package.json
```

## 🛠️ 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式（构建+监听+热重载） |
| `npm run build` | 开发构建 |
| `npm run build:prod` | 生产构建（代码优化） |
| `npm start` | 启动生产服务器 |
| `npm run clean` | 清理构建目录 |
| `gulp help` | 显示详细帮助信息 |

## ⚙️ 构建特性

### 构建输出说明
构建过程将 `src/server/` 目录下的所有文件编译后平铺到 `dist/` 根目录：

```bash
# 构建映射关系
src/server/app.ts        → dist/app.js
src/server/config/       → dist/config/
src/server/controllers/  → dist/controllers/
src/server/services/     → dist/services/
src/server/entity/       → dist/entity/
src/server/interfaces/   → dist/interfaces/
src/server/typings/      → dist/typings/
```

### TypeScript 编译
- ✅ 完整的 TypeScript 支持
- ✅ 类型检查和转译
- ✅ 源码映射（开发模式）

### Babel 转译
- ✅ ES2018+ 语法支持
- ✅ 装饰器语法支持
- ✅ 动态导入支持
- ✅ 类属性支持

### awilix 依赖注入
- ✅ 自动服务发现和注册
- ✅ 生命周期管理
- ✅ 请求范围注入

### 开发体验
- ✅ 热重载开发服务器
- ✅ 文件监听自动重构建
- ✅ 详细的构建日志
- ✅ 错误提示和调试信息

### 生产优化
- ✅ 代码压缩和优化
- ✅ 去除调试信息
- ✅ 资源文件复制
- ✅ 启动脚本生成

## 🔧 路径别名支持

项目支持以下路径别名，在构建时会自动处理：

```typescript
import config from '@config/index';           // → ./config/index
import { UserService } from '@services/user'; // → ./services/user
import { IUser } from '@interfaces/user';     // → ./interfaces/user
```

支持的别名：
- `@root` → 当前目录
- `@config` → `./config`
- `@services` → `./services`
- `@controllers` → `./controllers`
- `@interfaces` → `./interfaces`
- `@entity` → `./entity`
- `@typings` → `./typings`
- `@middlewares` → `./middlewares`

## 🌍 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NODE_ENV` | 运行环境 | `development` |
| `PORT` | 服务端口 | `3000` |
| `DEBUG` | 调试模式 | `awilix:*` |

## 📝 开发建议

1. **服务注册**: 在 `src/server/services/` 目录下创建服务类，awilix 会自动注册
2. **控制器**: 在 `src/server/controllers/` 目录下创建控制器，使用 awilix-koa 自动加载
3. **配置管理**: 将配置文件放在 `src/server/config/` 目录下
4. **类型定义**: 在 `src/server/interfaces/` 目录下定义 TypeScript 接口
5. **根目录配置**: 根目录的 `config/` 文件夹不会参与构建，保持原有配置管理方式

## 🐛 故障排除

### 构建失败
```bash
# 清理并重新构建
npm run clean
npm run build
```

### 依赖问题
```bash
# 重新安装依赖
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 端口占用
```bash
# 检查端口占用
lsof -ti:3000
# 杀死进程
kill -9 $(lsof -ti:3000)
```

## 📋 部署说明

### 本地部署
```bash
npm run build:prod
npm start
```

### Docker 部署
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./
EXPOSE 3000
CMD ["node", "index.js"]
```

### PM2 部署
```bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start dist/index.js --name chalee-bff

# 查看日志
pm2 logs chalee-bff
```

## 🎯 构建流程说明

### 开发构建流程
1. 清理 `dist/` 目录
2. 编译 TypeScript 文件到 `dist/`
3. 复制 JSON 和静态文件到 `dist/`
4. 处理路径别名
5. 创建启动脚本 `dist/index.js`
6. 验证构建结果

### 生产构建优化
- 代码压缩和混淆
- 移除源码映射
- 优化包大小
- 性能优化

---

🎉 现在你可以开始使用优化的构建流程开发你的 awilix + koa 应用了！
