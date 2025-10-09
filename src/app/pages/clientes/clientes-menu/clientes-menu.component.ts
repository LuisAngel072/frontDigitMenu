import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../../environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../../services/productos.service';
import { PedidosService } from '../../../services/pedidos.service';
import { CategoriasService } from '../../../services/categorias.service';
import { SubcategoriaService } from '../../../services/subcategoria.service';
import { NotificacionesService } from '../../../services/notificaciones.service';
import { Producto_extras_ingrSel } from '../../../interfaces/types';

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
  categoriasOriginales: any[] = [];
  
  // Producto seleccionado
  selectedProduct: any = null;
  opciones: any[] = [];
  extras: any[] = [];
  selectedOpcion: any = null;
  selectedExtras: any[] = [];
  ingredientes: any[] = [];
  precioTotal: number = 0;
  
  // Búsqueda
  searchTerm: string = '';
  
  // Carrito
  pedidoActual: any = null;
  productosEnPedido: Producto_extras_ingrSel[] = [];
  totalCarrito: number = 0;

  constructor(
    private route: ActivatedRoute,
    private productosService: ProductosService,
    private pedidosService: PedidosService,
    private categoriasService: CategoriasService,
    private subcategoriaService: SubcategoriaService,
    private notificacionesService: NotificacionesService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mesaId = params['mesa'];
      if (this.mesaId) {
        this.cargarPedidoMesa();
      }
    });

    this.cargarCategoriasYSubcategorias();
  }

  // ==================== CARRITO ====================
  
  cargarPedidoMesa(): void {
    if (!this.mesaId) return;

    this.pedidosService.getPedidosConProductosDetalles().subscribe({
      next: (data) => {
        const normalizado = data.map(p => ({
          ...p,
          extras: p.extras ?? [],
          ingredientes: p.ingredientes ?? []
        }));

        const productosDeMiMesa = normalizado.filter(detalle => 
          detalle.pedido_id?.no_mesa?.no_mesa === parseInt(this.mesaId!)
        );

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
      error: (error) => console.error('Error al cargar pedido:', error)
    });
  }

  calcularTotalCarrito(): void {
    this.totalCarrito = this.productosEnPedido.reduce((total, producto) => 
      total + (parseFloat(producto.precio.toString()) || 0), 0
    );
    this.totalCarrito = Math.round(this.totalCarrito * 100) / 100;
  }

  mostrarCarrito(): void {
    this.cargarPedidoMesa();
    setTimeout(() => {
      const modal = new (window as any).bootstrap.Modal(
        document.getElementById('carritoModal')
      );
      modal.show();
    });
  }

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

      await this.pedidosService.eliminarProductoDelPedido(producto.pedido_prod_id).toPromise();
      this.cargarPedidoMesa();

      Swal.fire('¡Eliminado!', 'El producto ha sido eliminado del pedido.', 'success');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      Swal.fire('Error', 'No se pudo eliminar el producto', 'error');
    }
  }

  // ==================== PRODUCTOS ====================

  async showProduct(prod: any): Promise<void> {
    this.selectedProduct = prod;
    this.selectedExtras = [];
    this.selectedOpcion = null;
    this.precioTotal = parseFloat(prod.precio);
    this.ingredientes = [];

    try {
      const [opciones, extras, ingredientes] = await Promise.all([
        this.productosService.obtenerOpcionesDeProducto(prod.id_prod),
        this.productosService.obtenerExtrasDeProducto(prod.id_prod),
        this.productosService.obtenerIngredientesDeProducto(prod.id_prod)
      ]);

      this.opciones = opciones;
      this.extras = extras;
      this.ingredientes = Array.isArray(ingredientes) 
        ? ingredientes.map((item: any) => item.ingrediente_id) 
        : [];

      setTimeout(() => {
        const modal = new (window as any).bootstrap.Modal(
          document.getElementById('productModal')
        );
        modal.show();
      });
    } catch (error) {
      console.error('Error al cargar producto:', error);
      this.ingredientes = [];
    }
  }

  toggleExtra(extra: any): void {
    const index = this.selectedExtras.indexOf(extra);
    if (index >= 0) {
      this.selectedExtras.splice(index, 1);
    } else {
      this.selectedExtras.push(extra);
    }
    this.calcularPrecio();
  }

  calcularPrecio(): void {
    let base = parseFloat(this.selectedProduct.precio);
    if (this.selectedOpcion) {
      base += parseFloat(this.selectedOpcion.precio);
    }
    for (let extra of this.selectedExtras) {
      base += parseFloat(extra.precio);
    }
    this.precioTotal = base;
  }

  async agregarACuenta(): Promise<void> {
    try {
      Swal.fire({
        title: 'Procesando pedido...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      await this.pedidosService.agregarProductoCompleto(
        parseInt(this.mesaId!),
        this.selectedProduct,
        this.selectedOpcion,
        this.selectedExtras,
        this.ingredientes,
        this.precioTotal
      ).toPromise();

      Swal.close();
      Swal.fire('¡Agregado!', 'Producto agregado al pedido', 'success');

      this.cargarPedidoMesa();

      const modalEl = document.getElementById('productModal');
      const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
    } catch (error) {
      console.error('Error al agregar producto:', error);
      Swal.close();
      Swal.fire('Error', 'No se pudo agregar el producto', 'error');
    }
  }

  // ==================== CATEGORÍAS Y SUBCATEGORÍAS ====================

  async cargarCategoriasYSubcategorias(): Promise<void> {
    try {
      const [categorias, subcategorias, productos] = await Promise.all([
        this.categoriasService.getCategorias(),
        this.subcategoriaService.obtenerSubcategorias(),
        this.productosService.obtenerProductos()
      ]);

      const subcategoriasConProductos = subcategorias.map((sub: any) => ({
        ...sub,
        productos: productos.filter((prod: any) => 
          prod.sub_cat_id?.id_subcat === sub.id_subcat
        )
      }));

      this.categorias = categorias.map((cat: any) => ({
        ...cat,
        subcategorias: subcategoriasConProductos.filter((sub: any) => 
          sub.categoria_id?.id_cat === cat.id_cat
        )
      }));

      this.categoriasOriginales = JSON.parse(JSON.stringify(this.categorias));
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }

  // ==================== BÚSQUEDA Y FILTRADO ====================

  filtrarProductos(): void {
    const filtro = this.searchTerm.trim().toLowerCase();

    if (!filtro) {
      this.categorias = JSON.parse(JSON.stringify(this.categoriasOriginales));
      return;
    }

    this.categorias = this.categoriasOriginales
      .map(cat => {
        const subcategorias = cat.subcategorias
          .map((sub: any) => {
            const productos = sub.productos.filter((prod: any) =>
              prod.nombre_prod.toLowerCase().includes(filtro)
            );
            return productos.length ? { ...sub, productos } : null;
          })
          .filter((sub: any) => sub !== null);

        return subcategorias.length ? { ...cat, subcategorias } : null;
      })
      .filter(cat => cat !== null);

    setTimeout(() => this.expandirCoincidencias(), 0);
  }

  expandirCoincidencias(): void {
    this.categorias.forEach((cat, i) => {
      this.expandirElemento(`collapse${i}`);
      
      cat.subcategorias.forEach((sub: any) => {
        this.expandirElemento(`subcat-${sub.id_subcat}`);
      });
    });
  }

  private expandirElemento(id: string): void {
    const elemento = document.getElementById(id);
    if (elemento) {
      const bsCollapse = new (window as any).bootstrap.Collapse(elemento, {
        toggle: false
      });
      bsCollapse.show();
    }
  }

  // ==================== LLAMAR MESERO ====================

  async llamarMesero(): Promise<void> {
    try {
      Swal.fire({
        title: 'Llamando al mesero...',
        text: 'Enviando notificación',
        icon: 'info',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      await this.notificacionesService.crearNotificacion(
        "El cliente solicita atención",
        Number(this.mesaId)
      );

      Swal.fire({
        title: '¡Mesero llamado!',
        text: 'Tu solicitud ha sido enviada. El mesero llegará en breve.',
        icon: 'success',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#28a745',
        timer: 3000,
        timerProgressBar: true,
        showClass: { popup: 'animate__animated animate__fadeInUp' },
        hideClass: { popup: 'animate__animated animate__fadeOutDown' }
      });
    } catch (error) {
      console.error('Error al llamar mesero:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo enviar la notificación. Intenta nuevamente.',
        icon: 'error',
        confirmButtonText: 'Intentar de nuevo',
        confirmButtonColor: '#dc3545',
        showClass: { popup: 'animate__animated animate__shakeX' }
      });
    }
  }
}