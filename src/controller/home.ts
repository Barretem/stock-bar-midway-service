import { Controller, Get, Provide } from '@midwayjs/decorator';

@Provide()
@Controller('/frontend-node-plugin')
export class HomeController {
  @Get('/')
  async home() {
    return 'Hello Midwayjs!';
  }
}
