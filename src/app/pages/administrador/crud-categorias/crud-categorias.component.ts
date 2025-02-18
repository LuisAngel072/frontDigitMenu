/*import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AdministradorComponent } from '../administrador.component';
import { Categorias, Sub_categorias } from '../../../types';
import { CategoriasService } from '../../../services/categorias.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-categorias.component.html',
  styleUrl: './crud-categorias.component.css',
})

export class CategoriasComponent {
  @Input() categorias: Categorias[] = [];
  @Input() subcategorias: Sub_categorias[] = [];
  searchCategoria: string = '';
  searchSubcategoria: string = '';

  constructor(
    private categoriasService: CategoriasService
  ) {}
  
  async ngOnInit() {
    this.categorias = this.categoriasService.obtenerCategorias();
    this.subcategorias = this.categoriasService.obtenerSubcategorias();
  }
  

  get categoriasFiltradas() {
    return this.categorias.filter(categoria =>
      categoria.nombre_cat.toLowerCase().includes(this.searchCategoria.toLowerCase())
    );
  }

  get subcategoriasFiltradas() {
    return this.subcategorias.filter(subcategoria =>
      subcategoria.nombre_subcat.toLowerCase().includes(this.searchSubcategoria.toLowerCase())
    );
  }

  agregarCategoria() {
    Swal.fire({
      title: 'Agregar Nueva Categoría',
      input: 'text',
      inputPlaceholder: 'Nombre de la categoría',
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      preConfirm: (nombre) => {
        if (!nombre) {
          Swal.showValidationMessage('El nombre no puede estar vacío');
        }
        return { nombre_cat: nombre };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.categoriasService.agregarCategoria(result.value);
        this.categorias = await this.categoriasService.obtenerCategorias();
        Swal.fire('¡Categoría agregada!', '', 'success');
      }
    });
  }

  agregarCategoria() {
    Swal.fire({
      title: 'Agregar Nueva Categoría',
      input: 'text',
      inputPlaceholder: 'Nombre de la categoría',
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      preConfirm: (nombre) => {
        if (!nombre) {
          Swal.showValidationMessage('El nombre no puede estar vacío');
        }
        return { id_cat: this.categorias.length + 1, nombre_cat: nombre };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoriasService.agregarCategoria(result.value);
        this.categorias = this.categoriasService.obtenerCategorias();
        Swal.fire('¡Categoría agregada!', '', 'success');
      }
    });
  }
  

  editarCategoria(categoria: Categorias) {
    Swal.fire({
      title: 'Editar Categoría',
      input: 'text',
      inputValue: categoria.nombre_cat,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      preConfirm: (nuevoNombre) => {
        if (!nuevoNombre) {
          Swal.showValidationMessage('El nombre no puede estar vacío');
        }
        return { id_cat: categoria.id_cat, nombre_cat: nuevoNombre };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.categoriasService.editarCategoria(result.value);
        this.categorias = await this.categoriasService.obtenerCategorias();
        Swal.fire('¡Categoría actualizada!', '', 'success');
      }
    });
  }

  eliminarCategoria(id: number) {
    Swal.fire({
      title: '¿Eliminar categoría?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.categoriasService.eliminarCategoria(id);
        this.categorias = await this.categoriasService.obtenerCategorias();
        Swal.fire('¡Categoría eliminada!', '', 'success');
      }
    });
  }
}
*/
import { Component } from '@angular/core';

@Component({
  selector: 'app-categorias',
  standalone: true,
  templateUrl: './crud-categorias.component.html',
  styleUrls: ['./crud-categorias.component.css']
})
export class CategoriasComponent {
  // TODO: Componente vacío para probar solo diseño
}
