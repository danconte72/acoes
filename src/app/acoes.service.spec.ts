import { TestBed } from '@angular/core/testing';

import { AcoesService } from './acoes.service';

describe('AcoesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AcoesService = TestBed.get(AcoesService);
    expect(service).toBeTruthy();
  });
});
