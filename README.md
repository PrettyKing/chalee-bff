# chalee BFF

## 数据迁移
确保所有数据库迁移已经应用：
``` shell
npx prisma migrate deploy
``` 


## Tips

``` shell
# 如何在 Remix 应用中使用数据库存储用户信息？
# 使用数据库客户端（如 Prisma、TypeORM 等）连接到数据库。
# 以下是一个使用 Prisma 作为数据库客户端的示例

# 首先，安装 Prisma 和 SQLite（或其他数据库）
npm install @prisma/client
npm install prisma --save-dev

# 初始化 Prisma
npx prisma init

#运行 Prisma 命令生成数据库和 Prisma 客户端：
npx prisma migrate dev --name update-role-to-user
npx prisma generate

```