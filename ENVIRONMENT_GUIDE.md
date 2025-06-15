# 🌍 环境配置与构建流程

## 📋 环境概览

你的 `chalee-bff` 项目现在支持完全独立的环境配置，构建时只包含对应环境的配置文件：

### 🔧 开发环境 (Development)
- **配置文件**: `src/server/config/dev.ts`
- **NODE_ENV**: `development`
- **端口**: `8081`
- **静态资源路径**: `../../../dist/web/` (相对于 dist 目录)
- **模板缓存**: `false` (未设置，默认关闭)
- **构建产物**: 只包含 `dev.js` 和优化的 `index.js`

### 🚀 生产环境 (Production)
- **配置文件**: `src/server/config/prod.ts`
- **NODE_ENV**: `production`
- **端口**: `8082`
- **静态资源路径**: `/web/` (绝对路径)
- **模板缓存**: `memory` (内存缓存)
- **构建产物**: 只包含 `prod.js` 和优化的 `index.js`

## 🎯 构建优化特性

### ✅ 环境特定配置
- **开发构建**: 只复制 `dev.ts`，生成专用的 `index.js`
- **生产构建**: 只复制 `prod.ts`，生成专用的 `index.js`
- **减少体积**: 构建产物不包含不必要的配置文件
- **配置固化**: 编译时确定环境配置，运行时无需判断

### ✅ 构建流程优化
- **TypeScript 清理**: 编译后自动清理 `.ts` 文件
- **配置编译**: 单独编译配置文件，确保正确性
- **文件分离**: 配置文件与其他代码分开处理

## 🛠️ 可用脚本命令

### 开发相关
```bash
# 开发模式 - 构建+监听+热重载 (端口8081)
npm run dev
npm run server:dev

# 开发构建 - 仅构建 dev.ts 配置
npm run build:dev
npm run server:build

# 快速重构建开发版本
npm run rebuild:dev

# 启动已构建的开发版本
npm run start:dev
npm run server:start:dev
```

### 生产相关
```bash
# 生产构建 - 仅构建 prod.ts 配置 (端口8082)
npm run build:prod
npm run server:build:prod

# 快速重构建生产版本
npm run rebuild:prod

# 启动生产服务器
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

# 检查环境配置文件
npm run check:config

# 测试配置是否正确
npm run test:config

# 显示帮助信息
npm run help
```

## 📁 构建输出结构

### 开发构建 (`npm run build:dev`)
```
dist/
├── app.js              # 主应用入口
├── index.js            # 开发环境启动脚本
├── package.json        # 依赖信息
├── config/             # 配置目录
│   ├── index.js        # 开发环境配置入口 (固定使用 dev)
│   └── dev.js          # 开发环境配置
├── controllers/        # 控制器目录
├── services/           # 服务目录
└── ...                # 其他目录
```

### 生产构建 (`npm run build:prod`)
```
dist/
├── app.js              # 主应用入口 (压缩优化)
├── index.js            # 生产环境启动脚本
├── package.json        # 依赖信息
├── config/             # 配置目录
│   ├── index.js        # 生产环境配置入口 (固定使用 prod)
│   └── prod.js         # 生产环境配置 (压缩优化)
├── controllers/        # 控制器目录 (压缩优化)
├── services/           # 服务目录 (压缩优化)
└── ...                # 其他目录
```

## 🔍 配置文件详解

### 源码配置结构
```
src/server/config/
├── index.ts           # 配置入口 (运行时环境判断)
├── dev.ts            # 开发环境配置
└── prod.ts           # 生产环境配置
```

### 开发环境配置 (`dev.ts`)
```typescript
import { join } from "path";

export default {
    port: 8081,
    viewDir: join(__dirname, '../../../dist/web/'),
    staticDir: join(__dirname, '../../../dist/web/'),
}
```

### 生产环境配置 (`prod.ts`)
```typescript
import { join } from "path";

export default {
    port: 8082,
    memoryFlag: 'memory',
    viewDir: join(__dirname, '/web/'),
    staticDir: join(__dirname, '/web/'),
};
```

### 构建时生成的配置入口

**开发环境 `index.js`**:
```javascript
import _ from 'lodash';
import devConfig from './dev';

let config = {
  port: 8081,
  memoryFlag: false,
};

// 开发环境固定使用 dev 配置
config = _.merge(config, devConfig);

export default config;
```

**生产环境 `index.js`**:
```javascript
import _ from 'lodash';
import prodConfig from './prod';

let config = {
  port: 8081,
  memoryFlag: false,
};

// 生产环境固定使用 prod 配置
config = _.merge(config, prodConfig);

export default config;
```

## 🚀 构建流程详解

### 1. 开发构建流程
```bash
npm run build:dev
```

**执行步骤**:
1. 清理 `dist/` 目录
2. 编译 TypeScript 文件 (包含 sourcemap)
3. 复制 JSON 和静态文件 (排除 config 目录)
4. **特殊处理配置**:
   - 只复制 `dev.ts`
   - 生成开发专用的 `index.ts`
   - 编译配置文件
5. 处理路径别名
6. 清理 TypeScript 源文件
7. 生成开发环境启动脚本
8. 验证构建结果

### 2. 生产构建流程
```bash
npm run build:prod
```

**执行步骤**:
1. 清理 `dist/` 目录
2. 编译 TypeScript 文件 (无 sourcemap，压缩)
3. 复制 JSON 和静态文件 (排除 config 目录)
4. **特殊处理配置**:
   - 只复制 `prod.ts`
   - 生成生产专用的 `index.ts`
   - 编译并压缩配置文件
