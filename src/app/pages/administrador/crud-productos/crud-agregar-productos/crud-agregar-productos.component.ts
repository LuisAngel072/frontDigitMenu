import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crud-agregar-productos',
  standalone: true,
  imports: [],
  templateUrl: './crud-agregar-productos.component.html',
  styleUrl: './crud-agregar-productos.component.css'
})
export class CrudAgregarProductosComponent {
  mostrarAlerta(event: Event) {
    event.preventDefault(); // Evita la recarga del formulario
  
    // Capturar los valores del formulario
    const nombreProducto = (document.querySelector('input[type="text"]') as HTMLInputElement).value.trim();
    const subcategoria = (document.querySelector('.form-select') as HTMLSelectElement).value;
    const opcion = (document.querySelectorAll('.form-select')[1] as HTMLSelectElement).value;
    const ingredientes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(input => (input as HTMLInputElement).value);
  
    // Validar que los campos obligatorios estén completos
    if (!nombreProducto) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, ingrese el nombre del producto.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    if (subcategoria === 'Seleccione una subcategoría') {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, seleccione una subcategoría.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    if (opcion === 'Seleccione una opción') {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, seleccione una opción.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    if (ingredientes.length === 0) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, seleccione al menos un ingrediente.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }
  
    // Si todos los campos son válidos, mostrar mensaje de éxito
    Swal.fire({
      title: '¡Producto Agregado!',
      text: 'El producto ha sido creado correctamente.',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }
}