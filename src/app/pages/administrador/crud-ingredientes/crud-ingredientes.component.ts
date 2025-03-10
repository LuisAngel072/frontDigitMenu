import { Component, Input } from '@angular/core';
import { IngredientesService } from '../../../services/ingredientes.service';
import Swal from 'sweetalert2';
import { Ingredientes } from '../../../types';
import { AdministradorComponent } from '../administrador.component';
import { CommonModule } from '@angular/common';
import { IngredientesDTO } from '../../../dtos';
@Component({
  selector: 'app-crud-ingredientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crud-ingredientes.component.html',
  styleUrl: './crud-ingredientes.component.css',
})
export class CrudIngredientesComponent {
  constructor(
    private readonly ingrServices: IngredientesService,
    private adminComponente: AdministradorComponent
  ) {}

  @Input() ingredientes: Ingredientes[] = [];

  async ngOnInit() {
    this.ingredientes = this.adminComponente.ingredientes;
  }

  async verIngrediente(id_ingr: number) {
    try {
      const ingrediente = await this.ingredientes.find(
        (ingr) => ingr.id_ingr === id_ingr
      );
      if (!ingrediente) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se encontro el ingrediente en la base de datos, intenta más tarde.',
          timer: 2000,
        });
        return;
      }

      Swal.fire({
        title: 'Ver empleado',
        html: `
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Nombre del ingrediente</span>
            <input type="text" class="form-control border-secondary" value="${ingrediente?.nombre_ingrediente}" id="nombre_ingr" disabled>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Precio</span>
            <input type="number" class="form-control border-secondary" value="${ingrediente?.precio}" id="precio" disabled>
          </div>
        `,
        confirmButtonText: `Continuar`,
        customClass: {
          confirmButton: 'btn btn-prim',
        },
      });
    } catch (error) {
      console.error('Error al obtener el ingrediente.', error);
      throw error;
    }
  }

  /**
   * Registrar ingrediente en la base de datos
   * 
   * IngredientesDTO
   * 
   * nombre_ingrediente
   * precio: no debe exceder más de 5 digitos 999.99
   */
  async crearIngrediente() {
    try {
      Swal.fire({
        title: 'Agregar ingrediente',
        html: `
        <div class="input-group mt-2 mb-3 center-content me-3">
              <span class="input-group-text border-secondary">Nombre del ingrediente</span>
              <input type="text" class="form-control border-secondary" id="nombre_ingrediente">
            </div>
  
            <div class="input-group mt-2 mb-3 center-content me-3">
              <span class="input-group-text border-secondary">Precio</span>
              <input type="number" step="0.01" min="0.00" max="999.99" class="form-control border-secondary" id="precio">
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

          const body:IngredientesDTO = {
            nombre_ingrediente: nombre_ingrediente,
            precio: parseFloat(precio),
          };

          return body;
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          const formData: IngredientesDTO = result.value;
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
             await this.ingrServices.crearIngrediente(formData);
              Swal.close();
              this.ingredientes = await this.ingrServices.getIngredientes();
              this.adminComponente.ingredientes = this.ingredientes;
              Swal.fire({
                icon: 'success',
                title: 'Ingrediente registrado',
                html: 'Ingrediente registrado existosamente',
                timer: 2000,
              });
            } catch (error) {
              Swal.close();
              this.ingredientes = await this.ingrServices.getIngredientes();
              this.adminComponente.ingredientes = this.ingredientes;
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo crear el ingrediente.',
              });
            }
          }
        }
      });
    } catch (error) {
      console.error(
        'Error al crear el ingrediente. ERROR -> ingredientes.service.ts -> crearIngrediente()',
        error
      );
      throw error;
    }
  }

  /**
   * NO ADMITIR CAMPOS VACÍOS
   * @param id_ingr Ingrediente a actualizar
   * @returns Ingrediente actualizado
   */
  async actualizarIngrediente(id_ingr: number) {
    try {
      const ingrediente = this.ingredientes.find(
        (ingr) => ingr.id_ingr === id_ingr
      );

      if (!ingrediente) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se encontro el ingrediente en la base de datos, intenta más tarde.',
          timer: 2000,
        });
        return;
      }

      Swal.fire({
        title: 'Editar ingrediente',
        html: `
        <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Nombre del ingrediente</span>
            <input type="text" class="form-control border-secondary" value="${ingrediente?.nombre_ingrediente}" id="nombre_ingr">
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Precio</span>
            <input type="number" class="form-control border-secondary" step="0.01" min="0.00" max="999.99" value="${ingrediente?.precio}" id="precio">
          </div>`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn btn-prim',
          cancelButton: 'btn btn-peligro',
        },
        preConfirm: () => {
          const nombre_ingr = (
            document.getElementById('nombre_ingr') as HTMLInputElement
          ).value.trim();
          const precio = (document.getElementById('precio') as HTMLInputElement)
            .value;

          if (!nombre_ingr || !precio) {
            Swal.showValidationMessage(
              'Por favor, complete todos los campos obligatorios.'
            );
            return;
          }

          const data: IngredientesDTO = {
            nombre_ingrediente: nombre_ingr,
            precio: parseFloat(precio),
          };

          return data;
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          const formData = result.value;
          const confirmacion = await Swal.fire({
            icon: 'warning',
            title: '¿Estás seguro de editar el ingrediente',
            showDenyButton: true,
            denyButtonText: 'Cancelar',
            confirmButtonText: 'Continuar',
            customClass: {
              confirmButton: 'btn btn-terc',
              denyButton: 'btn btn-peligro',
            },
          });
          if (confirmacion.isConfirmed) {
            try {
              Swal.fire({
                title: 'Cargando...',
                text: 'Por favor, espere mientras se procesa la información.',
                allowOutsideClick: false, // Evita que se pueda cerrar
                allowEscapeKey: false, // Evita que se cierre con la tecla Escape
                allowEnterKey: false, // Evita que se cierre con Enter
                didOpen: () => {
                  Swal.showLoading(); // Muestra el spinner de carga
                },
              });
              this.ingrServices.upIngrediente(id_ingr, formData);
              Swal.close();
              this.ingredientes = await this.ingrServices.getIngredientes();
              this.adminComponente.ingredientes = this.ingredientes;
              Swal.fire({
                icon: 'success',
                text: 'Ingrediente actualizado con éxito',
                timer: 2000,
              });
              
            } catch (error) {
              Swal.close();
              this.ingredientes = await this.ingrServices.getIngredientes();
              this.adminComponente.ingredientes = this.ingredientes;
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar el ingrediente.',
              });
            }
          }
        }
      });
    } catch (error) {
      console.error(
        'Error al actualizar el ingrediente. ERROR -> ingredientes.service.ts -> upIngrediente()',
        error
      );
      throw error;
    }
  }

  async delIngrediente(id_ingr: number) {
    try {
      const ingrediente = this.ingredientes.find(
        (ingr) => ingr.id_ingr === id_ingr
      );

      if (!ingrediente) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se encontro el ingrediente en la base de datos, intenta más tarde.',
          timer: 2000,
        });
        return;
      }

      Swal.fire({
        icon: 'warning',
        title: 'Eliminar ingrediente',
        text: '¿Está seguro de eliminar este ingrediente?',
        showCancelButton: true,
        showConfirmButton: true,
        customClass: {
          confirmButton: 'btn btn-peligro',
          cancelButton: 'btn btn-terc',
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            Swal.fire({
              title: 'Cargando...',
              text: 'Por favor, espere mientras se procesa la información.',
              allowOutsideClick: false, // Evita que se pueda cerrar
              allowEscapeKey: false, // Evita que se cierre con la tecla Escape
              allowEnterKey: false, // Evita que se cierre con Enter
              didOpen: () => {
                Swal.showLoading(); // Muestra el spinner de carga
              },
            });

            await this.ingrServices.delIngrediente(id_ingr);

            Swal.close();
            Swal.fire({
              icon: 'success',
              title: 'Ingrediente eliminado',
              text: 'Ingrediente eliminado con éxito',
            });
            this.ingredientes = await this.ingrServices.getIngredientes();
            this.adminComponente.ingredientes = this.ingredientes;
            return;
          } catch (error) {
            this.ingredientes = await this.ingrServices.getIngredientes();
            this.adminComponente.ingredientes = this.ingredientes;
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el ingrediente.',
            });
          }
        }
      });
    } catch (error) {
      console.error(
        'Error al eliminar el ingrediente. ERROR -> ingredientes.service.ts -> delIngrediente()',
        error
      );
      throw error;
    }
  }
}
