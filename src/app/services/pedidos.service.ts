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

  cambiarEstadoProducto(pedidoProdId: number, estado: { estado: string }): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/actualizar/producto/${pedidoProdId}`, estado);
  }
}
