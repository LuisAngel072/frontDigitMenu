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
  ingredientes: any[] = [];

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

      // 1. Obtener todos los pedidos existentes
      const pedidos: any[] = await this.http.get<any[]>(`${environment.ApiIP}pedidos`).toPromise() ?? [];

      // 2. Buscar si hay uno activo para esta mesa
      const pedidoExistente = pedidos.find(p =>
        p.no_mesa?.no_mesa === parseInt(this.mesaId!) &&
        p.estado === 'Iniciado'
      );

      let idPedido: number;

      if (pedidoExistente) {
        idPedido = pedidoExistente.id_pedido;
      } else {
        // 3. Crear nuevo pedido
        await this.http.post<any>(
          `${environment.ApiIP}pedidos/registrar`,
          { no_mesa: parseInt(this.mesaId!) }
        ).toPromise();

        // 4. Obtener el nuevo pedido creado
        const pedidosActualizados: any[] = await this.http.get<any[]>(`${environment.ApiIP}pedidos`).toPromise() ?? [];
        const ultimoPedido = pedidosActualizados
          .filter(p => p.no_mesa?.no_mesa === parseInt(this.mesaId!))
          .sort((a, b) => b.id_pedido - a.id_pedido)[0];

        idPedido = ultimoPedido.id_pedido;
      }

      // 5. Preparar el cuerpo para registrar el producto
      const payloadProducto = {
        pedido_id: idPedido,
        producto_id: this.selectedProduct.id_prod,
        opcion_id: this.selectedOpcion?.opcion_id?.id_opcion ?? null,
        precio: this.precioTotal,
        extras: this.selectedExtras.map(e => e.extra_id.id_extra),
        ingr: this.ingredientes.map(i => i.id_ingr)
      };

      // 6. Registrar el producto al pedido
      await this.http.post(`${environment.ApiIP}pedidos/registrar/productos`, payloadProducto).toPromise();

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
      Swal.close(); // Asegúrate de cerrar cualquier loading
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
        });
      });
    });
  }
  

 
}
