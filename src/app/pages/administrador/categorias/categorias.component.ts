import { Component, Input } from '@angular/core';
import { CategoriasService } from '../../../services/categorias.service';
import { SubcategoriasService } from '../../../services/subcategorias.service'; // Servicio para subcategorías
import Swal from 'sweetalert2';
import { Categorias, Sub_categorias } from '../../../interfaces/types';
import { AdministradorComponent } from '../administrador.component';
import { CommonModule } from '@angular/common';
import {
  CategoriasDTO,
  LogsDto,
  SubcategoriasDTO,
} from '../../../interfaces/dtos';
import { switchMap } from 'rxjs';
import { environment } from '../../../../environment';
import { NgxPaginationModule } from 'ngx-pagination';
import { LogsService } from '../../../services/logs.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-crud-categorias',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './categorias.component.html',
  styleUrls: ['./categorias.component.css'],
})
export class CategoriasComponent {
  @Input() categorias: Categorias[] = [];
  @Input() subcategorias: Sub_categorias[] = []; // Subcategorías

  pageSize: number = 7;
  currentPageCat: number = 0;
  currentPageSubCat: number = 0;

  categoriasFiltradas: Categorias[] = [];
  subCategoriasFiltradas: Sub_categorias[] = [];
  selectedFile: File | null = null;
  formData: any = {};

  imgCatUrl: string = '';

  constructor(
    private readonly catServices: CategoriasService,
    private readonly subcatServices: SubcategoriasService, // Servicio para subcategorías
    private readonly logsServices: LogsService,
    private adminComponente: AdministradorComponent
  ) {}

  /**
   * Inicialización del componente
   * Carga las categorías y subcategorías desde el componente padre
   */
  async ngOnInit() {
    this.categorias = this.adminComponente.categorias;
    this.subcategorias = this.adminComponente.subcategorias;
    this.subCategoriasFiltradas = this.subcategorias;
    this.categoriasFiltradas = this.categorias;
  }
  /**
   * Paginación
   */
  async onPageChangeCat(page: number) {
    this.currentPageCat = page;
  }
  async onPageChangeSubCat(page: number) {
    this.currentPageSubCat = page;
  }
  /**
   * BUSCADORES
   */
  filtrarCategorias(event: any) {
    const valor = event.target.value.toLowerCase();
    this.categoriasFiltradas = this.categorias.filter((categoria) => {
      const nombre_cat = categoria.nombre_cat.toLowerCase() || '';
      return nombre_cat.includes(valor);
    });
  }
  filtrarSubCategorias(event: any) {
    const valor = event.target.value.toLowerCase();
    this.subCategoriasFiltradas = this.subcategorias.filter((subCategoria) => {
      const nombre_subCategoria =
        subCategoria.nombre_subcat.toLowerCase() || '';
      const nombre_cat =
        subCategoria.categoria_id.nombre_cat.toString().toLowerCase() || '';

      return nombre_subCategoria.includes(valor) || nombre_cat.includes(valor);
    });
  }

