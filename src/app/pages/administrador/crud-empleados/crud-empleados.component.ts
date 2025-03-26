import { Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AdministradorComponent } from '../administrador.component';
import { Roles, Usuarios_has_roles } from '../../../types';
import { UsuariosDTO } from '../../../dtos';
import { UsuariosService } from '../../../services/usuarios.service';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { CustomPaginatorIntl } from '../../../../matPaginator';
import { HeaderComponent } from '../../comun-componentes/header/header.component';
import { ChangeDetectorRef } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { environment } from '../../../../environment';

@Component({
  selector: 'app-crud-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule, MatPaginatorModule],
  templateUrl: './crud-empleados.component.html',
  styleUrl: './crud-empleados.component.css',
  providers: [{ provide: MatPaginatorIntl, useClass: CustomPaginatorIntl }],
})
export class CrudEmpleadosComponent {
  @Input() usuarios: Usuarios_has_roles[] = [];
  @Input() roles: Roles[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageSize: number = 7;
  currentPage: number = 0;

  rolSeleccionado: number = 0;
  activo: number = 0;
  formData: any = {};

  usuariosFiltrados: Usuarios_has_roles[] = [];

  selectedFile: File | null = null;

  constructor(
    private adminComponente: AdministradorComponent,
    private readonly usuariosService: UsuariosService,
    private cdr: ChangeDetectorRef,
    private readonly sharedService: SharedService
  ) {
    this.usuarios = this.adminComponente.usuarios;
    this.roles = this.adminComponente.roles;
    this.rolSeleccionado = 0;
    this.activo = 0;
  }

  async ngOnInit() {
    this.usuarios = this.adminComponente.usuarios;
    this.roles = this.adminComponente.roles;
    console.log(this.usuarios);
    this.updateUsuariosFiltrados();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuarios'] && this.usuarios) {
      this.updateUsuariosFiltrados();
    }
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateUsuariosFiltrados();
  }

