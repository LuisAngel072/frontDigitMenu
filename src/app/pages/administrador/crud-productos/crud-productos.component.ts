import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, PercentPipe } from '@angular/common';
import Swal from 'sweetalert2';
import {
  Extras,
  Ingredientes,
  P_H_E,
  P_H_I,
  P_H_O,
  Productos,
} from '../../../types';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { CustomPaginatorIntl } from '../../../../matPaginator';
import { AdministradorComponent } from '../administrador.component';
import { environment } from '../../../../environment';
import { ProductosService } from '../../../services/productos.service';
@Component({
    selector: 'app-crud-productos',
    standalone: true,
    imports: [CommonModule, MatPaginator],
    templateUrl: './crud-productos.component.html',
    styleUrl: './crud-productos.component.css'
})
export class CrudProductosComponent {
  @Output() cambiarComponente = new EventEmitter<string>();
  pageSize: number = 7;
  currentPage: number = 0;

  @Input() productos: Productos[] = [];
  productosFiltrados: Productos[] = [];

  constructor(
    private readonly adminComponente: AdministradorComponent,
    private readonly productosService: ProductosService
  ) {
    this.productos = adminComponente.productos;
    console.log(this.productos);
  }

  async ngOnInit() {
    this.productosFiltrados = this.productos;
  }

  agregarProductosBoton() {
    this.cambiarComponente.emit('seccion7'); // Emite el nombre del componente que se debe mostrar
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateProductosFiltrados();
  }

  /**
   * Permite paginar los productos
   */
  updateProductosFiltrados() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.productosFiltrados = this.productos.slice(startIndex, endIndex);
  }

  async verProducto(id_producto: number) {
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
      const producto = this.productos.find(
        (producto) => producto.id_prod === id_producto
      );
      const extrasP: P_H_E[] =
        await this.productosService.obtenerExtrasDeProducto(id_producto);
      const ingredientesP: P_H_I[] =
        await this.productosService.obtenerIngredientesDeProducto(id_producto);
      const opcionesP: P_H_O[] =
        await this.productosService.obtenerOpcionesDeProducto(id_producto);

      const extrasRows = extrasP
        .map((extra) => {
          return `
        <tr>
          <td>${extra.extra_id.nombre_extra}</td>
          <td>${extra.extra_id.precio}</td>
        </tr>
        `;
        })
        .join('');

      const ingrsRows = ingredientesP
        .map((ingrediente) => {
          return `
          <tr>
            <td>${ingrediente.ingrediente_id.nombre_ingrediente}</td>
            <td>${ingrediente.ingrediente_id.precio}</td>
          </tr>
          `;
        })
        .join('');

      const opcsRows = opcionesP
        .map((opc) => {
          return `
          <tr>
            <td>${opc.opcion_id.nombre_opcion}</td>
            <td>${opc.opcion_id.porcentaje}</td>
          </tr>
          `;
        })
        .join('');
      Swal.close();
      const imagen = environment.ApiUp + producto?.img_prod;
      Swal.fire({
        title: `${producto?.nombre_prod}`,
        imageUrl: imagen,
        html: `

        <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Nombre del producto</span>
            <input type="text" class="form-control border-secondary" value="${producto?.nombre_prod}" id="nombre_prod" disabled>
        </div>
        <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Descripción</span>
            <textarea type="text" class="form-control border-secondary" id="descripcion" disabled>${producto?.descripcion}</textarea>
        </div>
        <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Categoría</span>
            <input type="text" class="form-control border-secondary" value="${producto?.sub_cat_id.categoria_id.nombre_cat}" id="categoria" disabled>
        </div>
        <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Subcategoría</span>
            <input type="text" class="form-control border-secondary" value="${producto?.sub_cat_id.nombre_subcat}" id="subcategoria" disabled>
        </div>
        <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Precio</span>
            <input type="text" class="form-control border-secondary" value="${producto?.precio}" id="precio" disabled>
        </div>
        <div class='text-center'>
          <h4>Extras</h4>
          <table class='table table_stripped'>
            <thead>
              <tr>
                <th>Extra</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              ${extrasRows}
            </tbody>
          </table>
        </div>
        <div class='text-center'>
          <h4>Opciones</h4>
          <table class='table table_stripped'>
            <thead>
              <tr>
                <th>Opción</th>
                <th>Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              ${opcsRows}
            </tbody>
          </table>
        </div>
        <div class='text-center'>
          <h4>Ingredientes</h4>
          <table class='table table_stripped'>
            <thead>
              <tr>
                <th>Ingrediente</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              ${ingrsRows}
            </tbody>
          </table>
        </div>
        `,
        confirmButtonText: 'Continuar',
        customClass: {
          confirmButton: 'btn btn-prim',
        },
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al intentar visualizar el producto',
        timer: 2500,
      });
    }
  }
}
