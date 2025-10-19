import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CajaVistaComponent } from './caja-vista.component';

describe('CajaVistaComponent', () => {
  let component: CajaVistaComponent;
  let fixture: ComponentFixture<CajaVistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CajaVistaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CajaVistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
