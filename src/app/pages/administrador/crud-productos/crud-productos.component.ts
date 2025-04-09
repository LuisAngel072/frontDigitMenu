import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, PercentPipe } from '@angular/common';
import Swal from 'sweetalert2'
import { Extras, Ingredientes } from '../../../types';

@Component({
  selector: 'app-crud-productos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crud-productos.component.html',
  styleUrl: './crud-productos.component.css'
})
export class CrudProductosComponent {
 @Output() cambiarComponente = new EventEmitter<string>();


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
    this.cambiarComponente.emit('seccion7'); // Emite el nombre del componente que se debe mostrar

  }

  products = [
    {nombre: 'tacos jamon', categoria: 'cortes finos', precio: '11', descripcion: "lorem ipsum" },
    {nombre: 'tacos lechon', categoria: 'cortes barrio', precio: '113', descripcion: "lorem ipsum" },
    {nombre: 'tacos chorizo', categoria: 'comida mar', precio: '112', descripcion: "lorem ipsum" },
    {nombre: 'tacos cachete', categoria: 'postre', precio: '11', descripcion: "lorem ipsum" }
  ];
}
