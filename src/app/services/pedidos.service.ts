import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../environment';
import { Producto_extras_ingrSel } from '../types';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private baseUrl = environment.ApiIP + 'pedidos';

  constructor(private http: HttpClient) {}

  // Función existente
  getPedidosConProductosDetalles(): Observable<Producto_extras_ingrSel[]> {
    return this.http.get<any[]>(`${this.baseUrl}`).pipe(
      switchMap(pedidos => {
        const detalles$ = pedidos.map(pedido =>
          this.http.get<any[]>(`${this.baseUrl}/productos/${pedido.id_pedido}`).pipe(
            switchMap((productos: any[]) => {
              const detallesProductos$ = productos.map(prod =>
                this.http.get<Producto_extras_ingrSel>(
                  `${this.baseUrl}/productos/extrasIngrs/${prod.pedido_prod_id}`
                )
              );
              return forkJoin(detallesProductos$);
            })
          )
        );
        return forkJoin(detalles$).pipe(
          map((detallesAnidados: Producto_extras_ingrSel[][]) => detallesAnidados.flat())
        );
      })
    );
  }

  // Función existente
  cambiarEstadoProducto(pedidoProdId: number, estado: { estado: string }): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/actualizar/producto/${pedidoProdId}`, estado);
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
      map(pedidos => {
        const pedidoExistente = pedidos.find(p =>
          p.no_mesa?.no_mesa === numeroMesa && p.estado === 'Iniciado'
        );
        return pedidoExistente || null;
      })
    );
  }

  /**
   * Obtiene o crea un pedido para una mesa
   * Si existe un pedido activo lo retorna, si no, crea uno nuevo
   * @param numeroMesa - Número de la mesa
   * @returns Observable con el ID del pedido
   */
  obtenerOCrearPedidoPorMesa(numeroMesa: number): Observable<number> {
    return this.buscarPedidoActivoPorMesa(numeroMesa).pipe(
      switchMap(pedidoExistente => {
        if (pedidoExistente) {
          // Retorna el ID del pedido existente
          return new Observable<number>(observer => {
            observer.next(pedidoExistente.id_pedido);
            observer.complete();
          });
        } else {
          // Crea nuevo pedido y retorna su ID
          return this.crearNuevoPedido(numeroMesa).pipe(
            switchMap(() => this.obtenerUltimoPedidoPorMesa(numeroMesa)),
            map(ultimoPedido => ultimoPedido.id_pedido)
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
      no_mesa: numeroMesa 
    });
  }

  /**
   * Obtiene el último pedido de una mesa (el más reciente)
   * @param numeroMesa - Número de la mesa
   */
  obtenerUltimoPedidoPorMesa(numeroMesa: number): Observable<any> {
    return this.obtenerTodosPedidos().pipe(
      map(pedidos => {
        const pedidosDeLaMesa = pedidos.filter(p => 
          p.no_mesa?.no_mesa === numeroMesa
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
    return this.http.post(`${this.baseUrl}/registrar/productos`, payloadProducto);
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
      switchMap(idPedido => {
        const payload = {
          pedido_id: idPedido,
          producto_id: productoData.id_prod,
          opcion_id: opcionSeleccionada?.opcion_id?.id_opcion ?? null,
          precio: precioTotal,
          extras: extrasSeleccionados.map(e => e.extra_id.id_extra),
          ingr: ingredientes.map(i => i.id_ingr)
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
    return this.http.patch<any>(`${this.baseUrl}/actualizar/${idPedido}`, { estado });
  }
}