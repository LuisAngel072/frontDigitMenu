import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  forkJoin,
  from,
  lastValueFrom,
  of,
  throwError,
} from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environment';
import {
  EstadoPedidoHasProductos,
  PedidoAgrupado,
  Pedidos,
  Pedidos_has_productos,
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

  getPedidosActivosConDetalles(rol: string | null): Observable<PedidoAgrupado[]> {
    console.log('Iniciando getPedidosActivosConDetalles (Optimizado)...');

    return this.http.get<PedidoAgrupado[]>(`${this.baseUrl}/activos/${rol}`).pipe(
      tap(resultado => console.log('Respuesta completa del backend:', resultado)),
      catchError(err => {
        console.error('Error al obtener los pedidos activos con detalles', err);
        return throwError(() => err);
      })
    );
  }

  getPedidosConProductosDetalles(
    rol: string | null
  ): Observable<Producto_extras_ingrSel[]> {
    console.log('Iniciando getPedidosConProductosDetalles...');

    return this.http.get<Pedidos[]>(`${this.baseUrl}`).pipe(
      tap((pedidos) => console.log('1. Pedidos recibidos:', pedidos)),

      switchMap((pedidos) => {
        if (!pedidos || pedidos.length === 0) {
          return of([]);
        }

        const observablesDeProductos = pedidos.map((pedido) =>
          // 🔧 CORREGIDO: Removida la barra final
          this.http.get<Pedidos_has_productos[]>(
            `${this.baseUrl}/productos/${pedido.id_pedido}${rol ? '/' + rol : ''}`
          )
        );

        return forkJoin(observablesDeProductos);
      }),

      tap((productosAgrupados) =>
        console.log('2. Productos agrupados por pedido:', productosAgrupados)
      ),

      map((productosAgrupados: Pedidos_has_productos[][]) =>
        productosAgrupados.flat()
      ),

      tap((todosLosProductos) =>
        console.log(
          '3. Todos los productos en una sola lista:',
          todosLosProductos
        )
      ),

      switchMap((todosLosProductos) => {
        if (!todosLosProductos || todosLosProductos.length === 0) {
          return of([]);
        }

        const observablesDeDetalles = todosLosProductos.map((prod) =>
          this.http.get<Producto_extras_ingrSel>(
            `${this.baseUrl}/productos/extrasIngrs/${prod.pedido_prod_id}`
          )
        );

        return forkJoin(observablesDeDetalles);
      }),

      tap((resultadoFinal) =>
        console.log(
          '4. Resultado final con todos los detalles:',
          resultadoFinal
        )
      )
    );
  }

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

  // ============ FUNCIONES CORREGIDAS ============

  obtenerTodosPedidos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}`);
  }

  /**
   * 🔧 CORREGIDO: Acepta estados: null, undefined, 'Iniciado', 'No pagado'
   */
  buscarPedidoActivoPorMesa(numeroMesa: number): Observable<any | null> {
    return this.obtenerTodosPedidos().pipe(
      map((pedidos) => {
        console.log(`🔍 Buscando pedido activo para mesa ${numeroMesa}...`);
        console.log('Pedidos disponibles:', pedidos);

        const pedidosActivos = pedidos.filter((p) => {
          const mesaMatch = p.no_mesa?.no_mesa === numeroMesa;

          // ✅ CORREGIDO: Acepta estados que indican que el pedido está activo
          const estadosActivos = [null, undefined, 'Iniciado', 'No pagado'];
          const estadoActivo = estadosActivos.includes(p.estado);

          console.log(`Pedido ${p.id_pedido}: mesa=${p.no_mesa?.no_mesa}, estado=${p.estado}, mesaMatch=${mesaMatch}, estadoActivo=${estadoActivo}`);

          return mesaMatch && estadoActivo;
        });

        if (pedidosActivos.length > 0) {
          // Retornamos el más reciente (mayor id_pedido)
          const pedidoMasReciente = pedidosActivos.sort((a, b) => b.id_pedido - a.id_pedido)[0];
          console.log('✅ Pedido activo encontrado:', pedidoMasReciente);
          return pedidoMasReciente;
        }

        console.log('❌ No se encontró pedido activo para esta mesa');
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
      // 🔧 CORREGIDO: Retornamos null en lugar de lanzar error
      return null;
    }
  }


  obtenerOCrearPedidoPorMesa(numeroMesa: number): Observable<number> {
    console.log(`📋 obtenerOCrearPedidoPorMesa para mesa: ${numeroMesa}`);

    return this.buscarPedidoActivoPorMesa(numeroMesa).pipe(
      switchMap((pedidoExistente) => {
        if (pedidoExistente && pedidoExistente.id_pedido) {
          console.log('✅ Pedido existente encontrado, ID:', pedidoExistente.id_pedido);
          return of(pedidoExistente.id_pedido);
        } else {
          console.log('🆕 No existe pedido, creando uno nuevo para mesa:', numeroMesa);
          return this.crearNuevoPedido(numeroMesa).pipe(
            tap((response) => console.log('✅ Respuesta de creación:', response)),
            // 🔧 CORREGIDO: Usar el ID del pedido de la respuesta directamente
            map((response: any) => {
              // El backend puede retornar el objeto completo o solo el ID
              if (response.id_pedido) {
                console.log('✅ Pedido creado con ID:', response.id_pedido);
                return response.id_pedido;
              } else if (response.identifiers && response.identifiers[0]) {
                const nuevoId = response.identifiers[0].id_pedido;
                console.log('✅ Pedido creado con ID (identifiers):', nuevoId);
                return nuevoId;
              } else {
                throw new Error('El backend no retornó un ID válido');
              }
            }),
            catchError((error) => {
              console.error('❌ Error al crear pedido:', error);
              // Como fallback, intentamos buscar el pedido recién creado
              return this.buscarPedidoActivoPorMesa(numeroMesa).pipe(
                map(pedido => {
                  if (pedido && pedido.id_pedido) {
                    console.log('✅ Pedido recuperado después de error:', pedido.id_pedido);
                    return pedido.id_pedido;
                  }
                  throw new Error('No se pudo crear ni encontrar el pedido');
                })
              );
            })
          );
        }
      }),
      catchError((error) => {
        console.error('❌ Error en obtenerOCrearPedidoPorMesa:', error);
        return throwError(() => error);
      })
    );
  }

  crearNuevoPedido(numeroMesa: number): Observable<any> {
    console.log('🆕 Creando nuevo pedido para mesa:', numeroMesa);
    return this.http.post<any>(`${this.baseUrl}/registrar`, {
      no_mesa: numeroMesa,
    });
  }

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

  registrarProductoAlPedido(payloadProducto: {
    pedido_id: number;
    producto_id: number;
    opcion_id?: number | null;
    precio: number;
    extras: number[];
    ingr: number[];
  }): Observable<any> {
    console.log('Registrando producto al pedido:', payloadProducto);
    return this.http.post(
      `${this.baseUrl}/registrar/productos`,
      payloadProducto
    );
  }

  agregarProductoCompleto(
    numeroMesa: number,
    productoData: any,
    opcionSeleccionada: any | null,
    extrasSeleccionados: any[],
    ingredientes: any[],
    precioTotal: number
  ): Observable<any> {
    console.log('🛒 Iniciando agregarProductoCompleto para mesa:', numeroMesa);

    return this.obtenerOCrearPedidoPorMesa(numeroMesa).pipe(
      switchMap((idPedido) => {
        console.log('📦 Agregando producto al pedido ID:', idPedido);

        const payload = {
          pedido_id: idPedido,
          producto_id: productoData.id_prod,
          opcion_id: opcionSeleccionada?.opcion_id?.id_opcion ?? null,
          precio: precioTotal,
          extras: extrasSeleccionados.map((e) => e.extra_id.id_extra),
          ingr: ingredientes.map((i) => i.id_ingr),
        };

        console.log('Payload del producto:', payload);
        return this.registrarProductoAlPedido(payload);
      }),
      tap(() => console.log('✅ Producto agregado exitosamente'))
    );
  }

  obtenerProductosDePedido(idPedido: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/productos/${idPedido}`);
  }

  actualizarEstadoPedido(idPedido: number, estado: string): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/actualizar/${idPedido}`, {
      estado,
    });
  }

  eliminarProductoDelPedido(pedidoProdId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/productos/${pedidoProdId}`, {
      headers: { Authorization: `Bearer ${this.authService.getToken()}` },
    });
  }

  async getProductosExtrasIngrSel(
    p_h_pr_id: number
  ): Promise<Producto_extras_ingrSel> {
    try {
      const response$ = await this.http.get<Producto_extras_ingrSel>(
        environment.ApiIP + environment.ApiObtenerExtrasIngrProducto + p_h_pr_id
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
