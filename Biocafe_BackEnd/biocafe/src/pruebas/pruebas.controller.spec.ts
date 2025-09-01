import { Test, TestingModule } from '@nestjs/testing';
import { PruebasController } from './pruebas.controller';

describe('PruebasController', () => {
  let controller: PruebasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PruebasController],
    }).compile();

    controller = module.get<PruebasController>(PruebasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
