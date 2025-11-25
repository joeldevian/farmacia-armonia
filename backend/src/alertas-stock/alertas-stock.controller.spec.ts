import { Test, TestingModule } from '@nestjs/testing';
import { AlertasStockController } from './alertas-stock.controller';
import { AlertasStockService } from './alertas-stock.service';

describe('AlertasStockController', () => {
  let controller: AlertasStockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertasStockController],
      providers: [AlertasStockService],
    }).compile();

    controller = module.get<AlertasStockController>(AlertasStockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
