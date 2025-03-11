import { Component, Input } from '@angular/core';
import { IngredientesService } from '../../../services/ingredientes.service';
import Swal from 'sweetalert2';
import { Extras, Ingredientes, Opciones } from '../../../types';
import { AdministradorComponent } from '../administrador.component';
import { CommonModule } from '@angular/common';
import { ExtrasDTO, IngredientesDTO, OpcionesDTO } from '../../../dtos';
import { ExtrasService } from '../../../services/extras.service';
import { OpcionesService } from '../../../services/opciones.service';
@Component({
  selector: 'app-crud-ingredientes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crud-ingredientes.component.html',
  styleUrl: './crud-ingredientes.component.css',
})
export class CrudIngredientesComponent {
  @Input() ingredientes: Ingredientes[] = [];
  @Input() extras: Extras[] = [];
  @Input() opciones: Opciones[] = []

  constructor(
    private readonly ingrServices: IngredientesService,
    private readonly opcionesService: OpcionesService,
    private readonly extrasService: ExtrasService,
    private adminComponente: AdministradorComponent,
  ) {}

  async ngOnInit() {
    this.ingredientes = this.adminComponente.ingredientes;
    this.extras = this.adminComponente.extras;
    this.opciones = this.adminComponente.opciones;
  }

  /**
   *
   * INGREDIENTES CRUD
   *
   */

  /**
   * Esta función es utilizada cuando el usuario presiona el botón de ver ingrediente
   * @param id_ingr Ingrediente a ver
   * @returns
   */
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
        title: `${ingrediente?.nombre_ingrediente}`,
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

