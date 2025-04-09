import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Extras, Ingredientes, Opciones } from '../../../../types';
import { AdministradorComponent } from '../../administrador.component';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-crud-agregar-productos',
  standalone: true,
  imports: [CommonModule, MatPaginator],
  templateUrl: './crud-agregar-productos.component.html',
  styleUrl: './crud-agregar-productos.component.css',
})
export class CrudAgregarProductosComponent {
  @Input() ingredientes: Ingredientes[] = [];
  @Input() extras: Extras[] = [];
  @Input() opciones: Opciones[] = [];

  ingredientesFiltrados: Ingredientes[] = [];
  extrasFiltrados: Extras[] = [];
  opcionesFiltradas: Opciones[] = [];

  currentPageIngr: number = 0;
  pageSizeIngr: number = 6;

  currentPageExt: number = 0;
  pageSizeExt: number = 6;

  currentPageOpc: number = 0;
  pageSizeOpc: number = 6;
  constructor(
    private readonly administradorComponent: AdministradorComponent
  ) {}

  async ngOnInit() {
    this.ingredientes = this.administradorComponent.ingredientes;
    this.extras = this.administradorComponent.extras;
    this.opciones = this.administradorComponent.opciones;

    await this.updateIngredientesFiltrados();
    await this.updateExtrasFiltrados();
    await this.updateOpcionesFiltradas();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ingredientesFiltrados'] && this.ingredientes) {
      this.updateIngredientesFiltrados();
    }
    if (changes['opcionesFiltradas'] && this.opciones) {
      this.updateIngredientesFiltrados();
    }
    if (changes['extrasFiltrados'] && this.extras) {
      this.updateIngredientesFiltrados();
    }
  }

  onPageChangeIngr(event: PageEvent) {
    this.currentPageIngr = event.pageIndex;
    this.pageSizeIngr = event.pageSize;
    this.updateIngredientesFiltrados();
  }

  onPageChangeOpc(event: PageEvent) {
    this.currentPageOpc = event.pageIndex;
    this.pageSizeOpc = event.pageSize;
    this.updateOpcionesFiltradas();
  }

  onPageChangeExt(event: PageEvent) {
    this.currentPageExt = event.pageIndex;
    this.pageSizeExt = event.pageSize;
    this.updateExtrasFiltrados();
  }
  /**
   * Permite paginar los ingredientes
   */
  updateIngredientesFiltrados() {
    const startIndex = this.currentPageIngr * this.pageSizeIngr;
    const endIndex = startIndex + this.pageSizeIngr;
    this.ingredientesFiltrados = this.ingredientes.slice(startIndex, endIndex);
  }
  /**
   * Permite paginar las opciones
   */
  updateOpcionesFiltradas() {
    const startIndex = this.currentPageOpc * this.pageSizeOpc;
    const endIndex = startIndex + this.pageSizeOpc;
    this.opcionesFiltradas = this.opciones.slice(startIndex, endIndex);
  }
  /**
   * Permite paginar los extras
   */
  updateExtrasFiltrados() {
    const startIndex = this.currentPageExt * this.pageSizeExt;
    const endIndex = startIndex + this.pageSizeExt;
    this.extrasFiltrados = this.extras.slice(startIndex, endIndex);
  }

  /**
   * BUSCADORES
   */
  filtrarIngredientes(event: any) {
    const valor = event.target.lowerCase();
    this.ingredientesFiltrados = this.ingredientes.filter((ingrediente) => {
      const nombre_ingr = ingrediente.nombre_ingrediente.toLowerCase() || '';
      const precio = ingrediente.precio.toString().toLowerCase() || '';

      return nombre_ingr.includes(valor) || precio.includes(valor);
    });
  }
  filtrarOpciones(event: any) {
    const valor = event.target.lowerCase();
    this.opcionesFiltradas = this.opciones.filter((opcion) => {
      const nombre_opcion = opcion.nombre_opcion.toLowerCase() || '';
      const porcentaje = opcion.porcentaje.toString().toLowerCase() || '';

      return nombre_opcion.includes(valor) || porcentaje.includes(valor);
    });
  }
  filtrarExtras(event: any) {
    const valor = event.target.lowerCase();
    this.extrasFiltrados = this.extras.filter((extra) => {
      const nombre_extra = extra.nombre_extra.toLowerCase() || '';
      const precio = extra.precio.toString().toLowerCase() || '';

      return nombre_extra.includes(valor) || precio.includes(valor);
    });
  }

  mostrarAlerta(event: Event) {
    event.preventDefault(); // Evita la recarga del formulario

    // Capturar los valores del formulario
    const nombreProducto = (
      document.querySelector('input[type="text"]') as HTMLInputElement
    ).value.trim();
    const subcategoria = (
      document.querySelector('.form-select') as HTMLSelectElement
    ).value;
    const opcion = (
      document.querySelectorAll('.form-select')[1] as HTMLSelectElement
    ).value;
    const ingredientes = Array.from(
      document.querySelectorAll('input[type="checkbox"]:checked')
    ).map((input) => (input as HTMLInputElement).value);

    // Validar que los campos obligatorios estén completos
    if (!nombreProducto) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, ingrese el nombre del producto.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (subcategoria === 'Seleccione una subcategoría') {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, seleccione una subcategoría.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (opcion === 'Seleccione una opción') {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, seleccione una opción.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (ingredientes.length === 0) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, seleccione al menos un ingrediente.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Si todos los campos son válidos, mostrar mensaje de éxito
    Swal.fire({
      title: '¡Producto Agregado!',
      text: 'El producto ha sido creado correctamente.',
      icon: 'success',
      confirmButtonText: 'OK',
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      console.log('Imagen seleccionada:', file.name);
      // Aquí puedes procesar la imagen, subirla a un servidor, etc.
    }
  }
}
