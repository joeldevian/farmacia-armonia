import { Test, TestingModule } from '@nestjs/testing';
import { VentasDetalleController } from './ventas-detalle.controller';
import { VentasDetalleService } from './ventas-detalle.service';

describe('VentasDetalleController', () => {
  let controller: VentasDetalleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VentasDetalleController],
      providers: [VentasDetalleService],
    }).compile();

    controller = module.get<VentasDetalleController>(VentasDetalleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
