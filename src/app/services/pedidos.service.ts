import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto_extras_ingrSel } from '../types';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private apiUrl = 'http://localhost:3000/api/pedidos';

  constructor(private http: HttpClient) {}

  getExtrasIngrDeProducto(p_h_pr_id: number): Observable<Producto_extras_ingrSel> {
    return this.http.get<Producto_extras_ingrSel>(`${this.apiUrl}/productos/extrasIngrs/${p_h_pr_id}`);
  }

  cambiarEstadoProducto(pedidoProdId: number, estado: { estado: string }): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/actualizar/producto/${pedidoProdId}`, estado);
  }
}
