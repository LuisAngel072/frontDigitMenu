import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../../services/productos.service'; // ajusta ruta según estructura

@Component({
  selector: 'app-clientes-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes-menu.component.html',
  styleUrl: './clientes-menu.component.css'
})
export class ClientesMenuComponent implements OnInit {
  mesaId: string | null = null;
  categorias: any[] = [];
  baseUrl = environment.ApiUp;
  selectedProduct: any = null;
  opciones: any[] = [];
  extras: any[] = [];
  selectedOpcion: any = null;
  selectedExtras: any[] = [];
  precioTotal: number = 0;

  constructor(  
    private route: ActivatedRoute,
    private http: HttpClient,
    private productosService: ProductosService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mesaId = params['mesa'];
    });

    this.cargarCategoriasYSubcategorias();
  }

  async showProduct(prod: any) {
    this.selectedProduct = prod;
    this.selectedExtras = [];
    this.selectedOpcion = null;
    this.precioTotal = parseFloat(prod.precio);
  
    try {
      const [opciones, extras] = await Promise.all([
        this.productosService.obtenerOpcionesDeProducto(prod.id_prod),
        this.productosService.obtenerExtrasDeProducto(prod.id_prod)
      ]);
  
      this.opciones = opciones;
      this.extras = extras;
  
      setTimeout(() => {
        const modal = new (window as any).bootstrap.Modal(
          document.getElementById('productModal')
        );
        modal.show();
      });
  
    } catch (error) {
      console.error('Error cargando producto:', error);
    }
  }
  
  toggleExtra(extra: any) {
    const index = this.selectedExtras.indexOf(extra);
    if (index >= 0) {
      this.selectedExtras.splice(index, 1);
    } else {
      this.selectedExtras.push(extra);
    }
    this.calcularPrecio();
  }
  
  calcularPrecio() {
    let base = parseFloat(this.selectedProduct.precio);
    if (this.selectedOpcion) base += parseFloat(this.selectedOpcion.precio);
    for (let extra of this.selectedExtras) {
      base += parseFloat(extra.precio);
    }
    this.precioTotal = base;
  }
  
  agregarACuenta() {
    const payload = {
      productoId: this.selectedProduct.id_prod,
      opcionId: this.selectedOpcion?.opcion_id?.id_opcion,
      extras: this.selectedExtras.map(e => e.extra_id.id_extra),
      precio: this.precioTotal,
      mesa: this.mesaId
    };
  
    this.http.post('http://localhost:3000/api/cuenta', payload).subscribe(() => {
      Swal.fire('Agregado', 'Producto agregado a la cuenta', 'success');
      const modalEl = document.getElementById('productModal');
      const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
      modal.hide();
    });
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
  

 
}
