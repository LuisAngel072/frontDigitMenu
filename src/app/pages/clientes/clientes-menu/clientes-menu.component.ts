import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-clientes-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clientes-menu.component.html',
  styleUrl: './clientes-menu.component.css'
})
export class ClientesMenuComponent implements OnInit {
  mesaId: string | null = null;
  categorias: any[] = [];

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mesaId = params['mesa'];
    });

    this.cargarCategoriasYSubcategorias();
  }

  cargarCategoriasYSubcategorias(): void {
    const cat$ = this.http.get<any[]>(`${environment.ApiIP}categorias`);
    const subcat$ = this.http.get<any[]>(`${environment.ApiIP}sub-categorias`);
    const prod$ = this.http.get<any[]>(`${environment.ApiIP}productos`);
  
    cat$.subscribe(categorias => {
      subcat$.subscribe(subcategorias => {
        prod$.subscribe(productos => {
          // Asignamos productos a cada subcategoría
          const subcategoriasConProductos = subcategorias.map(sub => {
            const productosFiltrados = productos.filter(
              prod => prod.sub_cat_id?.id_subcat === sub.id_subcat
            );
            return { ...sub, productos: productosFiltrados };
          });
  
          // Asignamos subcategorías a cada categoría
          this.categorias = categorias.map(cat => {
            const subcatFiltradas = subcategoriasConProductos.filter(
              sub => sub.categoria_id?.id_cat === cat.id_cat
            );
            return { ...cat, subcategorias: subcatFiltradas };
          });
        });
      });
    });
  }
  

  showProduct(name: string) {
    Swal.fire({
      title: 'Seleccionado',
      text: `Has seleccionado: ${name}`,
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }
}