          const body: IngredientesDTO = {
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
          const nombre_ingrediente = (
            document.getElementById('nombre_ingr') as HTMLInputElement
          ).value.trim();
          const precio = (document.getElementById('precio') as HTMLInputElement)
            .value;

          if (!nombre_ingrediente || !precio) {
            Swal.showValidationMessage(
              'Por favor, complete todos los campos obligatorios.'
            );
            return;
          }

          const data: IngredientesDTO = {
            nombre_ingrediente: nombre_ingrediente,
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
              timer: 2000
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
              timer: 2000,
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
  /**
   *
   * FIN DE INGREDIENTES CRUD
   *
   */

  /**
   *
   * OPCIONES CRUD
   *
   */

  /**
   * Esta función se ejecuta cuando el usuario da clic en el boton ver opcion
   * @param id_opcion ID de la opcion a revisar
   * @returns
   */
  async verOpcion(id_opcion: number) {
    try {
      const opcionF = this.opciones.find((opcion) => opcion.id_opcion === id_opcion);

      if (!opcionF) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se encontro la opcion.',
          timer: 2000,
        });
        return;
      }
      Swal.fire({
        title: `${opcionF?.nombre_opcion}`,
        html: `
        <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Nombre del extra</span>
            <input type="text" class="form-control border-secondary" value="${opcionF?.nombre_opcion}" id="nombre_opcion" disabled>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Precio</span>
            <input type="number" class="form-control border-secondary" value="${opcionF?.porcentaje}" id="porcentaje" disabled>
          </div>
        `,
        confirmButtonText: `Continuar`,
        customClass: {
          confirmButton: 'btn btn-prim',
        },
      });
    } catch (error) {
      console.error('Error al obtener la opcion.', error);
      throw error;
    }
  }

  async crearOpcion() {
    try {
      Swal.fire({
        title: 'Agregar opcion',
        html: `
        <div class="input-group mt-2 mb-3 center-content me-3">
              <span class="input-group-text border-secondary">Nombre de la opcion</span>
              <input type="text" class="form-control border-secondary" id="nombre_opcion">
            </div>
  
            <div class="input-group mt-2 mb-3 center-content me-3">
              <span class="input-group-text border-secondary">Porcentaje</span>
              <input type="number" step="0.01" min="0.00" max="100.00" class="form-control border-secondary" id="porcentaje">
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
          const nombre_opcion = (
            document.getElementById('nombre_opcion') as HTMLInputElement
          ).value.trim();
          const porcentaje = (
            document.getElementById('porcentaje') as HTMLInputElement
          ).value;

          if (!nombre_opcion || !porcentaje) {
            Swal.showValidationMessage(
              'Por favor, complete todos los campos obligatorios.'
            );
            return;
          }

          const body: OpcionesDTO = {
            nombre_opcion: nombre_opcion,
            porcentaje: parseFloat(porcentaje),
          };

          return body;
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          const formData: OpcionesDTO = result.value;
          console.log(formData);
          const confirmacion = await Swal.fire({
            title: '¿Estás seguro de agregar la opcion?',
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
              await this.opcionesService.crearOpcion(formData);
              Swal.close();
              this.opciones = await this.opcionesService.getOpciones();
              this.adminComponente.opciones = this.opciones;
              Swal.fire({
                icon: 'success',
                title: 'Opción registrada',
                html: 'Opción registrada existosamente',
                timer: 2000,
              });
            } catch (error) {
              Swal.close();
              this.opciones = await this.opcionesService.getOpciones();
              this.adminComponente.opciones = this.opciones;
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo crear la opción.',
              });
            }
          }
        }
      });
    } catch (error) {
      console.error(
        'Error al crear la opción. ERROR -> opciones.service.ts -> crearOpcion()',
        error
      );
      throw error;
    }
  }

  /**
   * NO ADMITIR CAMPOS VACÍOS
   * @param id_opcion Opcion a actualizar
   * @returns Opcion actualizado
   */
  async actualizarOpcion(id_opcion: number) {
    try {
      const opcionF = this.opciones.find(
        (opcion) => opcion.id_opcion  === id_opcion
      );

      if (!opcionF) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se encontro la opción en la base de datos, intenta más tarde.',
          timer: 2000,
        });
        return;
      }

      Swal.fire({
        title: 'Editar opción',
        html: `
        <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Nombre del ingrediente</span>
            <input type="text" class="form-control border-secondary" value="${opcionF?.nombre_opcion}" id="nombre_opcion">
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Precio</span>
            <input type="number" class="form-control border-secondary" step="0.01" min="0.00" max="999.99" value="${opcionF?.porcentaje}" id="porcentaje">
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
          const nombre_opcion = (
            document.getElementById('nombre_opcion') as HTMLInputElement
          ).value.trim();
          const porcentaje = (document.getElementById('porcentaje') as HTMLInputElement)
            .value;

          if (!nombre_opcion || !porcentaje) {
            Swal.showValidationMessage(
              'Por favor, complete todos los campos obligatorios.'
            );
            return;
          }

          const data: OpcionesDTO = {
            nombre_opcion: nombre_opcion,
            porcentaje: parseFloat(porcentaje),
          };

          return data;
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          const formData = result.value;
          const confirmacion = await Swal.fire({
            icon: 'warning',
            title: '¿Estás seguro de editar la opción',
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
              this.opcionesService.upOpcion(id_opcion, formData);
              Swal.close();
              this.opciones = await this.opcionesService.getOpciones();
              this.adminComponente.opciones = this.opciones;
              Swal.fire({
                icon: 'success',
                text: 'Opción actualizada con éxito',
                timer: 2000,
              });
            } catch (error) {
              Swal.close();
              this.opciones = await this.opcionesService.getOpciones();
              this.adminComponente.opciones = this.opciones;
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar la opción.',
              });
            }
          }
        }
      });
    } catch (error) {
      console.error(
        'Error al actualizar la opción. ERROR -> opciones.service.ts -> upOpciones()',
        error
      );
      throw error;
    }
  }

  /**
   * Elimina el registro de una opcion cuando el usuario da clic al boton de basura
   * @param id_opcion 
   * @returns 
   */
  async delOpcion(id_opcion: number) {
    try {
      const opcionF = this.opciones.find(
        (opcion) => opcion.id_opcion  === id_opcion
      );

      if (!opcionF) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se encontro la opción en la base de datos, intenta más tarde.',
          timer: 2000,
        });
        return;
      }

      Swal.fire({
        icon: 'warning',
        title: 'Eliminar opción',
        text: '¿Está seguro de eliminar esta opción?',
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

            await this.opcionesService.delOpcion(id_opcion);

            Swal.close();

            Swal.fire({
              icon: 'success',
              title: 'Opción eliminada',
              text: 'Opción eliminada con éxito',
              timer: 2000,
            });
            
            this.opciones = await this.opcionesService.getOpciones();
            this.adminComponente.opciones = this.opciones;
            return;
          } catch (error) {
            Swal.close();
            this.opciones = await this.opcionesService.getOpciones();
            this.adminComponente.opciones = this.opciones;
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar la opción.',
            });
          }
        }
      });
    } catch (error) {
      console.error(
        'Error al eliminar la opción. ERROR -> opcion.service.ts -> delOpcion()',
        error
      );
      throw error;
    }
  }
  /**
   *
   * FIN DE OPCIONES CRUD
   *
   */

  /**
   *
   * EXTRAS CRUD
   *
   */

  /**
   * Esta función se ejecuta cuando el usuario da clic en el boton ver extra
   * @param id_extra ID del extra a revisar
   * @returns
   */
  async verExtra(id_extra: number) {
    try {
      const extraF = this.extras.find((extra) => extra.id_extra === id_extra);

      if (!extraF) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se encontro el extra.',
          timer: 2000,
        });
        return;
      }
      Swal.fire({
        title: `${extraF?.nombre_extra}`,
        html: `
        <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Nombre del extra</span>
            <input type="text" class="form-control border-secondary" value="${extraF?.nombre_extra}" id="nombre_extra" disabled>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Precio</span>
            <input type="number" class="form-control border-secondary" value="${extraF?.precio}" id="precio" disabled>
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

  async crearExtra() {
    try {
      Swal.fire({
        title: 'Agregar extra',
        html: `
        <div class="input-group mt-2 mb-3 center-content me-3">
              <span class="input-group-text border-secondary">Nombre del extra</span>
              <input type="text" class="form-control border-secondary" id="nombre_extra">
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
          const nombre_extra = (
            document.getElementById('nombre_extra') as HTMLInputElement
          ).value.trim();
          const precio = (
            document.getElementById('precio') as HTMLInputElement
          ).value.trim();

          if (!nombre_extra || !precio) {
            Swal.showValidationMessage(
              'Por favor, complete todos los campos obligatorios.'
            );
            return;
          }

          const body: ExtrasDTO = {
            nombre_extra: nombre_extra,
            precio: parseFloat(precio),
          };

          return body;
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          const formData: ExtrasDTO = result.value;
          const confirmacion = await Swal.fire({
            title: '¿Estás seguro de agregar el extra?',
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
              await this.extrasService.crearExtra(formData);
              Swal.close();
              this.extras = await this.extrasService.getExtras();
              this.adminComponente.extras = this.extras;
              Swal.fire({
                icon: 'success',
                title: 'Extra registrado',
                html: 'Extra registrado existosamente',
                timer: 2000,
              });
            } catch (error) {
              Swal.close();
              this.extras = await this.extrasService.getExtras();
              this.adminComponente.extras = this.extras;
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo crear el extra.',
              });
            }
          }
        }
      });
    } catch (error) {
      console.error(
        'Error al crear el extra. ERROR -> extras.service.ts -> crearExtra()',
        error
      );
      throw error;
    }
  }

  /**
   * NO ADMITIR CAMPOS VACÍOS
   * @param id_extra Extra a actualizar
   * @returns Extra actualizado
   */
  async actualizarExtra(id_extra: number) {
    try {
      const extraF = this.extras.find(
        (extra) => extra.id_extra  === id_extra
      );

      if (!extraF) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se encontro el extra en la base de datos, intenta más tarde.',
          timer: 2000,
        });
        return;
      }

      Swal.fire({
        title: 'Editar extra',
        html: `
        <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Nombre del extra</span>
            <input type="text" class="form-control border-secondary" value="${extraF?.nombre_extra}" id="nombre_extra">
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Precio</span>
            <input type="number" class="form-control border-secondary" step="0.01" min="0.00" max="999.99" value="${extraF?.precio}" id="precio">
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
          const nombre_extra = (
            document.getElementById('nombre_extra') as HTMLInputElement
          ).value.trim();
          const precio = (document.getElementById('precio') as HTMLInputElement)
            .value;

          if (!nombre_extra || !precio) {
            Swal.showValidationMessage(
              'Por favor, complete todos los campos obligatorios.'
            );
            return;
          }

          const data: ExtrasDTO = {
            nombre_extra: nombre_extra,
            precio: parseFloat(precio),
          };

          return data;
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          const formData = result.value;
          const confirmacion = await Swal.fire({
            icon: 'warning',
            title: '¿Estás seguro de editar el extra',
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
              this.extrasService.upExtra(id_extra, formData);
              Swal.close();
              this.extras = await this.extrasService.getExtras();
              this.adminComponente.extras = this.extras;
              Swal.fire({
                icon: 'success',
                text: 'Extra actualizado con éxito',
                timer: 2000,
              });
            } catch (error) {
              Swal.close();
              this.extras = await this.extrasService.getExtras();
              this.adminComponente.extras = this.extras;
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar el extra.',
              });
            }
          }
        }
      });
    } catch (error) {
      console.error(
        'Error al actualizar el extra. ERROR -> extras.service.ts -> upExtras()',
        error
      );
      throw error;
    }
  }

  async delExtra(id_extra: number) {
    try {
      const extraF = this.extras.find(
        (extra) => extra.id_extra  === id_extra
      );

      if (!extraF) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se encontro el extra en la base de datos, intenta más tarde.',
          timer: 2000,
        });
        return;
      }

      Swal.fire({
        icon: 'warning',
        title: 'Eliminar extra',
        text: '¿Está seguro de eliminar este extra?',
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

            await this.extrasService.delExtra(id_extra);

            Swal.close();

            Swal.fire({
              icon: 'success',
              title: 'Extra eliminado',
              text: 'Extra eliminado con éxito',
              timer: 2000,
            });
            this.extras = await this.extrasService.getExtras();
            this.adminComponente.extras = this.extras;
            return;
          } catch (error) {
            Swal.close();
            this.extras = await this.extrasService.getExtras();
            this.adminComponente.extras = this.extras;
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el extra.',
            });
          }
        }
      });
    } catch (error) {
      console.error(
        'Error al eliminar el extra. ERROR -> extras.service.ts -> delExtra()',
        error
      );
      throw error;
    }
  }
  /**
   *
   * FIN DE EXTRAS CRUD
   *
   */

}
