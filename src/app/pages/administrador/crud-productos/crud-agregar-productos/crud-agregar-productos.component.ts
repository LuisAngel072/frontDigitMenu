import { Component, Input, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import {
  Extras,
  Ingredientes,
  Opciones,
  Sub_categorias,
} from '../../../../types';
import { AdministradorComponent } from '../../administrador.component';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { MatPaginator } from '@angular/material/paginator';
import { CustomPaginatorIntl } from '../../../../../matPaginator';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ProductosService } from '../../../../services/productos.service';
import { ProductosDto } from '../../../../dtos';

@Component({
    selector: 'app-crud-agregar-productos',
    standalone: true,
    imports: [CommonModule, MatPaginator, ReactiveFormsModule],
    providers: [{ provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }],
    templateUrl: './crud-agregar-productos.component.html',
    styleUrl: './crud-agregar-productos.component.css'
})
export class CrudAgregarProductosComponent {
  form: FormGroup = this.fb.group({
    nombre_prod: ['', Validators.required],
    descripcion: ['', Validators.required],
    img_prod: [null, Validators.required],
    precio: [0, [Validators.required, Validators.min(0)]],
    sub_cat_id: [null, Validators.required],
    extras: this.fb.array([]),
    opciones: this.fb.array([]),
    ingredientes: this.fb.array([]),
  });
  selectedFile?: File;

  @Input() ingredientes: Ingredientes[] = [];
  @Input() extras: Extras[] = [];
  @Input() opciones: Opciones[] = [];
  @Input() sub_categorias: Sub_categorias[] = [];

  ingredientesFiltrados: Ingredientes[] = [];
  extrasFiltrados: Extras[] = [];
  opcionesFiltradas: Opciones[] = [];

  currentPageIngr: number = 0;
  pageSizeIngr: number = 6;

  currentPageExt: number = 0;
  pageSizeExt: number = 6;

  currentPageOpc: number = 0;
  pageSizeOpc: number = 6;
  constructor(
    public readonly administradorComponent: AdministradorComponent,
    private readonly productosService: ProductosService,
    private fb: FormBuilder
  ) {}

