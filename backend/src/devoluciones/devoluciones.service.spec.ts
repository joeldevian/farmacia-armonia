import { Test, TestingModule } from '@nestjs/testing';
import { DevolucionesService } from './devoluciones.service';

describe('DevolucionesService', () => {
  let service: DevolucionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DevolucionesService],
    }).compile();

    service = module.get<DevolucionesService>(DevolucionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