  /**
   *
   * CRUD Categorias
   *
   */
  async verCategoria(id_cat: number) {
    try {
      Swal.fire({
        title: 'Cargando...',
        html: 'Por favor, espere mientras se procesa la información.',
        allowOutsideClick: false, // Evita que se pueda cerrar
        allowEscapeKey: false, // Evita que se cierre con la tecla Escape
        allowEnterKey: false, // Evita que se cierre con Enter
      });
      const categoria = this.categorias.find((cat) => cat.id_cat === id_cat);
      this.imgCatUrl = environment.ApiUp + categoria?.ruta_img;
      console.log(this.imgCatUrl);

      if (!categoria) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se encontró la categoría en la base de datos, intenta más tarde.',
          timer: 2000,
        });
        return;
      }
      Swal.close();
      Swal.fire({
        title: 'Ver categoría',
        imageUrl: this.imgCatUrl,
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
  /**
   * Eliminar categoría
   * Elimina una categoría si no tiene subcategorías asociadas, mostrando confirmaciones y
   * mensajes de error según sea necesario.
   * Esta acción es llevada a cabo mediante la llamada API del servicio de categorías.
   * @param id_cat Id de la categoría a eliminar (viene de darle clic en el botón eliminar)
   * @returns Categoria Eliminada
   */
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

      if (
        this.subcategorias.find(
          (cat) => cat.categoria_id.id_cat === categoria.id_cat
        )
      ) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se puede eliminar la categoría si existen sub categorias relacionadas.',
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
            await this.catServices.delCategoria(id_cat); // Llama al servicio para eliminar
            const log: LogsDto = {
              usuario:
                localStorage.getItem('codigo') +
                ' ' +
                localStorage.getItem('nombres'),
              accion: 'Eliminar categoría',
              modulo: 'Categorías',
              descripcion: `Se eliminó la categoría ${categoria.nombre_cat}`,
            };
            await this.logsServices.crearLog(log);
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
  /**
   * Crear categoría
   * Muestra un formulario para crear una nueva categoría, maneja
   * la carga de imágenes y envía los datos al servicio de categorías.
   * Incluye validaciones y confirmaciones para asegurar que los datos sean correctos
   * antes de enviarlos.
   * @returns Nueva categoría creada Type Categorias
   */
  async crearCategoria() {
    try {

      /**
       * PANTALLA MODAL PARA CREAR CATEGORÍA
       */
      Swal.fire({
        title: 'Agregar categoría',
        html: `
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Nombre de la categoría</span>
            <input type="text" class="form-control border-secondary" id="nombre_categoria">
          </div>
          <div class="input-group mt-2 mb-3 center-content me-3">
            <input type="file" class="form-control border-secondary" id="ruta_img">
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
        /**
         * OBTENCIÓN DE DATOS DEL FORMULARIO INGRESADOS POR EL USUARIO
         * @returns
         */
        preConfirm: () => {
          const nombre_cat = (
            //En base al id del input obtiene el valor (como un html)
            document.getElementById('nombre_categoria') as HTMLInputElement
          ).value.trim();
          const fileInput = document.getElementById(
            'ruta_img'
          ) as HTMLInputElement;
          //Obtiene el archivo seleccionado en el input file
          const ruta_img: File | null =
            fileInput?.files && fileInput.files[0] ? fileInput.files[0] : null;
          //Variable auxiliar del archivo img seleccionado
          this.selectedFile =
            fileInput?.files && fileInput.files[0] ? fileInput.files[0] : null;

          if (!nombre_cat || !fileInput) {
            Swal.showValidationMessage(
              'Por favor, complete todos los campos obligatorios.'
            );
            return;
          }
          //Crea el cuerpo de la petición con los datos obtenidos
          //CategoriasDTO viene del archivo dtos.ts, es la estructura que se enviará al backend
          const body: CategoriasDTO = {
            nombre_cat: nombre_cat,
            ruta_img: ruta_img ? ruta_img.name : '',
          };
          this.formData = body;
          return body;
        },
      }).then(async (result) => {
        //Si la respuesta es confirmada (clic en el botón continuar)
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
              //Pantalla de carga
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
              if (this.selectedFile) {
                //Primero sube la imagen al servidor, este retorna la imagen subida.
                this.catServices
                  .subirImg(this.selectedFile)
                  .pipe(
                    switchMap((res) => {
                      //El servidor responde con la ruta de la imagen subida (debe cambiar el nombre para que no se repita la ruta)
                      console.log('Ruta de la imagen subida:', res.ruta_img);
                      this.formData.ruta_img =
                        '/categorias/' + String(res.ruta_img);
                      console.log(this.formData);
                      return this.catServices.crearCategoria(formData);
                    })
                  )
                  .subscribe({
                    next: async (response) => {
                      //Crea el log en la tabla logs
                      Swal.close();
                      const log: LogsDto = {
                        usuario:
                          localStorage.getItem('codigo') +
                          ' ' +
                          localStorage.getItem('nombres'),
                        accion: 'Crear categoría',
                        modulo: 'Categorías',
                        descripcion: `Se creó la categoría ${response.nombre_cat}`,
                      };
                      await this.logsServices.crearLog(log);
                      this.categorias = await this.catServices.getCategorias();
                      this.adminComponente.categorias = this.categorias;
                      Swal.fire({
                        icon: 'success',
                        title: 'Categoría registrada',
                        html: 'Categoría registrada exitosamente',
                        timer: 2000,
                      });
                    },
                    error: async (response) => {
                      Swal.close();
                      this.categorias = await this.catServices.getCategorias();
                      this.adminComponente.categorias = this.categorias;
                      Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        html: 'No se pudo registrar la categoría',
                        timer: 2000,
                      });
                    },
                  });
              }
            } catch (error) {
              Swal.close();
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo registrar la categoría.',
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
  /**
   * Actualizar categoría
   * Muestra un formulario para editar una categoría existente,
   * maneja la carga de imágenes y envía los datos actualizados al servicio de categorías.
   * @param id_cat Id de la categoría a editar
   * @returns
   */
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
      /**
       * PANTALLA MODAL PARA EDITAR CATEGORÍA
       */
      Swal.fire({
        title: 'Editar categoría',
        html: `
        <div class="input-group mt-2 mb-3 center-content me-3">
          <span class="input-group-text border-secondary">Nombre de la categoría</span>
          <input type="text" class="form-control border-secondary" value="${categoria?.nombre_cat}" id="nombre_cat">
        </div>
        <div class="input-group mt-2 mb-3 center-content me-3">
            <input type="file" class="form-control border-secondary" value="${categoria?.ruta_img}"id="ruta_img">
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
          /**
           * OBTENCIÓN DE DATOS DEL FORMULARIO INGRESADOS POR EL USUARIO
           */
          const nombre_cat = (
            document.getElementById('nombre_cat') as HTMLInputElement
          ).value.trim();
          const fileInput = document.getElementById(
            'ruta_img'
          ) as HTMLInputElement;
          //Obtiene el archivo seleccionado en el input file
          const ruta_img: File | null =
            fileInput?.files && fileInput.files[0] ? fileInput.files[0] : null;
          this.selectedFile =
            fileInput?.files && fileInput.files[0] ? fileInput.files[0] : null;

          if (!nombre_cat || !fileInput) {
            Swal.showValidationMessage(
              'Por favor, complete todos los campos obligatorios.'
            );
            return;
          }

          const body: CategoriasDTO = {
            nombre_cat: nombre_cat,
            ruta_img: ruta_img ? ruta_img.name : '',
          };
          this.formData = body;
          return body;
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
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
          //Si confirma la edición
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
              if (this.selectedFile) {
                //Primero sube la imagen al servidor, este retorna la imagen subida.
                this.catServices
                  .subirImg(this.selectedFile)
                  .pipe(
                    switchMap((res) => {
                      console.log('Ruta de la imagen subida:', res.ruta_img);
                      //El servidor responde con la ruta de la imagen subida (debe cambiar el nombre para que no se repita la ruta)
                      this.formData.ruta_img =
                        '/categorias/' + String(res.ruta_img);
                      console.log(this.formData);
                      return this.catServices.upCategoria(
                        id_cat,
                        this.formData
                      );
                    })
                  )
                  .subscribe({
                    //Categoria actualizada exitosamente
                    next: async (response) => {
                      Swal.close();
                      this.categorias = await this.catServices.getCategorias();
                      this.adminComponente.categorias = this.categorias;
                      Swal.fire({
                        icon: 'success',
                        title: 'Categoría actualizar',
                        html: 'Categoría actualizar exitosamente',
                        timer: 2000,
                      });
                    },
                    error: async (response) => {
                      Swal.close();
                      this.categorias = await this.catServices.getCategorias();
                      this.adminComponente.categorias = this.categorias;
                      Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        html: 'No se pudo actualizar la categoría',
                        timer: 2000,
                      });
                    },
                  });
              }
              Swal.close();
              //Creacion de Log
              const log: LogsDto = {
                usuario:
                  localStorage.getItem('codigo') +
                  ' ' +
                  localStorage.getItem('nombres'),
                accion: 'Editar categoría',
                modulo: 'Categorías',
                descripcion: `Se actualizó la categoría ${categoria.nombre_cat}`,
              };
              await this.logsServices.crearLog(log);
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

  /**
   * Retorna la subcategoría seleccionada en un modal
   * @param id_subcat SubCategoria seleccionada
   * @returns Subcategoría seleccionada
   */
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
        title: 'Cargando...',
        html: 'Por favor, espere mientras se procesa la información.',
        allowOutsideClick: false, // Evita que se pueda cerrar
        allowEscapeKey: false, // Evita que se cierre con la tecla Escape
        allowEnterKey: false, // Evita que se cierre con Enter
      });
      Swal.close();
      Swal.fire({
        title: 'Ver subcategoría',
        imageUrl: environment.ApiUp + subcategoria.ruta_img,
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
  /**
   * Se muestra un formulario para editar una subcategoría existente
   * @param id_subcat Subcategoria seleccionada
   * @returns Subcategoria actualizada 204
   */
  async actualizarSubcategoria(id_subcat: number) {
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
      /**
       * MODAL PARA EDITAR SUBCATEGORÍA
       */
      Swal.fire({
        title: 'Editar subcategoría',
        html: `
        <div class="input-group mt-2 mb-3 center-content me-3">
          <span class="input-group-text border-secondary">Nombre de la subcategoría</span>
          <input type="text" class="form-control border-secondary" value="${
            subcategoria?.nombre_subcat
          }" id="nombre_subcat">
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
        <div class="input-group mt-2 mb-3 center-content me-3">
            <input type="file" class="form-control border-secondary" value="${
              subcategoria?.ruta_img
            }"id="ruta_img">
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
        // Obtención de datos del formulario dados por el usuario
        preConfirm: () => {
          const nombre_subcat = (
            document.getElementById('nombre_subcat') as HTMLInputElement
          ).value.trim();
          const categoria_id = parseInt(
            (document.getElementById('categoria_select') as HTMLInputElement)
              .value
          );
          const fileInput = document.getElementById(
            'ruta_img'
          ) as HTMLInputElement;

          const ruta_img: File | null =
            fileInput?.files && fileInput.files[0] ? fileInput.files[0] : null;
          this.selectedFile =
            fileInput?.files && fileInput.files[0] ? fileInput.files[0] : null;

          if (!nombre_subcat || !categoria_id || !fileInput) {
            Swal.showValidationMessage(
              'Por favor, complete todos los campos obligatorios.'
            );
            return;
          }
          //Crea el cuerpo de la petición con los datos obtenidos
          const body: SubcategoriasDTO = {
            nombre_subcat: nombre_subcat,
            categoria_id: categoria_id,
            ruta_img: ruta_img ? ruta_img.name : '',
          };
          this.formData = body;
          return body;
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
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
          //Si confirma la edición
          if (confirmacion.isConfirmed) {
            try {
              //pantalla de carga
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
              if (this.selectedFile) {
                //Sube el archivo al servidor
                this.subcatServices
                  .subirImg(this.selectedFile)
                  .pipe(
                    //El Servidor retorna la ruta de la imagen
                    switchMap((res) => {
                      console.log('Ruta de la imagen subida:', res.ruta_img);
                      this.formData.ruta_img =
                        '/subcategorias/' + String(res.ruta_img);
                      console.log(this.formData);
                      //El registro es editado
                      return this.subcatServices.editarSubCategoria(
                        id_subcat,
                        this.formData
                      );
                    })
                  )
                  .subscribe({
                    next: async (response) => {
                      Swal.close();
                      //Crea el Logs de la actualizacion
                      this.subcategorias =
                        await this.subcatServices.obtenerSubcategorias();
                      const log: LogsDto = {
                        usuario:
                          localStorage.getItem('codigo') +
                          ' ' +
                          localStorage.getItem('nombres'),
                        accion: 'Editar subcategoría',
                        modulo: 'Categorías',
                        descripcion: `Se actualizó la subcategoría ${subcategoria.nombre_subcat}`,
                      };
                      //Subcategoria actualizada exitosamente
                      await this.logsServices.crearLog(log);
                      this.adminComponente.subcategorias = this.subcategorias;
                      Swal.fire({
                        icon: 'success',
                        title: 'Subcategoría actualizada',
                        html: 'Subategoría actualizar exitosamente',
                        timer: 2000,
                      });
                    },
                    error: async (response) => {
                      Swal.close();
                      this.subcategorias =
                        await this.subcatServices.obtenerSubcategorias();
                      this.adminComponente.subcategorias = this.subcategorias;
                      Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        html: 'No se pudo actualizar la subcategoría',
                        timer: 2000,
                      });
                    },
                  });
              }
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

  /**
   * Elimina una subcategoría existente por medio de su id y una llamada al servicio de subcategorías
   * @param id_subcat Id de la subcategoria a eliminar
   * @returns
   */
  async delSubcategoria(id_subcat: number) {
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
            await this.subcatServices.eliminarSubCategoria(id_subcat); // Llama al servicio para eliminar
            Swal.close();
            Swal.fire({
              icon: 'success',
              title: 'Subcategoría eliminada',
              text: 'Subcategoría eliminada con éxito.',
            });
            const log: LogsDto = {
              usuario:
                localStorage.getItem('codigo') +
                ' ' +
                localStorage.getItem('nombres'),
              accion: 'Eliminar subcategoría',
              modulo: 'Categorías',
              descripcion: `Se eliminó la subcategoría ${subcategoria.nombre_subcat}`,
            };
            this.subcategorias =
              await this.subcatServices.obtenerSubcategorias();
            this.adminComponente.subcategorias = this.subcategorias;

            await this.logsServices.crearLog(log);
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

  /**
   * Crear subcategoría
   * Muestra un formulario para crear una nueva subcategoría, maneja
   * la carga de imágenes y envía los datos al servicio de subcategorías.
   * Incluye validaciones y confirmaciones para asegurar que los datos sean correctos
   * antes de enviarlos.
   * @returns Nueva subcategoría creada Type Subcategorias
   */
  async crearSubcategoria() {
    try {
      /**
       * PANTALLA MODAL PARA CREAR SUBCATEGORÍA
       */
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
          <div class="input-group mt-2 mb-3 center-content me-3">
            <input type="file" class="form-control border-secondary" id="ruta_img">
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
        /**
         * OBTENCIÓN DE DATOS DEL FORMULARIO INGRESADOS POR EL USUARIO
         */
        preConfirm: () => {
          const nombre_subcategoria = (
            document.getElementById('nombre_subcategoria') as HTMLInputElement
          ).value.trim();
          //Categoria a la que pertenece la subcategoría
          const categoria_id = (
            document.getElementById('categoria_select') as HTMLSelectElement
          ).value;
          const fileInput = document.getElementById(
            'ruta_img'
          ) as HTMLInputElement;
          /**
           * Obtiene el archivo seleccionado en el input file
           */
          const ruta_img: File | null =
            fileInput?.files && fileInput.files[0] ? fileInput.files[0] : null;
          this.selectedFile =
            fileInput?.files && fileInput.files[0] ? fileInput.files[0] : null;
          if (!nombre_subcategoria || !categoria_id) {
            Swal.showValidationMessage('Por favor, complete todos los campos.');
            return;
          }
          //Crea el cuerpo de la petición con los datos obtenidos
          const body: SubcategoriasDTO = {
            nombre_subcat: nombre_subcategoria,
            categoria_id: parseInt(categoria_id, 10), // Asociando con la categoría
            ruta_img: ruta_img ? ruta_img.name : '',
          };
          this.formData = body;
          console.log(this.formData);
          return body;
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          //Si la respuesta es confirmada (clic en el botón continuar)
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
              //Pantalla de carga
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
              if (this.selectedFile) {
                //Primero sube la imagen al servidor, este retorna la imagen subida.
                this.subcatServices
                  .subirImg(this.selectedFile)
                  .pipe(
                    switchMap((res) => {
                      console.log('Ruta de la imagen subida:', res.ruta_img);
                      this.formData.ruta_img =
                        '/subcategorias/' + String(res.ruta_img);
                      console.log(this.formData);
                      return this.subcatServices.registrarSubCategoria(
                        this.formData
                      );
                    })
                  )
                  .subscribe({
                    next: async (response) => {
                      Swal.close();
                      this.subcategorias =
                        await this.subcatServices.obtenerSubcategorias();
                      const log: LogsDto = {
                        usuario:
                          localStorage.getItem('codigo') +
                          ' ' +
                          localStorage.getItem('nombres'),
                        accion: 'Crear subcategoría',
                        modulo: 'Categorías',
                        descripcion: `Se creó la subcategoría ${response.nombre_subcat}`,
                      };

                      //Subcategoria creada exitosamente
                      await this.logsServices.crearLog(log);
                      this.adminComponente.subcategorias = this.subcategorias;
                      Swal.fire({
                        icon: 'success',
                        title: 'Subcategoría creada',
                        html: 'Subategoría creada exitosamente',
                        timer: 2000,
                      });
                    },
                    error: async (response) => {
                      Swal.close();
                      this.subcategorias =
                        await this.subcatServices.obtenerSubcategorias();
                      this.adminComponente.subcategorias = this.subcategorias;
                      Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        html: 'No se pudo crear la subcategoría',
                        timer: 2000,
                      });
                    },
                  });
              }
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