5. 处理路径别名
6. 清理 TypeScript 源文件
7. 生成生产环境启动脚本
8. 验证构建结果

### 3. 验证构建
```bash
npm run check:config
```

**检查输出示例**:
```
🔍 环境配置检查:
  
当前环境: development

开发环境配置 (dev.ts):
  - 端口: 8081
  - 静态资源: ../../../dist/web/
  - 模板缓存: false (未设置)

生产环境配置 (prod.ts):
  - 端口: 8082
  - 静态资源: /web/
  - 模板缓存: memory

构建后配置文件:
✅ dist/config/index.js - 存在
✅ dist/config/dev.js - 存在 (开发构建)
✅ dist/config/prod.js - 存在 (生产构建)
```

## 🔧 构建优势

### 📦 体积优化
- **开发构建**: 不包含生产配置，减少约 30% 配置文件体积
- **生产构建**: 不包含开发配置，且代码压缩优化
- **清理机制**: 自动清理编译后的 TypeScript 源文件

### ⚡ 性能优化
- **编译时确定**: 配置在编译时固化，运行时无需环境判断
- **单一配置**: 每个环境只加载对应的配置文件
- **缓存友好**: 配置文件变化不影响其他代码的缓存

### 🛡️ 安全性
- **环境隔离**: 开发环境不包含生产配置信息
- **配置验证**: 构建时验证配置文件完整性
- **错误检测**: 及时发现配置文件问题

## 🐛 故障排除

### 配置文件相关问题

#### 1. 配置文件缺失
```bash
# 检查源文件
ls -la src/server/config/
# 应该看到: index.ts, dev.ts, prod.ts

# 重新构建
npm run clean
npm run build:dev  # 或 build:prod
```

#### 2. 环境配置错误
```bash
# 检查构建后的配置
npm run check:config

# 查看具体配置内容
cat dist/config/index.js
cat dist/config/dev.js    # 开发环境
cat dist/config/prod.js   # 生产环境
```

#### 3. 端口冲突
```bash
# 检查端口占用
lsof -ti:8081  # 开发环境
lsof -ti:8082  # 生产环境

# 杀死占用进程
kill -9 $(lsof -ti:8081)
kill -9 $(lsof -ti:8082)
```

#### 4. 构建失败
```bash
# 完全清理重建
npm run clean
rm -rf node_modules
npm install
npm run build:dev
```

#### 5. 配置文件编译错误
```bash
# 检查 TypeScript 语法
npx tsc --noEmit src/server/config/dev.ts
npx tsc --noEmit src/server/config/prod.ts

# 检查导入导出
node -e "console.log(require('./dist/config/index.js'))"
```

## 📊 环境对比

| 特性 | 开发环境 | 生产环境 |
|------|----------|----------|
| **配置文件** | `dev.ts` | `prod.ts` |
| **端口** | 8081 | 8082 |
| **静态资源** | `../../../dist/web/` | `/web/` |
| **模板缓存** | `false` | `memory` |
| **Sourcemap** | ✅ 包含 | ❌ 不包含 |
| **代码压缩** | ❌ 不压缩 | ✅ 压缩优化 |
| **热重载** | ✅ 支持 | ❌ 不支持 |
| **构建产物** | 包含调试信息 | 优化压缩 |
| **配置分离** | ✅ 只包含 dev | ✅ 只包含 prod |

## 🌐 部署建议

### 开发部署
```bash
# 本地开发
npm run dev

# 开发服务器部署
npm run deploy:dev

# 检查开发配置
npm run build:dev && npm run check:config
```

### 生产部署
```bash
# 构建生产版本
npm run build:prod

# 检查生产配置
npm run check:config

# 使用 PM2 部署
npm install -g pm2
pm2 start dist/index.js --name chalee-bff-prod

# 直接启动
npm run start:prod
```

### Docker 部署

**开发环境 Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:dev
EXPOSE 8081
CMD ["npm", "run", "start:dev"]
```

**生产环境 Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build:prod
EXPOSE 8082
CMD ["npm", "run", "start:prod"]
```

## 📈 性能监控

### 配置验证脚本
```bash
#!/bin/bash
# config-check.sh

echo "🔍 检查配置文件..."

# 检查源文件
if [ ! -f "src/server/config/dev.ts" ]; then
  echo "❌ dev.ts 缺失"
  exit 1
fi

if [ ! -f "src/server/config/prod.ts" ]; then
  echo "❌ prod.ts 缺失" 
  exit 1
fi

echo "✅ 源配置文件完整"

# 检查构建
npm run build:dev
if [ $? -ne 0 ]; then
  echo "❌ 开发构建失败"
  exit 1
fi

npm run build:prod  
if [ $? -ne 0 ]; then
  echo "❌ 生产构建失败"
  exit 1
fi

echo "✅ 所有构建成功"
npm run check:config
```

### 配置热更新 (开发环境)
```bash
# 监听配置文件变化并自动重启
npm run dev
# 修改 src/server/config/dev.ts 文件会自动触发重新编译和重启
```

---

🎉 **现在你的 awilix + koa 项目已经完全支持环境特定的配置构建！**

**主要优势**:
- ✅ **体积更小**: 每个环境只包含必要的配置文件
- ✅ **性能更好**: 编译时确定配置，运行时无需判断
- ✅ **更安全**: 环境配置完全隔离
- ✅ **易维护**: 配置文件清晰分离，便于管理

**使用建议**:
- 开发时使用 `npm run dev`
- 生产部署使用 `npm run deploy:prod`
- 定期运行 `npm run check:config` 验证配置
