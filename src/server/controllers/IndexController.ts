import { GET, route } from 'awilix-koa';
import { Context } from '@interfaces/IKoa';
import { prisma } from '../libs/prisma';

@route('/dev')
class IndexController {
  @GET()
  async actionList(ctx: Context): Promise<void> {
    ctx.body = {
      message: 'Hello, this is the IndexController actionList method!',
    };
  }

  @route('/list')
  @GET()
  async actionTest(ctx: Context): Promise<void> {
    const data = await prisma.person.findMany();
    ctx.body = {
      data,
    };
  }

  @route('/setData')
  @GET()
  async actionSetData(ctx: Context): Promise<void> {
    const data = await prisma.person.create({
      data: {
        username: `testUser-${Date.now()}`,
        password: 'testPassword',
        email: '123@qq.com'
      },
    });

    ctx.body = {
      message: 'Data has been set successfully!',
      data,
    };
  }
}
export default IndexController;
