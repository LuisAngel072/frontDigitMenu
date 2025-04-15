// order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'api/orders'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) {}
  
  // Get all orders
  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError(this.handleError<any[]>('getOrders', []))
    );
  }

  // Update order status
  updateOrderItem(orderId: number, itemId: number, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${orderId}/items/${itemId}`, { status }).pipe(
      catchError(this.handleError<any>('updateOrderItem'))
    );
  }

  // Handle HTTP errors
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // You can handle error notification to the user here with SweetAlert2
      return of(result as T);
    };
  }
}