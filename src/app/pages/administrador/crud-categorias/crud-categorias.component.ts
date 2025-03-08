import { Component, OnInit } from '@angular/core';
import { CategoriaService } from 'src/app/services/categoria.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categorias',
  templateUrl: './crud-categorias.component.html',
  styleUrls: ['./crud-categorias.component.css'],
})
export class CategoriasComponent implements OnInit {
  categorias: any[] = [];
  searchCategoria: string = '';

  constructor(private categoriaService: CategoriaService) {}

  ngOnInit(): void {
    this.obtenerCategorias();
  }

  obtenerCategorias() {
    this.categoriaService.obtenerCategorias().subscribe(
      (data) => {
        this.categorias = data;
      },
      (error) => {
        console.error('Error al obtener categorías', error);
      }
    );
  }

  agregarCategoria() {
    Swal.fire({
      title: 'Agregar Nueva Categoría',
      input: 'text',
      inputPlaceholder: 'Nombre de la categoría',
      showCancelButton: true,
      confirmButtonText: 'Agregar',
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.categoriaService.registrarCategoria({ nombre_cat: result.value }).subscribe(() => {
          this.obtenerCategorias();
          Swal.fire('¡Categoría agregada!', '', 'success');
        });
      }
    });
  }

  editarCategoria(categoria: any) {
    Swal.fire({
      title: 'Editar Categoría',
      input: 'text',
      inputValue: categoria.nombre_cat,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.categoriaService.editarCategoria(categoria.id_cat, { nombre_cat: result.value }).subscribe(() => {
          this.obtenerCategorias();
          Swal.fire('¡Categoría actualizada!', '', 'success');
        });
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoriaService.eliminarCategoria(id).subscribe(() => {
          this.obtenerCategorias();
          Swal.fire('¡Categoría eliminada!', '', 'success');
        });
      }
    });
  }
