import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2'



@Component({
  selector: 'app-crud-empleados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crud-empleados.component.html',
  styleUrl: './crud-empleados.component.css'
})
export class CrudEmpleadosComponent {
  addUser (nombres: string, apellidos: string, rol: string)  {
    // Creamos un nuevo ID basado en la longitud del arreglo
    const newId = this.employees.length + 1;
  
    // Creamos el nuevo usuario y lo agregamos al arreglo
    const newUser = { id: newId, nombres, apellidos, rol };
    this.employees.push(newUser);
  
    // Mostrar en consola para verificar
    console.log(this.employees);
  };
  
  agregarEmpleadosBoton() {
    Swal.fire({
      title: 'Agregar Nuevo Usuario',
      html: `
        <form class="merequetengue">
  <div class="container">
    <div class="row">
      <div class="col-md-6 mb-3">
        <input id="nombres" class="form-control" placeholder="Nombres" />
      </div>
      <div class="col-md-6 mb-3">
        <input id="apellidos" class="form-control" placeholder="Apellidos" />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 mb-3">
        <select id="rol" class="form-control">
          <option value="Administrador">Administrador</option>
          <option value="Cocinero">Cocinero</option>
          <option value="Mesero">Mesero</option>
          <option value="Cajero">Cajero</option>
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
        const nombres = (document.getElementById('nombres') as HTMLInputElement).value;
        const apellidos = (document.getElementById('apellidos') as HTMLInputElement).value;
        const rol = (document.getElementById('rol') as HTMLSelectElement).value;
  
        // Verificar que todos los campos estén completos
        if (!nombres || !apellidos || !rol) {
          Swal.showValidationMessage('Por favor, complete todos los campos');
        } else {
          // Agregar el nuevo usuario
          this.addUser(nombres, apellidos, rol);
        }
      }
    });
  }

  employees = [
    { id: 1, nombres: 'Juan Pérez', apellidos: 'felucioano', rol: 'Administrador' },
    { id: 2, nombres: 'María López', apellidos: 'carnaza', rol: 'Cocinero' },
    { id: 3, nombres: 'Carlos Ruiz', apellidos: 'macias', rol: 'Mesero' },
    { id: 4, nombres: 'Ana Torres', apellidos: 'chicho', rol: 'Cajero' }
  ];
}
