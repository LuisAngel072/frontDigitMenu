import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../../services/productos.service'; // ajusta ruta según estructura
import { PedidosService } from '../../../services/pedidos.service';

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
  ingredientes: any[] = [];
  searchTerm: string = '';
  categoriasOriginales: any[] = []; // Nuevo arreglo para no perder datos originales

  constructor(  
    private route: ActivatedRoute,
    private http: HttpClient,
    private productosService: ProductosService,
    private pedidosService: PedidosService  // Asegúrate de inyectar el servicio
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
  this.ingredientes = [];

  try {
    const [opciones, extras, ingRaw] = await Promise.all([
      this.productosService.obtenerOpcionesDeProducto(prod.id_prod),
      this.productosService.obtenerExtrasDeProducto(prod.id_prod),
      this.http.get<any[]>(`${environment.ApiIP}productos/ingredientes/${prod.id_prod}`).toPromise()
    ]);

    this.opciones = opciones;
    this.extras = extras;

    // ✅ Solo asignamos si hay ingredientes
    this.ingredientes = Array.isArray(ingRaw)
      ? ingRaw.map(item => item.ingrediente_id)
      : [];

    setTimeout(() => {
      const modal = new (window as any).bootstrap.Modal(
        document.getElementById('productModal')
      );
      modal.show();
    });

  } catch (error) {
    console.error('Error cargando producto:', error);
    this.ingredientes = []; // fallback defensivo
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
  
  async agregarACuenta() {
    try {
      // Mostrar indicador de carga
      Swal.fire({
        title: 'Procesando pedido...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Usar el nuevo método del servicio que maneja todo el flujo
      await this.pedidosService.agregarProductoCompleto(
        parseInt(this.mesaId!),
        this.selectedProduct,
        this.selectedOpcion,
        this.selectedExtras,
        this.ingredientes,
        this.precioTotal
      ).toPromise();

      // Cerrar la alerta de carga
      Swal.close();

      // Mostrar éxito
      Swal.fire('¡Agregado!', 'Producto agregado al pedido', 'success');

      // Cerrar modal
      const modalEl = document.getElementById('productModal');
      const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
      modal.hide();

    } catch (error) {
      console.error('Error al agregar producto al pedido:', error);
      Swal.close();
      Swal.fire('Error', 'No se pudo agregar el producto', 'error');
    }
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
        this.categoriasOriginales = JSON.parse(JSON.stringify(this.categorias)); // Clon profundo
        });
      });
    });
  }

  filtrarProductos() {
    const filtro = this.searchTerm.trim().toLowerCase();

    if (!filtro) {
      this.categorias = JSON.parse(JSON.stringify(this.categoriasOriginales));
      return;
    }

    const resultado = this.categoriasOriginales
      .map(cat => {
        const subcategorias = cat.subcategorias
          .map((sub: { productos: any[]; }) => {
            const productos = sub.productos.filter((prod: { nombre_prod: string; }) =>
              prod.nombre_prod.toLowerCase().includes(filtro)
            );
            return productos.length ? { ...sub, productos } : null;
          })
          .filter((sub: null) => sub !== null);

        return subcategorias.length ? { ...cat, subcategorias } : null;
      })
      .filter(cat => cat !== null);

    this.categorias = resultado;

    // Expandir automáticamente las coincidencias en el DOM
    setTimeout(() => {
      this.expandirCoincidencias();
    }, 0);
  }

  expandirCoincidencias() {
    this.categorias.forEach((cat, i) => {
      const collapseCat = document.getElementById(`collapse${i}`);
      const buttonCat = document.querySelector(`[data-bs-target="#collapse${i}"]`);
      if (collapseCat && buttonCat) {
        const bsCollapse = new (window as any).bootstrap.Collapse(collapseCat, {
          toggle: false,
        });
        bsCollapse.show();
      }

      cat.subcategorias.forEach((sub: { id_subcat: any; }) => {
        const subEl = document.getElementById(`subcat-${sub.id_subcat}`);
        const buttonSub = document.querySelector(
          `[data-bs-target="#subcat-${sub.id_subcat}"]`
        );
        if (subEl && buttonSub) {
          const bsCollapse = new (window as any).bootstrap.Collapse(subEl, {
            toggle: false,
          });
          bsCollapse.show();
        }
      });
    });
  }
}