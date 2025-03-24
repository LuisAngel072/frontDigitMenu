import { Component, Input } from '@angular/core';
import { CategoriasService } from '../../../services/categorias.service';
import { SubcategoriaService } from '../../../services/subcategoria.service'; // Servicio para subcategorías
import Swal from 'sweetalert2';
import { Categorias, Sub_categorias } from '../../../types';
import { AdministradorComponent } from '../administrador.component';
import { CommonModule } from '@angular/common';
import { CategoriasDTO } from '../../../dtos';
import { SubcategoriasDTO } from '../../../dtos';  // DTO para las subcategorías

@Component({
  selector: 'app-crud-categorias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css'],
})
export class CategoriasComponent {
  @Input() categorias: Categorias[] = [];
  @Input() subcategorias: Sub_categorias[] = []; // Subcategorías
  constructor(
    private readonly catServices: CategoriasService,
    private readonly subcatServices: SubcategoriaService, // Servicio para subcategorías
    private adminComponente: AdministradorComponent
  ) {}
  
  async ngOnInit() {
    this.categorias = this.adminComponente.categorias;
    this.subcategorias = await this.subcatServices.obtenerSubcategorias(); // Ahora es asincrónico
    this.adminComponente.subcategorias = this.subcategorias;
  }

  // Categorías
  async verCategoria(id_cat: number) {
    try {
      const categoria = this.categorias.find((cat) => cat.id_cat === id_cat);
      if (!categoria) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se encontró la categoría en la base de datos, intenta más tarde.',
          timer: 2000,
        });
        return;
      }
      Swal.fire({
        title: 'Ver categoría',
        html: `
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Nombre de la categoría</span>
            <input type="text" class="form-control border-secondary" value="${categoria?.nombre_cat}" id="nombre_cat" disabled>
          </div>
        `,
        confirmButtonText: `Continuar`,
        customClass: {
          confirmButton: 'btn btn-prim',
        },
      });
    } catch (error) {
      console.error('Error al obtener la categoría.', error);
      throw error;
    }
  }
