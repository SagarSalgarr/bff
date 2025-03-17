import { Test, TestingModule } from '@nestjs/testing';
import { SoilhealthcardService } from './soilhealthcard.service';

describe('SoilhealthcardService', () => {
  let service: SoilhealthcardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SoilhealthcardService],
    }).compile();

    service = module.get<SoilhealthcardService>(SoilhealthcardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
