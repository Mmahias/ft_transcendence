import { Module, Controller, Get } from '@nestjs/common';

@Controller('test')
export class TestController {
  @Get()
  testEndpoint(): string {
    return 'Test endpoint working!';
  }
}

@Module({
  controllers: [TestController],
})
export class TestModule {}
