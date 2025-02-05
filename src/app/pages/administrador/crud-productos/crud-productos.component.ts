import { Component } from '@angular/core';
import { CommonModule, PercentPipe } from '@angular/common';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-crud-productos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crud-productos.component.html',
  styleUrl: './crud-productos.component.css'
})
export class CrudProductosComponent {
  newProduct (nombre: string, categoria: string, precio: string, descripcion: string)  {
    // Creamos un nuevo ID basado en la longitud del arreglo
    const newId = this.products.length + 1;
  
    // Creamos el nuevo usuario y lo agregamos al arreglo
    const newProduct = {nombre, categoria, precio, descripcion };
    this.products.push(newProduct);
  
    // Mostrar en consola para verificar
    console.log(this.products);
  };
  
  agregarProductosBoton() {
    Swal.fire({
      title: 'Agregar Nuevo Producto',
      html: `
        <form class="">
  <div class="container">
    <div class="row">
      <div class="col-md-6 mb-3">
        <input id="nombre" class="form-control" placeholder="Nombre" />
      </div>
      <div class="col-md-6 mb-3">
        <input id="precio" class="form-control" placeholder="Precio" type="number" />
      </div>
      <div class="mb-3">
        <textarea id="descripcion" placeholder="Descripcion" rows="4" style="width: 100%; border: var(--bs-border-width) solid var(--bs-border-color); "></textarea>
      </div>
      
    </div>
    <div class="row">
      <div class="col-md-12 mb-3">
        <select id="categoria" class="form-control">
          <option value="Cortes finos">Cortes finos</option>
          <option value="Especialidad">Especialidad</option>
          <option value="Comida de mar">Comida de mar</option>
        </select>
      </div>
    </div>
  </div>
</form>

      `,
      confirmButtonText: 'Agregar',
      showCancelButton: true,
      preConfirm: () => {
        // Obtener los valores de los inputs
        const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
        const categoria = (document.getElementById('categoria') as HTMLInputElement).value;
        const precio = (document.getElementById('precio') as HTMLSelectElement).value;
        const descripcion = (document.getElementById('descripcion') as HTMLSelectElement).value;
  
        // Verificar que todos los campos estén completos
        if (!nombre || !categoria || !precio || !descripcion) {
          Swal.showValidationMessage('Por favor, complete todos los campos');
        } else {
          // Agregar el nuevo usuario
          this.newProduct(nombre, categoria, precio, descripcion);
        }
      }
    });
  }

  products = [
    {nombre: 'tacos jamon', categoria: 'cortes finos', precio: '11', descripcion: "lorem ipsum" },
    {nombre: 'tacos lechon', categoria: 'cortes barrio', precio: '113', descripcion: "lorem ipsum" },
    {nombre: 'tacos chorizo', categoria: 'comida mar', precio: '112', descripcion: "lorem ipsum" },
    {nombre: 'tacos cachete', categoria: 'postre', precio: '11', descripcion: "lorem ipsum" }
  ];
}