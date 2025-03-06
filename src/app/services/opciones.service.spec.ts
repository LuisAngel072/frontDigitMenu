import { TestBed } from '@angular/core/testing';

import { OpcionesService } from './opciones.service';

describe('OpcionesService', () => {
  let service: OpcionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpcionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
