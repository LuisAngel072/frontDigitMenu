import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

@Injectable()
export class CustomPaginatorIntl extends MatPaginatorIntl {
  constructor() {
    super();
    // Sobrescribes los labels
    this.itemsPerPageLabel = 'Ítems por página';
    this.nextPageLabel     = '';      // deja vacío
    this.previousPageLabel = '';      // deja vacío
    this.firstPageLabel    = '';      // opcional, para ocultar “First page”
    this.lastPageLabel     = '';      // opcional, para ocultar “Last page”

<<<<<<< HEAD
  override itemsPerPageLabel = 'Ítems por página';
  override nextPageLabel = '';
  override previousPageLabel = '';
=======
    // Le indicas a Angular Material que re-renderice el paginador
    this.changes.next();  // sin esto, los cambios no se reflejan :contentReference[oaicite:0]{index=0}
  }
>>>>>>> productos

  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    // Oculta por completo el texto de rango
    return '';
  };
}
