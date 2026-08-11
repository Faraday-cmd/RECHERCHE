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

  describe('getHealth', () => {
    it('should return health status with status ok and defaultLocale fr', () => {
      const result = appController.getHealth();
      expect(result).toEqual({
        status: 'ok',
        service: 'recherche-api',
        version: '1.0.0',
        defaultLocale: 'fr',
      });
    });
  });
});
