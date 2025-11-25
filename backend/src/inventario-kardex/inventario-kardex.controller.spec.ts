import { Test, TestingModule } from '@nestjs/testing';
import { InventarioKardexController } from './inventario-kardex.controller';
import { InventarioKardexService } from './inventario-kardex.service';

describe('InventarioKardexController', () => {
  let controller: InventarioKardexController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventarioKardexController],
      providers: [InventarioKardexService],
    }).compile();

    controller = module.get<InventarioKardexController>(InventarioKardexController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
