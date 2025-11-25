import { Test, TestingModule } from '@nestjs/testing';
import { DevolucionesController } from './devoluciones.controller';
import { DevolucionesService } from './devoluciones.service';

describe('DevolucionesController', () => {
  let controller: DevolucionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevolucionesController],
      providers: [DevolucionesService],
    }).compile();

    controller = module.get<DevolucionesController>(DevolucionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
