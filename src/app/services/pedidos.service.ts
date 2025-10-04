import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, lastValueFrom, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../environment';
import {
  EstadoPedidoHasProductos,
  Pedidos,
  Producto_extras_ingrSel,
} from '../interfaces/types';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PedidosService {
  private baseUrl = environment.ApiIP + 'pedidos';

  constructor(
    private http: HttpClient,
    private readonly authService: AuthService
  ) {}

  // Función existente
  getPedidosConProductosDetalles(): Observable<Producto_extras_ingrSel[]> {
    return this.http.get<any[]>(`${this.baseUrl}`).pipe(
      switchMap((pedidos) => {
        const detalles$ = pedidos.map((pedido) =>
          this.http
            .get<any[]>(`${this.baseUrl}/productos/${pedido.id_pedido}`)
            .pipe(
              switchMap((productos: any[]) => {
                const detallesProductos$ = productos.map((prod) =>
                  this.http.get<Producto_extras_ingrSel>(
                    `${this.baseUrl}/productos/extrasIngrs/${prod.pedido_prod_id}`
                  )
                );
                return forkJoin(detallesProductos$);
              })
            )
        );
        return forkJoin(detalles$).pipe(
          map((detallesAnidados: Producto_extras_ingrSel[][]) =>
            detallesAnidados.flat()
          )
        );
      })
    );
  }

  // Función existente
  /**
   * Hace la llamada a la api cambiarEstado, la cual, modifica el estado de un registro
   * de la tabla pedidos_has_productos.
   * Se cambió de forma async (asíncrona) por practicidad del caso
   * @param pedido_prod_id Llave primaria del registro en la tabla pedidos_has_productos
   * para cambiar el estado del producto a 'Preparado' 'Entregado' o 'Pagado'
   * @param estado El estado a cambiar, debe corresponder al enum establecido
   * @returns UpdateResult, estado de pedido cambiado
   */
  async cambiarEstadoDeProducto(
    pedido_prod_id: number,
    estado: EstadoPedidoHasProductos
  ) {
    try {
      const response$ = await this.http.patch<any>(
        environment.ApiIP +
          environment.ApiCambiarEstadoProducto +
          pedido_prod_id,
        { estado },
        { headers: { Authorization: `Bearer ${this.authService.getToken()}` } }
      );
      const response = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        `Ocurrió un error al intentar cambiar el estado del producto sobre el pedido con id ${pedido_prod_id} a ${estado}`,
        error
      );
      throw error;
    }
  }

  // ============ NUEVAS FUNCIONES ============

  /**
   * Obtiene todos los pedidos
   */
  obtenerTodosPedidos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`);
  }

  /**
   * Busca un pedido activo para una mesa específica
   * @param numeroMesa - Número de la mesa
   * @returns Observable con el pedido encontrado o null
   */
  buscarPedidoActivoPorMesa(numeroMesa: number): Observable<any | null> {
    return this.obtenerTodosPedidos().pipe(
      map((pedidos) => {
        const pedidosActivos = pedidos.filter((p) => {
          const mesaMatch = p.no_mesa?.no_mesa === numeroMesa;
          const estadoActivo = !p.estado || p.estado === 'Iniciado';
          return mesaMatch && estadoActivo;
        });
        
        if (pedidosActivos.length > 0) {
          return pedidosActivos.sort((a, b) => b.id_pedido - a.id_pedido)[0];
        }
        return null;
      })
    );
  }
  /**
   * Obtiene el pedido iniciado del momento según el número de mesa
   * que se esté buscando. Esta función será utilizada para determinar
   * si existe ya un pedido iniciado para añadir productos, de lo contrario,
   * crear un pedido con el número de mesa.
   * @param no_mesa Número de mesa donde se accede al menú
   * @returns Pedido encontrado o nulo
   */
  async getPedidoIniciadoByNoMesa(no_mesa: number): Promise<Pedidos | null> {
    try {
      const response$ = await this.http.get<any>(
        environment.ApiIP +
          environment.ApiObtenerPedidoIniciadoByNoMesa +
          no_mesa
      );
      const response: Pedidos | null = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        `Ocurrió un error al intentar obtener el pedido iniciado según el no.mesa ${no_mesa}`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtiene o crea un pedido para una mesa
   * Si existe un pedido activo lo retorna, si no, crea uno nuevo
   * @param numeroMesa - Número de la mesa
   * @returns Observable con el ID del pedido
   */
  obtenerOCrearPedidoPorMesa(numeroMesa: number): Observable<number> {
    return this.buscarPedidoActivoPorMesa(numeroMesa).pipe(
      switchMap((pedidoExistente) => {
        if (pedidoExistente) {
          // Retorna el ID del pedido existente
          return new Observable<number>((observer) => {
            observer.next(pedidoExistente.id_pedido);
            observer.complete();
          });
        } else {
          // Crea nuevo pedido y retorna su ID
          return this.crearNuevoPedido(numeroMesa).pipe(
            switchMap(() => this.obtenerUltimoPedidoPorMesa(numeroMesa)),
            map((ultimoPedido) => ultimoPedido.id_pedido)
          );
        }
      })
    );
  }

  /**
   * Crea un nuevo pedido para una mesa
   * @param numeroMesa - Número de la mesa
   */
  crearNuevoPedido(numeroMesa: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/registrar`, {
      no_mesa: numeroMesa,
    });
  }

  /**
   * Obtiene el último pedido de una mesa (el más reciente)
   * @param numeroMesa - Número de la mesa
   */
  obtenerUltimoPedidoPorMesa(numeroMesa: number): Observable<any> {
    return this.obtenerTodosPedidos().pipe(
      map((pedidos) => {
        const pedidosDeLaMesa = pedidos.filter(
          (p) => p.no_mesa?.no_mesa === numeroMesa
        );
        return pedidosDeLaMesa.sort((a, b) => b.id_pedido - a.id_pedido)[0];
      })
    );
  }

  /**
   * Registra un producto a un pedido
   * @param payloadProducto - Datos del producto a agregar
   */
  registrarProductoAlPedido(payloadProducto: {
    pedido_id: number;
    producto_id: number;
    opcion_id?: number | null;
    precio: number;
    extras: number[];
    ingr: number[];
  }): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/registrar/productos`,
      payloadProducto
    );
  }

  /**
   * Función helper que maneja todo el flujo de agregar un producto al pedido
   * Obtiene/crea el pedido y luego agrega el producto
   * @param numeroMesa - Número de la mesa
   * @param productoData - Datos del producto
   * @param opcionSeleccionada - Opción seleccionada (opcional)
   * @param extrasSeleccionados - Extras seleccionados
   * @param ingredientes - Lista de ingredientes
   * @param precioTotal - Precio total calculado
   */
  agregarProductoCompleto(
    numeroMesa: number,
    productoData: any,
    opcionSeleccionada: any | null,
    extrasSeleccionados: any[],
    ingredientes: any[],
    precioTotal: number
  ): Observable<any> {
    return this.obtenerOCrearPedidoPorMesa(numeroMesa).pipe(
      switchMap((idPedido) => {
        const payload = {
          pedido_id: idPedido,
          producto_id: productoData.id_prod,
          opcion_id: opcionSeleccionada?.opcion_id?.id_opcion ?? null,
          precio: precioTotal,
          extras: extrasSeleccionados.map((e) => e.extra_id.id_extra),
          ingr: ingredientes.map((i) => i.id_ingr),
        };
        return this.registrarProductoAlPedido(payload);
      })
    );
  }

  /**
   * Obtiene los productos de un pedido específico
   * @param idPedido - ID del pedido
   */
  obtenerProductosDePedido(idPedido: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/productos/${idPedido}`);
  }

  /**
   * Actualiza el estado de un pedido
   * @param idPedido - ID del pedido
   * @param estado - Nuevo estado
   */
  actualizarEstadoPedido(idPedido: number, estado: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/actualizar/${idPedido}`, {
      estado,
    });
  }

  /**
   * Elimina un producto específico de un pedido
   * @param pedidoProdId - ID del registro en pedidos_has_productos
   * @returns Observable con el resultado de la eliminación
  */
  eliminarProductoDelPedido(pedidoProdId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/productos/${pedidoProdId}`, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` }
    });
  }

  async getProductosExtrasIngrSel(p_h_pr_id: number): Promise<Producto_extras_ingrSel> {
    try {
      const response$ = await this.http.get<Producto_extras_ingrSel>(
        environment.ApiIP +
          environment.ApiObtenerExtrasIngrProducto +
          p_h_pr_id
      );
      const response: Producto_extras_ingrSel = await lastValueFrom(response$);
      return response;
    } catch (error) {
      console.error(
        `Ocurrió un error al intentar obtener los productos, extras e ingredientes seleccionados según el id ${p_h_pr_id}`,
        error
      );
      throw error;
    }
  }
}
