import { Component } from '@angular/core';
import { IngredientesService } from '../../../services/ingredientes.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-crud-ingredientes',
  standalone: true,
  imports: [],
  templateUrl: './crud-ingredientes.component.html',
  styleUrl: './crud-ingredientes.component.css',
})
export class CrudIngredientesComponent {
  constructor(private readonly ingrServices: IngredientesService) {}

  async crearIngrediente() {
    Swal.fire({
      title: 'Agregar ingrediente',
      html: `
      <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Nombre del ingrediente</span>
            <input type="text" class="form-control border-secondary" id="nombre_ingrediente">
          </div>

          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Precio</span>
            <input type="number" class="form-control border-secondary" id="precio">
          </div>
        `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-prim',
        cancelButton: 'btn btn-peligro',
      },
      preConfirm: () => {
        const nombre_ingrediente = (
          document.getElementById('nombre_ingrediente') as HTMLInputElement
        ).value.trim();
        const precio = (
          document.getElementById('precio') as HTMLInputElement
        ).value.trim();

        if (!nombre_ingrediente || !precio) {
          Swal.showValidationMessage(
            'Por favor, complete todos los campos obligatorios.'
          );
          return;
        }

        const body = { nombre_ingrediente: nombre_ingrediente, precio: precio };

        return body;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const formData = result.value;
        const confirmacion = await Swal.fire({
          title: '¿Estás seguro de agregar el ingrediente?',
          showDenyButton: true,
          confirmButtonText: 'Continuar',
          customClass: {
            confirmButton: 'btn btn-terc',
            denyButton: 'btn btn-peligro',
          },
          denyButtonText: 'Cancelar',
          icon: 'warning',
        });
        if (confirmacion.isConfirmed) {
          try {
            Swal.fire({
              title: 'Cargando...',
              html: 'Por favor, espere mientras se procesa la información.',
              allowOutsideClick: false, // Evita que se pueda cerrar
              allowEscapeKey: false, // Evita que se cierre con la tecla Escape
              allowEnterKey: false, // Evita que se cierre con Enter
              didOpen: () => {
                Swal.showLoading(); // Muestra el spinner de carga
              },
            });
          } catch (error) {}
        }
      }
    });
  }
}
