import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CocineroComponent } from './cocinero.component';

describe('CocineroComponent', () => {
  let component: CocineroComponent;
  let fixture: ComponentFixture<CocineroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CocineroComponent]  // Declarar el componente Cocinero
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CocineroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();  // Detecta los cambios en el componente
  });

  it('should create', () => {
    expect(component).toBeTruthy();  // Verifica que el componente se crea correctamente
  });

  it('should mark a pedido as elaborado', () => {
    const initialState = component.mesas[0].pedidos[0].elaborado;  // Estado inicial de "elaborado" del primer pedido
    component.marcarComoElaborado(1, 1);  // Marca el primer pedido de la Mesa 1 como elaborado
    expect(component.mesas[0].pedidos[0].elaborado).toBeTrue();  // Verifica que el pedido esté marcado como elaborado
  });

  it('should confirm elaborated pedidos in mesa', () => {
    component.confirmarElaborado(1);  // Confirma los pedidos de la Mesa 1
    expect(component.mesas[0].pedidos.length).toBe(0);  // Verifica que los pedidos elaborados hayan sido removidos de la mesa
  });
});
