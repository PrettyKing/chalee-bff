import { GET, route } from 'awilix-koa';
import { Context } from '@interfaces/IKoa';

@route('/')
class IndexController {
  @GET()
  async actionList(ctx: Context): Promise<void> {
    const data = await ctx.render('index', {
      data: '服务端数据',
    });
    console.log('🍊🍊🍊🍊🍊🍊🍊 ', data);

    ctx.body = data;
  }
}
export default IndexController;