// Eliminar categoría
async delCategoria(id_cat: number) {
  try {
    const categoria = this.categorias.find((cat) => cat.id_cat === id_cat);

    if (!categoria) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No se encontró la categoría en la base de datos, intenta más tarde.',
        timer: 2000,
      });
      return;
    }

    Swal.fire({
      icon: 'warning',
      title: 'Eliminar categoría',
      text: '¿Está seguro de eliminar esta categoría?',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-peligro',
        cancelButton: 'btn btn-terc',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await this.catServices.delCategoria(id_cat); // Llama al servicio para eliminar
          Swal.close();
          Swal.fire({
            icon: 'success',
            title: 'Categoría eliminada',
            text: 'Categoría eliminada con éxito.',
          });
          this.categorias = await this.catServices.getCategorias();
          this.adminComponente.categorias = this.categorias;
        } catch (error) {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar la categoría.',
          });
        }
      }
    });
  } catch (error) {
    console.error('Error al eliminar la categoría.', error);
    throw error;
  }
}

  async crearCategoria() {
    try {
      Swal.fire({
        title: 'Agregar categoría',
        html: `
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Nombre de la categoría</span>
            <input type="text" class="form-control border-secondary" id="nombre_categoria">
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
          const nombre_categoria = (
            document.getElementById('nombre_categoria') as HTMLInputElement
          ).value.trim();

          if (!nombre_categoria) {
            Swal.showValidationMessage(
              'Por favor, complete todos los campos obligatorios.'
            );
            return;
          }

          const body: CategoriasDTO = {
            nombre_cat: nombre_categoria,
          };

          return body;
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          const formData: CategoriasDTO = result.value;
          console.log(formData);
          const confirmacion = await Swal.fire({
            title: '¿Estás seguro de agregar la categoría?',
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
              await this.catServices.crearCategoria(formData);
              Swal.close();
              this.categorias = await this.catServices.getCategorias();
              this.adminComponente.categorias = this.categorias;
              Swal.fire({
                icon: 'success',
                title: 'Categoría registrada',
                html: 'Categoría registrada exitosamente',
                timer: 2000,
              });
            } catch (error) {
              Swal.close();
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo crear la categoría.',
              });
            }
          }
        }
      });
    } catch (error) {
      console.error('Error al crear la categoría.', error);
      throw error;
    }
  }
// Editar categoría
async actualizarCategoria(id_cat: number) {
  try {
    const categoria = this.categorias.find((cat) => cat.id_cat === id_cat);

    if (!categoria) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No se encontró la categoría en la base de datos, intenta más tarde.',
        timer: 2000,
      });
      return;
    }

    Swal.fire({
      title: 'Editar categoría',
      html: ` 
        <div class="input-group mt-2 mb-3 center-content me-3">
          <span class="input-group-text border-secondary">Nombre de la categoría</span>
          <input type="text" class="form-control border-secondary" value="${categoria?.nombre_cat}" id="nombre_cat">
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
        const nombre_categoria = (document.getElementById('nombre_cat') as HTMLInputElement).value.trim();
        if (!nombre_categoria) {
          Swal.showValidationMessage('Por favor, complete todos los campos obligatorios.');
          return;
        }

        const body: CategoriasDTO = {
          nombre_cat: nombre_categoria,
        };

        return body;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const formData: CategoriasDTO = result.value;
        const confirmacion = await Swal.fire({
          title: '¿Estás seguro de editar la categoría?',
          showDenyButton: true,
          confirmButtonText: 'Continuar',
          denyButtonText: 'Cancelar',
          customClass: {
            confirmButton: 'btn btn-terc',
            denyButton: 'btn btn-peligro',
          },
          icon: 'warning',
        });
        if (confirmacion.isConfirmed) {
          try {
            await this.catServices.upCategoria(id_cat, formData);  // Llama al servicio de edición
            Swal.close();
            this.categorias = await this.catServices.getCategorias();
            this.adminComponente.categorias = this.categorias;
            Swal.fire({
              icon: 'success',
              title: 'Categoría actualizada',
              html: 'Categoría actualizada con éxito.',
              timer: 2000,
            });
          } catch (error) {
            Swal.close();
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo actualizar la categoría.',
            });
          }
        }
      }
    });
  } catch (error) {
    console.error('Error al actualizar la categoría.', error);
    throw error;
  }
}

  // Subcategorías
  async verSubcategoria(id_subcat: number) {
    try {
      const subcategoria = this.subcategorias.find(
        (sub) => sub.id_subcat === id_subcat
      );
      if (!subcategoria) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se encontró la subcategoría en la base de datos, intenta más tarde.',
          timer: 2000,
        });
        return;
      }

      Swal.fire({
        title: 'Ver subcategoría',
        html: `
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Nombre de la subcategoría</span>
            <input type="text" class="form-control border-secondary" value="${subcategoria?.nombre_subcat}" id="nombre_subcat" disabled>
          </div>
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Categoría</span>
            <input type="text" class="form-control border-secondary" value="${subcategoria?.categoria_id?.nombre_cat}" id="categoria" disabled>
          </div>
        `,
        confirmButtonText: `Continuar`,
        customClass: {
          confirmButton: 'btn btn-prim',
        },
      });
    } catch (error) {
      console.error('Error al obtener la subcategoría.', error);
      throw error;
    }
  }
  // Editar subcategoría