  async ngOnInit() {
    this.ingredientes = this.administradorComponent.ingredientes;
    this.extras = this.administradorComponent.extras;
    this.opciones = this.administradorComponent.opciones;
    this.sub_categorias = this.administradorComponent.subcategorias;

    await this.updateIngredientesFiltrados();
    await this.updateExtrasFiltrados();
    await this.updateOpcionesFiltradas();

    // Llenar los arrays según la cantidad actual de items
    this.resetCheckboxes('extras', this.extras.length);
    this.resetCheckboxes('opciones', this.opciones.length);
    this.resetCheckboxes('ingredientes', this.ingredientes.length);

    // 3) Agrega un FormControl por cada elemento de cada lista
    this.addCheckboxControls('ingredientes', this.ingredientes.length);
    this.addCheckboxControls('extras', this.extras.length);
    this.addCheckboxControls('opciones', this.opciones.length);

    this.syncFormArrayWithFiltrados('ingredientes', this.ingredientesFiltrados);
    this.syncFormArrayWithFiltrados('extras', this.extrasFiltrados);
    this.syncFormArrayWithFiltrados('opciones', this.opcionesFiltradas);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ingredientesFiltrados'] && this.ingredientes) {
      this.updateIngredientesFiltrados();
    }
    if (changes['opcionesFiltradas'] && this.opciones) {
      this.updateIngredientesFiltrados();
    }
    if (changes['extrasFiltrados'] && this.extras) {
      this.updateIngredientesFiltrados();
    }
  }


  onPageChangeIngr(event: PageEvent) {
    this.currentPageIngr = event.pageIndex;
    this.pageSizeIngr = event.pageSize;
    this.updateIngredientesFiltrados();
    this.resetCheckboxes('ingredientes', this.ingredientesFiltrados.length);
    this.syncFormArrayWithFiltrados('ingredientes', this.ingredientesFiltrados);
  }

  onPageChangeOpc(event: PageEvent) {
    this.currentPageOpc = event.pageIndex;
    this.pageSizeOpc = event.pageSize;
    this.updateOpcionesFiltradas();
    this.resetCheckboxes('opciones', this.opcionesFiltradas.length);
    this.syncFormArrayWithFiltrados('opciones', this.opcionesFiltradas);
  }

  onPageChangeExt(event: PageEvent) {
    this.currentPageExt = event.pageIndex;
    this.pageSizeExt = event.pageSize;
    this.updateExtrasFiltrados();
    this.resetCheckboxes('extras', this.extrasFiltrados.length);
    this.syncFormArrayWithFiltrados('extras', this.extrasFiltrados);
  }
  /**
   * Permite paginar los ingredientes
   */
  updateIngredientesFiltrados() {
    const startIndex = this.currentPageIngr * this.pageSizeIngr;
    const endIndex = startIndex + this.pageSizeIngr;
    this.ingredientesFiltrados = this.ingredientes.slice(startIndex, endIndex);
  }
  /**
   * Permite paginar las opciones
   */
  updateOpcionesFiltradas() {
    const startIndex = this.currentPageOpc * this.pageSizeOpc;
    const endIndex = startIndex + this.pageSizeOpc;
    this.opcionesFiltradas = this.opciones.slice(startIndex, endIndex);
  }
  /**
   * Permite paginar los extras
   */
  updateExtrasFiltrados() {
    const startIndex = this.currentPageExt * this.pageSizeExt;
    const endIndex = startIndex + this.pageSizeExt;
    this.extrasFiltrados = this.extras.slice(startIndex, endIndex);
  }

  /**
   * BUSCADORES
   */
  filtrarIngredientes(event: any) {
    const valor = event.target.lowerCase();
    this.ingredientesFiltrados = this.ingredientes.filter((ingrediente) => {
      const nombre_ingr = ingrediente.nombre_ingrediente.toLowerCase() || '';
      const precio = ingrediente.precio.toString().toLowerCase() || '';

      return nombre_ingr.includes(valor) || precio.includes(valor);
    });
  }
  filtrarOpciones(event: any) {
    const valor = event.target.lowerCase();
    this.opcionesFiltradas = this.opciones.filter((opcion) => {
      const nombre_opcion = opcion.nombre_opcion.toLowerCase() || '';
      const porcentaje = opcion.porcentaje.toString().toLowerCase() || '';

      return nombre_opcion.includes(valor) || porcentaje.includes(valor);
    });
  }
  filtrarExtras(event: any) {
    const valor = event.target.lowerCase();
    this.extrasFiltrados = this.extras.filter((extra) => {
      const nombre_extra = extra.nombre_extra.toLowerCase() || '';
      const precio = extra.precio.toString().toLowerCase() || '';

      return nombre_extra.includes(valor) || precio.includes(valor);
    });
  }

  /** ——— FormArray helpers ——— */
  private addCheckboxControls(
    field: 'ingredientes' | 'extras' | 'opciones',
    count: number
  ) {
    const arr = this.form.get(field) as FormArray;
    for (let i = 0; i < count; i++) arr.push(new FormControl(false));
  }
  private resetCheckboxes(
    field: 'ingredientes' | 'extras' | 'opciones',
    count: number
  ) {
    const arr = this.form.get(field) as FormArray;
    while (arr.length) arr.removeAt(0);
    this.addCheckboxControls(field, count);
  }
  get ingredientesFA() {
    return this.form.get('ingredientes') as FormArray;
  }
  get extrasFA() {
    return this.form.get('extras') as FormArray;
  }
  get opcionesFA() {
    return this.form.get('opciones') as FormArray;
  }
 private syncFormArrayWithFiltrados(formArrayName: 'ingredientes' | 'extras' | 'opciones', filtrados: any[]) {
  const arr = this.form.get(formArrayName) as FormArray;
  // Guarda los valores actuales
  const oldValues = arr.value.slice(0, filtrados.length);
  // Elimina todos los controles
  while (arr.length > 0) arr.removeAt(0);
  // Agrega controles nuevos, conservando los valores previos si existen
  for (let i = 0; i < filtrados.length; i++) {
    arr.push(new FormControl(oldValues[i] ?? false));
  }
}
  /** ——— Envío del formulario ——— */
  async onSubmit() {
    try {
      // 1) Saca los IDs marcados de tus FormArray (o de donde los recojas)
      const idsExtras: number[] = this.extrasFA.value
        .map((chk: boolean, i: number) =>
          chk ? this.extras[i].id_extra : null
        )
        .filter((v: number | null): v is number => v !== null);

      // 2) Busca en this.extras los objetos cuyos ids coinciden
      const extrasSeleccionadas: Extras[] = this.extras.filter((e) =>
        idsExtras.includes(e.id_extra)
      );

      // Igual para opciones e ingredientes...
      const idsOpciones: number[] = this.opcionesFA.value
        .map((chk: boolean, i: number) =>
          chk ? this.opciones[i].id_opcion : null
        )
        .filter((v: number | null): v is number => v !== null);

      const opcionesSeleccionadas: Opciones[] = this.opciones.filter((o) =>
        idsOpciones.includes(o.id_opcion)
      );

      const idsIngredientes: number[] = this.ingredientesFA.value
        .map((chk: boolean, i: number) =>
          chk ? this.ingredientes[i].id_ingr : null
        )
        .filter((v: number | null): v is number => v !== null);

      const ingredientesSeleccionados: Ingredientes[] =
        this.ingredientes.filter((i) => idsIngredientes.includes(i.id_ingr));

      const res_img = await this.productosService.subirImg(this.selectedFile!);

      console.log(res_img);
      const img_prod = '/productos/' + String(res_img.ruta_img);
      // 3) Construye tu DTO con los objetos completos
      const dto: ProductosDto = {
        nombre_prod: this.form.value.nombre_prod,
        descripcion: this.form.value.descripcion,
        img_prod: String(img_prod),
        precio: this.form.value.precio,
        sub_cat_id: parseInt(this.form.value.sub_cat_id),
        extras: extrasSeleccionadas,
        opciones: opcionesSeleccionadas,
        ingredientes: ingredientesSeleccionados,
      };

      if (this.form.invalid) {
        if (!dto.nombre_prod) {
          Swal.fire({
            title: 'Error',
            text: 'Por favor, ingrese el nombre del producto.',
            icon: 'error',
            timer: 2000,
          });
          return;
        }

        if (!dto.descripcion) {
          Swal.fire({
            title: 'Error',
            text: 'Por favor, ingrese la descripción del producto.',
            icon: 'error',
            timer: 2000,
          });
          return;
        }

        if (!dto.sub_cat_id) {
          Swal.fire({
            title: 'Error',
            text: 'Por favor, seleccione una subcategoría.',
            icon: 'error',
            timer: 2000,
          });
          return;
        }

        if (!dto.ingredientes) {
          Swal.fire({
            title: 'Error',
            text: 'Por favor, seleccione al menos un ingrediente.',
            icon: 'error',
            timer: 2000,
          });
          return;
        }

        if (!dto.precio) {
          Swal.fire({
            title: 'Error',
            text: 'Por favor, ingrese el precio.',
            icon: 'error',
            timer: 2000,
          });
          return;
        }
      }

      console.log(dto);
      const confirmacion = await Swal.fire({
        title: '¿Estás seguro de registrar este producto?',
        showDenyButton: true,
        confirmButtonText: 'Continuar',
        denyButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn btn-terc',
          denyButton: 'btn btn-peligro',
        },
        icon: 'warning',
      });
      if (confirmacion.isConfirmed) {
        Swal.fire({
          title: 'Cargando...',
          html: 'Por favor, espere mientras se procesa la información.',
          allowOutsideClick: false, // Evita que se pueda cerrar
          allowEscapeKey: false, // Evita que se cierre con la tecla Escape
          allowEnterKey: false, // Evita que se cierre con Enter
          didOpen: () => {
            Swal.showLoading(); // Muestra el spinner de carga
          },
        });
        // 4) Llama al servicio
        await this.productosService.registrarProducto(dto);
        Swal.fire('Éxito', 'Producto creado', 'success');
      } else {
        return;
      }
    } catch (error) {
      console.error('Error al intentar registrar el producto', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al intentar registrar el producto.',
        icon: 'error',
        timer: 2000,
      });
      throw error;
    }
  }

  /** ——— File input ——— */
  onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.selectedFile = input.files[0];
      this.form.patchValue({ img_prod: this.selectedFile.name });
    }
  }
}
