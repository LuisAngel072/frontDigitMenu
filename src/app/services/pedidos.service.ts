// src/app/services/pedidos.service.ts
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
    return this.http.post(environment.ApiIP, pedido);
  }
}