async actualizarSubcategoria(id_subcat: number) {
  try {
    const subcategoria = this.subcategorias.find((sub) => sub.id_subcat === id_subcat);

    if (!subcategoria) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No se encontró la subcategoría en la base de datos, intenta más tarde.',
        timer: 2000,
      });
      return;
    }

    Swal.fire({
      title: 'Editar subcategoría',
      html: `
        <div class="input-group mt-2 mb-3 center-content me-3">
          <span class="input-group-text border-secondary">Nombre de la subcategoría</span>
          <input type="text" class="form-control border-secondary" value="${subcategoria?.nombre_subcat}" id="nombre_subcat">
        </div>
        <div class="input-group mt-2 mb-3 center-content me-3">
          <span class="input-group-text border-secondary">Categoría</span>
          <input type="text" class="form-control border-secondary" value="${subcategoria?.categoria_id?.nombre_cat}" id="categoria" disabled>
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
        const nombre_subcategoria = (document.getElementById('nombre_subcat') as HTMLInputElement).value.trim();
        if (!nombre_subcategoria) {
          Swal.showValidationMessage('Por favor, complete todos los campos obligatorios.');
          return;
        }

        const body: SubcategoriasDTO = {
          nombre_subcat: nombre_subcategoria,
          categoria_id: subcategoria.categoria_id.id_cat,  // Mantiene la categoría original
        };

        return body;
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const formData: SubcategoriasDTO = result.value;
        const confirmacion = await Swal.fire({
          title: '¿Estás seguro de editar la subcategoría?',
          showDenyButton: true,
          confirmButtonText: 'Continuar',
          denyButtonText: 'Cancelar',
          customClass: {
            confirmButton: 'btn btn-terc',
            denyButton: 'btn btn-peligro',
          },
          icon: 'warning',
        });
        if (confirmacion.isConfirmed) {
          try {
            await this.subcatServices.editarSubcategoria(id_subcat, formData);  // Llama al servicio de edición
            Swal.close();
            this.subcategorias = await this.subcatServices.obtenerSubcategorias();
            this.adminComponente.subcategorias = this.subcategorias;
            Swal.fire({
              icon: 'success',
              title: 'Subcategoría actualizada',
              html: 'Subcategoría actualizada con éxito.',
              timer: 2000,
            });
          } catch (error) {
            Swal.close();
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo actualizar la subcategoría.',
            });
          }
        }
      }
    });
  } catch (error) {
    console.error('Error al actualizar la subcategoría.', error);
    throw error;
  }
}

// Eliminar subcategoría
async delSubcategoria(id_subcat: number) {
  try {
    const subcategoria = this.subcategorias.find((sub) => sub.id_subcat === id_subcat);

    if (!subcategoria) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No se encontró la subcategoría en la base de datos, intenta más tarde.',
        timer: 2000,
      });
      return;
    }

    Swal.fire({
      icon: 'warning',
      title: 'Eliminar subcategoría',
      text: '¿Está seguro de eliminar esta subcategoría?',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'btn btn-peligro',
        cancelButton: 'btn btn-terc',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await this.subcatServices.eliminarSubcategoria(id_subcat); // Llama al servicio para eliminar
          Swal.close();
          Swal.fire({
            icon: 'success',
            title: 'Subcategoría eliminada',
            text: 'Subcategoría eliminada con éxito.',
          });
          this.subcategorias = await this.subcatServices.obtenerSubcategorias();
          this.adminComponente.subcategorias = this.subcategorias;
        } catch (error) {
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar la subcategoría.',
          });
        }
      }
    });
  } catch (error) {
    console.error('Error al eliminar la subcategoría.', error);
    throw error;
  }
}

  async crearSubcategoria() {
    try {
      Swal.fire({
        title: 'Agregar subcategoría',
        html: `
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Nombre de la subcategoría</span>
            <input type="text" class="form-control border-secondary" id="nombre_subcategoria">
          </div>
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Selecciona una categoría</span>
            <select class="form-control" id="categoria_select">
              <option value="">Selecciona una categoría</option>
              ${this.categorias
                .map(
                  (cat) =>
                    `<option value="${cat.id_cat}">${cat.nombre_cat}</option>`
                )
                .join('')}
            </select>
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
          const nombre_subcategoria = (
            document.getElementById('nombre_subcategoria') as HTMLInputElement
          ).value.trim();
          const categoria_id = (
            document.getElementById('categoria_select') as HTMLSelectElement
          ).value;

          if (!nombre_subcategoria || !categoria_id) {
            Swal.showValidationMessage('Por favor, complete todos los campos.');
            return;
          }

          const body: SubcategoriasDTO = {
            nombre_subcat: nombre_subcategoria,
            categoria_id: parseInt(categoria_id, 10), // Asociando con la categoría
          };

          return body;
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          const formData: SubcategoriasDTO = result.value;
          const confirmacion = await Swal.fire({
            title: '¿Estás seguro de agregar la subcategoría?',
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
              await this.subcatServices.registrarSubcategoria(formData);
              Swal.close();
              this.subcategorias = await this.subcatServices.obtenerSubcategorias();
              this.adminComponente.subcategorias = this.subcategorias;
              Swal.fire({
                icon: 'success',
                title: 'Subcategoría registrada',
                html: 'Subcategoría registrada exitosamente',
                timer: 2000,
              });
            } catch (error) {
              Swal.close();
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo crear la subcategoría.',
              });
            }
          }
        }
      });
    } catch (error) {
      console.error('Error al crear la subcategoría.', error);
      throw error;
    }
  }
}
