import { Test, TestingModule } from '@nestjs/testing';
import { InventarioKardexService } from './inventario-kardex.service';

describe('InventarioKardexService', () => {
  let service: InventarioKardexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventarioKardexService],
    }).compile();

    service = module.get<InventarioKardexService>(InventarioKardexService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