  updateUsuariosFiltrados() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.usuariosFiltrados = this.usuarios.slice(startIndex, endIndex);
  }

  filtrarUsuarios(event: any) {
    const valor = event.target.lowerCase();
    this.usuarios = this.adminComponente.usuarios.filter((usuario) => {
      const codigo = usuario.usuario_id.codigo.toLowerCase() || '';
      const nombres = usuario.usuario_id.nombres.toLowerCase() || '';
      const primer_apellido =
        usuario.usuario_id.primer_apellido.toString().toLowerCase() || '';
      const segundo_apellido =
        usuario.usuario_id.segundo_apellido.toString().toLowerCase() || '';
      const rol = usuario.rol_id.rol.toString().toLowerCase() || '';

      return (
        codigo.includes(valor) ||
        nombres.includes(valor) ||
        primer_apellido.includes(valor) ||
        segundo_apellido.includes(valor) ||
        rol.includes(valor)
      );
    });
  }

  filtrarUsuariosActivos() {
    this.usuarios = this.usuarios.filter(
      (usuario) => usuario.usuario_id.activo === true
    );
  }

  filtrarActivos(event: Event) {
    const element = event.target as HTMLSelectElement;
    this.activo = Number(element.value);
    switch (this.activo) {
      case 0:
        this.usuariosFiltrados = this.adminComponente.usuarios;
        break;
      case 1:
        this.usuarios = this.adminComponente.usuarios;
        this.usuariosFiltrados = this.usuarios.filter(
          (usuario) => usuario.usuario_id.activo === true
        );
        break;
      case 2:
        this.usuarios = this.adminComponente.usuarios;
        this.usuariosFiltrados = this.usuarios.filter(
          (usuario) => usuario.usuario_id.activo === false
        );
        break;
      default:
        this.usuariosFiltrados = this.adminComponente.usuarios;
        break;
    }
  }
  filtrarUsuariosPorRol(event: Event) {
    const element = event.target as HTMLSelectElement;
    this.rolSeleccionado = Number(element.value);
    this.usuarios = this.adminComponente.usuarios;
    this.usuarios = this.usuarios.filter(
      (usuario) => usuario.rol_id.id_rol === this.rolSeleccionado
    );
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }
  upload() {
    if (this.selectedFile) {
      this.usuariosService.subirImg(this.selectedFile).subscribe({
        next: (res) => {
          console.log('Ruta de la imagen subida:', res.img_ruta);
          // Aquí puedes actualizar la base de datos con la ruta devuelta
        },
        error: (err) => {
          console.error('Error al subir imagen', err);
        },
      });
    }
  }

  obtenerIdRol(rol: string): number {
    if (rol == 'Administrador') return 1;
    else if (rol == 'Cocinero') return 2;
    else if (rol == 'Mesero') return 3;
    else if (rol == 'Cajero') return 4;

    return 0;
  }

  async agregarEmpleadosBoton() {
    try {
      Swal.fire({
        title: 'Agregar Nuevo Usuario',
        html: `
          <form class="">
            <div class="container">
              <div class="row">
                <div class="input-group mt-2 mb-3 center-content me-3">
                  <span class="input-group-text border-secondary">Código</span>
                  <input id="nuevo_codigo" class="form-control border-secondary border-secondary" />
                </div>
                <div class="input-group mt-2 mb-3 center-content me-3">
                  <span class="input-group-text border-secondary">Nombres</span>
                  <input id="nuevo_nombres" class="form-control border-secondary" />
                </div>
                <div class="input-group mt-2 mb-3 center-content me-3">
                  <span class="input-group-text border-secondary">Primer apellido</span>
                  <input id="nuevo_primer_apellido" class="form-control border-secondary" />
                </div>
                <div class="input-group mt-2 mb-3 center-content me-3">
                  <span class="input-group-text border-secondary">Segundo apellido</span>
                  <input id="nuevo_segundo_apellido" class="form-control border-secondary" />
                </div>
                <div class="input-group mt-2 mb-3 center-content me-3">
                  <span class="input-group-text border-secondary">Telefono</span>
                  <input id="nuevo_telefono" class="form-control border-secondary" maxlength="12"/>
                </div>
                <div class="input-group mt-2 mb-3 center-content me-3">
                  <span class="input-group-text border-secondary">Email</span>
                  <input id="nuevo_email" class="form-control border-secondary" />
                </div>
                <div class="row">
                <div class="col-md-12 mb-3">
                  <select id="nuevo_rol" class="form-control border-secondary">
                    <option value="1">Administrador</option>
                    <option value="2">Cocinero</option>
                    <option value="3">Mesero</option>
                    <option value="4">Cajero</option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-md-12 mb-3">
                  <select id="nuevo_sexo" class="form-control border-secondary">
                    <option value="Masculino" selected>Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
  
              <div class="input-group mt-2 mb-3 center-content me-3">
                <input type="file" id="img_ruta" class="form-control border-secondary"/>
              </div>
  
              <div class="input-group mt-2 mb-3 center-content me-3">
                <span class="input-group-text border-secondary">RFC</span>
                <input id="nuevo_rfc" class="form-control border-secondary" maxlength="13"/>
              </div>
  
              <div class="input-group mt-2 mb-3 center-content me-3">
                <span class="input-group-text border-secondary">NSS</span>
                <input id="nuevo_nss" class="form-control border-secondary" maxlength="11"/>
              </div>
  
              <div class="input-group mt-2 mb-3 center-content me-3">
                <span class="input-group-text border-secondary">Calle</span>
                <input id="nuevo_calle" class="form-control border-secondary" />
              </div>
  
              <div class="input-group mt-2 mb-3 center-content me-3">
                  <span class="input-group-text border-secondary">Colonia</span>
                  <input id="nuevo_colonia" class="form-control border-secondary"/>
              </div>
  
              <div class="input-group mt-2 mb-3 center-content me-3">
                <span class="input-group-text border-secondary">Postal</span>
                <input id="nuevo_postal" class="form-control border-secondary" maxlength="5"/>
              </div>
  
              <div class="input-group mt-2 mb-3 center-content me-3">
                <span class="input-group-text border-secondary">Numero exterior</span>
                <input id="nuevo_num_ext" class="form-control border-secondary maxlength="5""/>
              </div>
  
              <div class="input-group mt-2 mb-3 center-content me-3">
                <span class="input-group-text border-secondary">Numero interior</span>
                <input id="nuevo_num_int" class="form-control border-secondary maxlength="5""/>
              </div>
  
              <div class="input-group mt-2 mb-3 center-content me-3">
                <span class="input-group-text border-secondary">Municipio</span>
                <input id="nuevo_municipio" class="form-control border-secondary" /
              </div>
  
              <div class="input-group mt-2 mb-3 center-content me-3">
                <span class="input-group-text border-secondary">Contraseña</span>
                <input id="nuevo_contrasena" class="form-control border-secondary" type="password" />
              </div>
            </div>
           </div>
          </form>
  
        `,
        confirmButtonText: 'Agregar',
        customClass: {
          confirmButton: 'btn btn-terc',
          cancelButton: 'btn btn-peligro',
        },
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        preConfirm: () => {
          // Para cada relación, usamos el valor del input y agregamos el id original del objeto (si se requiere actualización)
          const codigo = (
            document.getElementById('nuevo_codigo') as HTMLInputElement
          ).value;
          const nombres = (
            document.getElementById('nuevo_nombres') as HTMLInputElement
          ).value;
          const primer_apellido = (
            document.getElementById('nuevo_primer_apellido') as HTMLInputElement
          ).value;
          const segundo_apellido = (
            document.getElementById(
              'nuevo_segundo_apellido'
            ) as HTMLInputElement
          ).value;
          const telefono = (
            document.getElementById('nuevo_telefono') as HTMLInputElement
          ).value;
          const email = (
            document.getElementById('nuevo_email') as HTMLInputElement
          ).value;
          const rol = (
            document.getElementById('nuevo_rol') as HTMLSelectElement
          ).value;
          const sexo = (
            document.getElementById('nuevo_sexo') as HTMLSelectElement
          ).value;
          const rfc = (
            document.getElementById('nuevo_rfc') as HTMLSelectElement
          ).value;
          const nss = (
            document.getElementById('nuevo_nss') as HTMLSelectElement
          ).value;
          const calle = (
            document.getElementById('nuevo_calle') as HTMLSelectElement
          ).value;
          const colonia = (
            document.getElementById('nuevo_colonia') as HTMLSelectElement
          ).value;
          const codigo_postal = (
            document.getElementById('nuevo_postal') as HTMLSelectElement
          ).value;
          const no_ext = (
            document.getElementById('nuevo_num_ext') as HTMLSelectElement
          ).value;
          const no_int = (
            document.getElementById('nuevo_num_int') as HTMLSelectElement
          ).value;
          const municipio = (
            document.getElementById('nuevo_municipio') as HTMLSelectElement
          ).value;
          const contrasena = (
            document.getElementById('nuevo_contrasena') as HTMLSelectElement
          ).value;
          const fileInput = document.getElementById(
            'img_ruta'
          ) as HTMLInputElement;
          const file: File | null =
            fileInput?.files && fileInput.files[0] ? fileInput.files[0] : null;
          this.selectedFile =
            fileInput?.files && fileInput.files[0] ? fileInput.files[0] : null;
          // Verificar que todos los campos estén completos
          if (
            !codigo ||
            !nombres ||
            !primer_apellido ||
            !telefono ||
            !email ||
            !rol ||
            !sexo ||
            !calle ||
            !colonia ||
            !codigo_postal ||
            !no_ext ||
            !municipio ||
            !contrasena
          ) {
            Swal.showValidationMessage('Por favor, complete todos los campos');
          }
          for (let usuario of this.usuarios) {
            if (codigo === usuario.usuario_id.codigo)
              Swal.showValidationMessage('El código debe ser único');
            if (rfc === usuario.usuario_id.rfc.rfc)
              Swal.showValidationMessage('El rfc debe ser único');
            if (nss === usuario.usuario_id.nss.nss)
              Swal.showValidationMessage('El nss debe ser único');
          }
          let rolUs = {
            id_rol: 1,
            rol: 'Administrador',
            descripcion:
              'Se encarga de los CRUD de Empleados, Productos, Plano de la mesa y las mesas, además de ver las ventas del restaurante',
          };
          switch (rol) {
            case '1':
              rolUs = {
                id_rol: 1,
                rol: 'Administrador',
                descripcion:
                  'Se encarga de los CRUD de Empleados, Productos, Plano de la mesa y las mesas, además de ver las ventas del restaurante',
              };
              break;
            case '2':
              rolUs = {
                id_rol: 2,
                rol: 'Cocinero',
                descripcion:
                  'Se encarga de ver y preparar los pedidos de los clientes',
              };
              break;
            case '3':
              rolUs = {
                id_rol: 3,
                rol: 'Mesero',
                descripcion:
                  'Se encarga de ver y entregar los pedidos y atender a los clientes',
              };
              break;
            case '4':
              rolUs = {
                id_rol: 4,
                rol: 'Cajero',
                descripcion: 'Se encarga de ver y cobrar los pedidos',
              };
              break;
          }
          const rolesArray = [rolUs];
          // Construir el objeto de datos con la estructura esperada
          let data: UsuariosDTO = {
            codigo,
            nombres,
            primer_apellido,
            segundo_apellido,
            telefono_id: {
              telefono,
            },
            email_id: {
              email,
            },
            sexo,
            // En este ejemplo, el select de rol se usa para seleccionar un solo rol.
            rol: rolesArray,
            rfc: {
              rfc,
            },
            nss: {
              nss,
            },
            img_perfil: { img_ruta: file ? file.name : '' },
            domicilio: {
              calle,
              colonia,
              codigo_postal,
              no_ext,
              no_int,
              municipio,
            },
            contrasena: contrasena,
            activo: true,
          };
          if (data.nss.nss === '') {
            data.nss.nss = 'NO ASIGNADO';
          }
          if (data.rfc.rfc === '') {
            data.rfc.rfc = 'NO ASIGNADO';
          }
          this.formData = data;
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          const confirmacion = await Swal.fire({
            title: '¿Estás seguro de registrar el empleado?',
            showDenyButton: true,
            confirmButtonText: 'Continuar',
            customClass: {
              confirmButton: 'btn btn-terc',
              denyButton: 'btn btn-peligro',
            },
            denyButtonText: 'Cancelar',
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
            if (this.selectedFile) {
              this.usuariosService
                .subirImg(this.selectedFile)
                .pipe(
                  switchMap((res) => {
                    console.log('Ruta de la imagen subida:', res.img_ruta);
                    this.formData.img_perfil.img_ruta =
                      'img-us/' + String(res.img_ruta);
                    // Una vez que la imagen se ha subido y la ruta se ha asignado, registramos al usuario
                    console.log('HOLAAAAAAAAAAAAAAAAAAAA')
                    console.log(this.formData);
                    return this.usuariosService.registrarUsuario(this.formData);
                  })
                )
                .subscribe({
                  next: (response) => {
                    console.log(this.formData);
                    Swal.close();
                    Swal.fire({
                      title: 'Empleado registrado correctamente',
                      icon: 'success',
                      timer: 2000,
                    });
                    // Actualiza la lista de usuarios después del registro exitoso
                    this.usuariosService
                      .obtenerUsuariosYRoles()
                      .then((usuarios) => {
                        this.usuarios = usuarios;
                        this.adminComponente.usuarios = this.usuarios;
                        this.formData = {};
                      });
                  },
                  error: async (err) => {
                    console.error(
                      'Error durante el registro del usuario:',
                      err
                    );
                    Swal.close();
                    Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: 'No se pudo registrar el empleado.',
                    });
                    this.usuarios =
                      await this.usuariosService.obtenerUsuariosYRoles();

                    this.adminComponente.usuarios = this.usuarios;
                    this.cdr.detectChanges();
                  },
                });
            } else {
              console.log(this.formData);
              this.formData.img_us.img_ruta = 'Pendiente';
              // Si no hay una imagen seleccionada, procede directamente a registrar el usuario
              this.usuariosService.registrarUsuario(this.formData).subscribe({
                next: async (response) => {
                  Swal.close();
                  Swal.fire({
                    title: 'Empleado registrado correctamente',
                    icon: 'success',
                    timer: 2000,
                  });
                  // Actualiza la lista de usuarios después del registro exitoso
                  this.usuarios =
                    await this.usuariosService.obtenerUsuariosYRoles();
                  this.cdr.detectChanges();

                  this.adminComponente.usuarios = this.usuarios;
                },
                error: (err) => {
                  console.error('Error durante el registro del usuario:', err);
                  Swal.close();
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo registrar el empleado.',
                  });
                },
              });
            }
          }
        }
      });
    } catch (error) {
      console.error(
        'Error al registrar el usuario. ERROR -> usuarios.service.ts -> registrarUsuario()',
        error
      );
      throw error;
    }
  }

  async verEmpleado(id_usuario: number) {
    try {
      const usF = this.usuarios.find(
        (us) => us.usuario_id.id_usuario === id_usuario
      );
      if (!usF) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se encontro el usuario en la base de datos, intenta más tarde.',
          timer: 2000,
        });
        return;
      }
      Swal.fire({
        title: 'Ver empleado',
        html: `
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Código</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.codigo
            }" id="codigo" disabled>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Nombre(s)</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.nombres
            }" id="nombres" disabled>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Primer apellido</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.primer_apellido
            }" id="primer_apellido" disabled>
          </div>
      
          <div class="input-group mb-3">
            <span class="input-group-text border-secondary">Segundo apellido</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.segundo_apellido
            }" id="segundo_apellido" disabled>
          </div>

          <div class="input-group mb-3">
            <span class="input-group-text border-secondary">Activo</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.activo
            }" id="activo" disabled>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Teléfono</span>
            <input type="tel" class="form-control border-secondary" value="${
              usF?.usuario_id.telefono_id.telefono
            }" id="telefono_id" disabled>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Email</span>
            <input type="email" class="form-control border-secondary" value="${
              usF?.usuario_id.email_id.email
            }" id="email_id" disabled>
          </div>
      
          <!-- Select para Sexo -->
          <div class="input-group mb-3">
            <span class="input-group-text border-secondary">Sexo</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.sexo
            }" id="sexo" disabled>
          </div>
      
          <!-- Select para Rol -->
          <div class="input-group mb-3">
            <span class="input-group-text border-secondary">Rol</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.rol_id.rol
            }" id="rol" disabled>
          </div>
              
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">RFC</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.rfc.rfc
            }" id="rfc" disabled>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">NSS</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.nss.nss
            }" id="nss" disabled>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Calle</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.domicilio.calle
            }" id="calle" disabled>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Colonia</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.domicilio.colonia
            }" id="colonia" disabled>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">No. exterior</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.domicilio.no_ext
            }" id="no_ext" disabled>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">No. interior</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.domicilio.no_int !== null
                ? usF?.usuario_id.domicilio.no_int
                : ''
            }" id="no_int" disabled>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Municipio</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.domicilio.municipio
            }" id="municipio" disabled>
          </div>
      
        `,
        confirmButtonText: 'Continuar',
        customClass: {
          confirmButton: 'btn btn-prim',
        },
      });
    } catch (error) {
      console.error('Error al obtener al usuario.', error);
      throw error;
    }
  }

  async editarEmpleado(id_usuario: number) {
    try {
      const usF = this.usuarios.find(
        (us) => us.usuario_id.id_usuario === id_usuario
      );
      if (!usF) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se encontro el usuario en la base de datos, intenta más tarde.',
          timer: 2000,
        });
        return;
      }

      Swal.fire({
        title: 'Editar empleado',
        html: `
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Código</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.codigo
            }" id="codigo" required>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Nombre(s)</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.nombres
            }" id="nombres" required>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Primer apellido</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.primer_apellido
            }" id="primer_apellido" required>
          </div>
      
          <div class="input-group mb-3">
            <span class="input-group-text border-secondary">Segundo apellido</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.segundo_apellido
            }" id="segundo_apellido" required>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Teléfono</span>
            <input type="tel" class="form-control border-secondary"  maxlength="12" value="${
              usF?.usuario_id.telefono_id.telefono
            }" id="telefono_id" required>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Email</span>
            <input type="email" class="form-control border-secondary" value="${
              usF?.usuario_id.email_id.email
            }" id="email_id" required>
          </div>
      
          <!-- Select para Sexo -->
          <div class="row">
            <div class="col-md-12 mb-3">
              <select id="sexo" class="form-control">
                <option value="Masculino" ${
                  usF?.usuario_id.sexo === 'Masculino' ? 'selected' : ''
                }>Masculino</option>
                <option value="Femenino" ${
                  usF?.usuario_id.sexo === 'Femenino' ? 'selected' : ''
                }>Femenino</option>
                <option value="Otro" ${
                  usF?.usuario_id.sexo === 'Otro' ? 'selected' : ''
                }>Otro</option>
              </select>
            </div>
          </div>
      
          <!-- Select para Rol -->
          <div class="row">
            <div class="col-md-12 mb-3">
              <select id="rol" class="form-control">
                <option value="Administrador" ${
                  usF?.rol_id.rol === 'Administrador' ? 'selected' : ''
                }>Administrador</option>
                <option value="Mesero" ${
                  usF?.rol_id.rol === 'Mesero' ? 'selected' : ''
                }>Mesero</option>
                <option value="Cocinero" ${
                  usF?.rol_id.rol === 'Cocinero' ? 'selected' : ''
                }>Cocinero</option>
                <option value="Cajero" ${
                  usF?.rol_id.rol === 'Cajero' ? 'selected' : ''
                }>Cajero</option>
              </select>
            </div>
          </div>
          <div class="input-group mt-2 mb-3 center-content me-3">
            <input type="file" class="form-control border-secondary" value="${
              usF.usuario_id.img_perfil.img_ruta
            }" id="img_perfil">
          </div>
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">RFC</span>
            <input type="text" class="form-control border-secondary" maxlength="13" value="${
              usF?.usuario_id.rfc.rfc
            }" id="rfc">
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">NSS</span>
            <input type="text" class="form-control border-secondary"  maxlength="11" value="${
              usF?.usuario_id.nss.nss
            }" id="nss">
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Calle</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.domicilio.calle
            }" id="calle" required>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Colonia</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.domicilio.colonia
            }" id="colonia" required>
          </div>

          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Código postal</span>
            <input type="text" class="form-control border-secondary" maxlength="5" value="${
              usF?.usuario_id.domicilio.codigo_postal
            }" id="codigo_postal" required>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">No. exterior</span>
            <input type="text" class="form-control border-secondary" maxlength="5" value="${
              usF?.usuario_id.domicilio.no_ext
            }" id="no_ext" required>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">No. interior</span>
            <input type="text" class="form-control border-secondary" maxlength="5" value="${
              usF?.usuario_id.domicilio.no_int !== null
                ? usF?.usuario_id.domicilio.no_int
                : ''
            }" id="no_int">
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Municipio</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.domicilio.municipio
            }" id="municipio" required>
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Contraseña</span>
            <input type="password" class="form-control border-secondary" id="contrasena">
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn btn-prim',
          cancelButton: 'btn btn-peligro',
        },
        preConfirm: () => {
          // Obtener y limpiar los valores de los campos obligatorios
          const codigo = (
            document.getElementById('codigo') as HTMLInputElement
          ).value.trim();
          const nombres = (
            document.getElementById('nombres') as HTMLInputElement
          ).value.trim();
          const primer_apellido = (
            document.getElementById('primer_apellido') as HTMLInputElement
          ).value.trim();
          const telefono = (
            document.getElementById('telefono_id') as HTMLInputElement
          ).value.trim();
          const email = (
            document.getElementById('email_id') as HTMLInputElement
          ).value.trim();
          const sexo = (document.getElementById('sexo') as HTMLSelectElement)
            .value;
          const rfc = (
            document.getElementById('rfc') as HTMLInputElement
          ).value.trim();
          const nss = (
            document.getElementById('nss') as HTMLInputElement
          ).value.trim();
          const calle = (
            document.getElementById('calle') as HTMLInputElement
          ).value.trim();
          const colonia = (
            document.getElementById('colonia') as HTMLInputElement
          ).value.trim();
          const codigo_postal = (
            document.getElementById('codigo_postal') as HTMLInputElement
          ).value.trim();
          const no_ext = (
            document.getElementById('no_ext') as HTMLInputElement
          ).value.trim();
          const municipio = (
            document.getElementById('municipio') as HTMLInputElement
          ).value.trim();

          // Opcionales
          const segundo_apellido = (
            document.getElementById('segundo_apellido') as HTMLInputElement
          ).value.trim();
          const no_int = (
            document.getElementById('no_int') as HTMLInputElement
          ).value.trim();
          const contrasena = (
            document.getElementById('contrasena') as HTMLInputElement
          ).value;

          const fileInput = document.getElementById(
            'img_perfil'
          ) as HTMLInputElement;
          const file: File | null =
            fileInput?.files && fileInput.files[0] ? fileInput.files[0] : null;
          this.selectedFile =
            fileInput?.files && fileInput.files[0] ? fileInput.files[0] : null;

          // Validar que los campos obligatorios no estén vacíos (excepto contraseña)
          if (
            !codigo ||
            !nombres ||
            !primer_apellido ||
            !telefono ||
            !email ||
            !sexo ||
            !calle ||
            !colonia ||
            !codigo_postal ||
            !no_ext ||
            !municipio
          ) {
            Swal.showValidationMessage(
              'Por favor, complete todos los campos obligatorios.'
            );
            return;
          }

          // Construir el objeto de datos con la estructura esperada
          const data: any = {
            codigo,
            nombres,
            primer_apellido,
            segundo_apellido,
            telefono_id: {
              id_telefono: usF?.usuario_id.telefono_id?.id_telefono, // mantiene el ID original
              telefono,
            },
            email_id: {
              id_email: usF?.usuario_id.email_id?.id_email,
              email,
            },
            sexo,
            // En este ejemplo, el select de rol se usa para seleccionar un solo rol.
            rol: [
              {
                rol: (document.getElementById('rol') as HTMLSelectElement)
                  .value,
              },
            ],
            rfc: {
              id_rfc: usF?.usuario_id.rfc?.id_rfc,
              rfc: rfc,
            },
            nss: {
              id_nss: usF?.usuario_id.nss?.id_nss,
              nss: nss,
            },
            img_perfil: {
              id_img: usF?.usuario_id.img_perfil.id_img,
              img_ruta: file ? file.name : 'Pendiente',
            },
            domicilio: {
              id_dom: usF?.usuario_id.domicilio?.id_dom,
              calle,
              colonia,
              codigo_postal,
              no_ext,
              no_int,
              municipio,
            },
          };

          // Solo incluir la contraseña si se proporcionó (no vacía)
          if (contrasena.trim().length > 0) {
            data.contrasena = contrasena;
          }
          this.formData = data;
          return data;
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          const confirmacion = await Swal.fire({
            title: '¿Estás seguro de editar el empleado?',
            showDenyButton: true,
            confirmButtonText: 'Continuar',
            customClass: {
              confirmButton: 'btn btn-terc',
              denyButton: 'btn btn-peligro',
            },
            denyButtonText: 'Cancelar',
            icon: 'warning',
          });
          if (confirmacion.isConfirmed) {
            console.log('Datos a actualizar:', this.formData);
            // Llamada al servicio para actualizar el empleado
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
            if (this.selectedFile) {
              this.usuariosService
                .subirImg(this.selectedFile)
                .pipe(
                  switchMap((res) => {
                    console.log('Ruta de la imagen subida:', res.img_ruta);
                    this.formData.img_perfil.img_ruta =
                      'img-us/' + String(res.img_ruta);
                    // Una vez que la imagen se ha subido y la ruta se ha asignado, actualizamos al usuario
                    console.log(this.formData);
                    return this.usuariosService.actualizarUsuario(
                      usF.usuario_id.id_usuario,
                      this.formData
                    );
                  })
                )
                .subscribe({
                  next: (response) => {
                    console.log(this.formData);
                    Swal.close();
                    Swal.fire({
                      title: 'Empleado actualizado correctamente',
                      icon: 'success',
                      timer: 2000,
                    });
                    // Actualiza la lista de usuarios después del registro exitoso
                    //this.headerComponente.profileImageUrl = this.formData.img_perfil.img_ruta;
                    this.usuariosService
                      .obtenerUsuariosYRoles()
                      .then((usuarios) => {
                        this.usuarios = usuarios;
                        this.adminComponente.usuarios = this.usuarios;
                        this.formData = {};
                      });

                    // Verificar si el empleado editado es el usuario autenticado
                    this.sharedService.usercode$.subscribe((usercode) => {
                      if (this.formData.codigo === usercode) {
                        const newProfileImgUrl =
                          environment.ApiIP + this.formData.img_perfil.img_ruta;
                        this.sharedService.setProfileImg(newProfileImgUrl);
                      }
                    });
                  },
                  error: async (err) => {
                    console.error('Error al actualizar el usuario:', err);
                    Swal.close();
                    Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: 'No se pudo actualizar el empleado.',
                    });
                    this.usuarios =
                      await this.usuariosService.obtenerUsuariosYRoles();

                    this.adminComponente.usuarios = this.usuarios;
                  },
                });
            } else {
              console.log(this.formData);
              this.formData.img_us.img_ruta = 'Pendiente';
              // Si no hay una imagen seleccionada, procede directamente a registrar el usuario
              this.usuariosService
                .actualizarUsuario(usF.usuario_id.id_usuario, this.formData)
                .subscribe({
                  next: async (response) => {
                    Swal.close();
                    Swal.fire({
                      title: 'Empleado actualizado correctamente',
                      icon: 'success',
                      timer: 2000,
                    });
                    // Actualiza la lista de usuarios después del registro exitoso
                    this.usuarios =
                      await this.usuariosService.obtenerUsuariosYRoles();
                    this.sharedService;
                    this.cdr.detectChanges();
                    this.adminComponente.usuarios = this.usuarios;
                  },
                  error: (err) => {
                    console.error('Error al actualizar usuario:', err);
                    Swal.close();
                    Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: 'No se pudo actualizar el empleado.',
                    });
                  },
                });
            }
          }
        }
      });
    } catch (error) {
      console.error(
        'Error al actualizar al usuario. ERROR -> usuarios.service.ts -> actualizarUsuario()',
        error
      );
      throw error;
    }
  }

  async desactivarEmpleado(id_usuario: number) {
    try {
      const usF = this.usuarios.find(
        (us) => us.usuario_id.id_usuario === id_usuario
      );
      if (!usF) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se encontró el usuario en la base de datos, intenta más tarde.',
          timer: 2000,
        });
        return;
      }
      Swal.fire({
        icon: 'warning',
        title: 'Desactivar empleado',
        text: '¿Estás seguro de desactivar el empleado?',
        showDenyButton: true,
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn btn-peligro',
          denyButton: 'btn btn-terc',
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            Swal.fire({
              title: 'Cargando...',
              html: 'Por favor, espere mientras se procesa la información.',
              allowOutsideClick: false, // Evita que se pueda cerrar
              allowEscapeKey: false, // Evita que se cierre con la tecla Escape
              allowEnterKey: false, // Evita que se cierre con Enter
              showConfirmButton:false,
              didOpen: () => {
                Swal.showLoading(); // Muestra el spinner de carga
              },
            });
            await this.usuariosService.desactivarUsuario(id_usuario);
            Swal.close();
            Swal.fire({
              title: 'Empleado desactivado correctamente',
              icon: 'success',
              timer: 2000,
            });
            this.usuarios = await this.usuariosService.obtenerUsuariosYRoles();

            this.adminComponente.usuarios = this.usuarios;
          } catch (error) {
            this.usuarios = await this.usuariosService.obtenerUsuariosYRoles();

            this.adminComponente.usuarios = this.usuarios;
            Swal.close();
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo desactivar el empleado.',
            });
          }
        } else {
          return;
        }
      });
    } catch (error) {
      console.error(
        'Error al desactivar al usuario. ERROR -> usuarios.service.ts -> desactivarUsuario()',
        error
      );
      throw error;
    }
  }

  async reactivarEmpleado(id_usuario: number) {
    try {
      const usF = this.usuarios.find(
        (us) => us.usuario_id.id_usuario === id_usuario
      );
      if (!usF) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No se encontró el usuario en la base de datos, intenta más tarde.',
          timer: 2000,
        });
        return;
      }
      Swal.fire({
        icon: 'warning',
        title: 'Activar empleado',
        text: '¿Estás seguro de reactivar el empleado?',
        showDenyButton: true,
        confirmButtonText: 'Continuar',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'btn btn-prim',
          denyButton: 'btn btn-peligro',
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
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
            await this.usuariosService.reactivarUsuario(id_usuario);
            Swal.close();
            Swal.fire({
              title: 'Empleado reactivado correctamente',
              icon: 'success',
              timer: 2000,
              showConfirmButton:false,
            });
            this.usuarios = await this.usuariosService.obtenerUsuariosYRoles();

            this.adminComponente.usuarios = this.usuarios;
          } catch (error) {
            this.usuarios = await this.usuariosService.obtenerUsuariosYRoles();

            this.adminComponente.usuarios = this.usuarios;
            Swal.close();
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo reactivar el empleado.',
            });
          }
        } else {
          return;
        }
      });
    } catch (error) {
      console.error(
        'Error al reactivar al usuario. ERROR -> usuarios.service.ts -> reactivarUsuario()',
        error
      );
      throw error;
    }
  }
}
