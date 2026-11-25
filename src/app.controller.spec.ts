import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return greeting from i18n', () => {
      const mockI18n = {
        t: jest.fn().mockReturnValue('Hello World!'),
      };

      expect(appController.getHello(mockI18n as any)).toBe('Hello World!');
      expect(mockI18n.t).toHaveBeenCalledWith('common.HELLO');
    });
  });
});
