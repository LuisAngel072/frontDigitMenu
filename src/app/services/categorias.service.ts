/*import { Injectable } from '@angular/core';
import { Categorias, Sub_categorias } from '../types';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private categorias: Categorias[] = [
    { id_cat: 1, nombre_cat: 'Bebidas' },
    { id_cat: 2, nombre_cat: 'Comidas' }
  ];

  private subcategorias: Sub_categorias[] = [
    { id_subcat: 1, nombre_subcat: 'Refrescos', categoria_id: { id_cat: 1, nombre_cat: 'Bebidas' } },
    { id_subcat: 2, nombre_subcat: 'Jugos', categoria_id: { id_cat: 1, nombre_cat: 'Bebidas' } }
  ];

  constructor() {}

  // Obtener todas las categorías
  obtenerCategorias(): Categorias[] {
    return this.categorias;
  }

  // Obtener todas las subcategorías
  obtenerSubcategorias(): Sub_categorias[] {
    return this.subcategorias;
  }

  // Agregar una nueva categoría
  agregarCategoria(nuevaCategoria: Categorias): void {
    this.categorias.push(nuevaCategoria);
  }

  // Agregar una nueva subcategoría
  agregarSubcategoria(nuevaSubcategoria: Sub_categorias): void {
    this.subcategorias.push(nuevaSubcategoria);
  }

  // Editar una categoría existente
  editarCategoria(id: number, nuevoNombre: string): void {
    const categoria = this.categorias.find(cat => cat.id_cat === id);
    if (categoria) {
      categoria.nombre_cat = nuevoNombre;
    }
  }
}
*/