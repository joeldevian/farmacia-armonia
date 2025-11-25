import { Test, TestingModule } from '@nestjs/testing';
import { VentasDetalleService } from './ventas-detalle.service';

describe('VentasDetalleService', () => {
  let service: VentasDetalleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VentasDetalleService],
    }).compile();

    service = module.get<VentasDetalleService>(VentasDetalleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
