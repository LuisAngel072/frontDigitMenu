import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  constructor(private http: HttpClient) { }

  getPedidos(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.ApiIP}pedidos`);
  }

  createPedido(pedido: any): Observable<any> {
    return this.http.post(`${environment.ApiIP}pedidos`, pedido);
  }

  cambiarEstadoProducto(pedidoId: number, datos: any): Observable<any> {
    return this.http.patch(`${environment.ApiIP}pedidos/actualizar/${pedidoId}`, datos);
  }
}