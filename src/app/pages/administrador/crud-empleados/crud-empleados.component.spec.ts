import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudEmpleadosComponent } from './crud-empleados.component';

describe('CrudEmpleadosComponent', () => {
  let component: CrudEmpleadosComponent;
  let fixture: ComponentFixture<CrudEmpleadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudEmpleadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrudEmpleadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
