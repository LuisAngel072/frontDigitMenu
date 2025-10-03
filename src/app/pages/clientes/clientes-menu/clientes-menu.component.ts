import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../../services/productos.service';
import { PedidosService } from '../../../services/pedidos.service';
import { EstadoPedidoHasProductos, Producto_extras_ingrSel } from '../../../types';
import { NotificacionesService } from '../../../services/notificaciones.service';

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
  categoriasOriginales: any[] = [];

  // Nuevas propiedades para el carrito
  pedidoActual: any = null;
  productosEnPedido: Producto_extras_ingrSel[] = [];
  totalCarrito: number = 0;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private productosService: ProductosService,
    private pedidosService: PedidosService,
    private notificacionesService: NotificacionesService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mesaId = params['mesa'];
      if (this.mesaId) {
        // Cargar el pedido activo de la mesa cuando tengamos el id
        this.cargarPedidoMesa();
      }
    });

    this.cargarCategoriasYSubcategorias();
  }

  // Carga los productos del pedido actual de forma similar a cómo lo hace el componente Cocinero
  cargarPedidoMesa(): void {
    if (!this.mesaId) return;

    this.pedidosService.getPedidosConProductosDetalles().subscribe({
      next: (data) => {
        const normalizado = data.map(p => ({
          ...p,
          extras: p.extras ?? [],
          ingredientes: p.ingredientes ?? []
        }));

        const productosDeMiMesa = normalizado.filter(detalle => {
          const noMesa = detalle.pedido_id?.no_mesa?.no_mesa;
          return noMesa === parseInt(this.mesaId!);
        });

        if (productosDeMiMesa.length > 0) {
          this.pedidoActual = productosDeMiMesa[0].pedido_id;
          this.productosEnPedido = productosDeMiMesa;
          this.calcularTotalCarrito();
        } else {
          this.pedidoActual = null;
          this.productosEnPedido = [];
          this.totalCarrito = 0;
        }
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }

  // Calcula el total del carrito sumando los precios de todos los productos
  calcularTotalCarrito(): void {
    this.totalCarrito = this.productosEnPedido.reduce((total, producto) => {
      // Asegurarse de que todos los valores sean numéricos usando el operador +
      let precio = +producto.precio || 0;

      // Suma los precios de extras si los hay
      if (producto.extras && producto.extras.length > 0) {
        const extrasTotal = producto.extras.reduce((sum, extra) => {
          // Convertir a número con el operador + y asegurar que sea un número válido
          const extraPrecio = +(extra.precio || 0);
          return sum + extraPrecio;
        }, 0);
        precio += extrasTotal;
      }

      // Suma los precios de ingredientes adicionales si los hay
      if (producto.ingredientes && producto.ingredientes.length > 0) {
        const ingTotal = producto.ingredientes.reduce((sum, ing) => {
          // Convertir a número con el operador + y asegurar que sea un número válido
          const ingPrecio = +(ing.precio || 0);
          return sum + ingPrecio;
        }, 0);
        precio += ingTotal;
      }

      // Verificar que el resultado sea un número válido
      return total + (isNaN(precio) ? 0 : precio);
    }, 0);

    // Verificar que el resultado final sea un número válido
    if (isNaN(this.totalCarrito)) {
      console.error('Error: El total calculado no es un número válido', this.productosEnPedido);
      this.totalCarrito = 0;
    } else {
      // Redondear a dos decimales para evitar problemas de precisión con números flotantes
      this.totalCarrito = Math.round(this.totalCarrito * 100) / 100;
    }

    console.log('Total calculado:', this.totalCarrito);
  }

  // Método para mostrar el modal del carrito
  mostrarCarrito(): void {
    // Aseguramos que tenemos los datos más recientes
    this.cargarPedidoMesa();

    setTimeout(() => {
      const modal = new (window as any).bootstrap.Modal(
        document.getElementById('carritoModal')
      );
      modal.show();
    });
  }

  // Método para eliminar un producto del carrito
  async eliminarProducto(producto: Producto_extras_ingrSel): Promise<void> {
    try {
      const { isConfirmed } = await Swal.fire({
        title: '¿Eliminar producto?',
        text: '¿Estás seguro de que deseas eliminar este producto del pedido?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (!isConfirmed) return;

      // Aquí debería ir la lógica para eliminar el producto del pedido en el backend
      // Por ejemplo:
      // await this.pedidosService.eliminarProductoDePedido(producto.id);

      // Recargamos los productos después de eliminar
      this.cargarPedidoMesa();

      Swal.fire(
        '¡Eliminado!',
        'El producto ha sido eliminado del pedido.',
        'success'
      );
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
    }
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

      // Recargar productos del carrito
      this.cargarPedidoMesa();

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

  async llamarMesero() {
  try {
    // Mostrar loading mientras se procesa
    Swal.fire({
      title: 'Llamando al mesero...',
      text: 'Enviando notificación',
      icon: 'info',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const notif = await this.notificacionesService.crearNotificacion(
      "El cliente solicita atención",
      Number(this.mesaId)
    );

    console.log("Notificación enviada:", notif);

    // Success alert
    Swal.fire({
      title: '¡Mesero llamado!',
      text: 'Tu solicitud ha sido enviada. El mesero llegará en breve.',
      icon: 'success',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#28a745',
      timer: 3000,
      timerProgressBar: true,
      showClass: {
        popup: 'animate__animated animate__fadeInUp'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutDown'
      }
    });

  } catch (error) {
    console.error('Error al llamar mesero:', error);
    
    // Error alert
    Swal.fire({
      title: 'Error',
      text: 'No se pudo enviar la notificación. Intenta nuevamente.',
      icon: 'error',
      confirmButtonText: 'Intentar de nuevo',
      confirmButtonColor: '#dc3545',
      showClass: {
        popup: 'animate__animated animate__shakeX'
      }
    });
  }
}
}