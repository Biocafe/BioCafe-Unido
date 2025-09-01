import { Test, TestingModule } from '@nestjs/testing';
import { AutenticadorService } from './autenticador.service';

describe('AutenticadorService', () => {
  let service: AutenticadorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutenticadorService],
    }).compile();

    service = module.get<AutenticadorService>(AutenticadorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
