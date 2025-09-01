import { Test, TestingModule } from '@nestjs/testing';
import { PruebasService } from './pruebas.service';

describe('PruebasService', () => {
  let service: PruebasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PruebasService],
    }).compile();

    service = module.get<PruebasService>(PruebasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
