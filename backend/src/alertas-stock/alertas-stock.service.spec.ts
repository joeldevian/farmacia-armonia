import { Test, TestingModule } from '@nestjs/testing';
import { AlertasStockService } from './alertas-stock.service';

describe('AlertasStockService', () => {
  let service: AlertasStockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertasStockService],
    }).compile();

    service = module.get<AlertasStockService>(AlertasStockService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
