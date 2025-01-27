import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudIngredientesComponent } from './crud-ingredientes.component';

describe('CrudIngredientesComponent', () => {
  let component: CrudIngredientesComponent;
  let fixture: ComponentFixture<CrudIngredientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudIngredientesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrudIngredientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
