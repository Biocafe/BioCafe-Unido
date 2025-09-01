import { Test, TestingModule } from '@nestjs/testing';
import { AutenticadorController } from './autenticador.controller';

describe('AutenticadorController', () => {
  let controller: AutenticadorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutenticadorController],
    }).compile();

    controller = module.get<AutenticadorController>(AutenticadorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
