import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudAgregarProductosComponent } from './crud-agregar-productos.component';

describe('CrudAgregarProductosComponent', () => {
  let component: CrudAgregarProductosComponent;
  let fixture: ComponentFixture<CrudAgregarProductosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudAgregarProductosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrudAgregarProductosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
