import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AdministradorComponent } from '../administrador.component';
import { Usuarios_has_roles } from '../../../types';
import { UsuariosService } from '../../../services/usuarios.service';

@Component({
  selector: 'app-crud-empleados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './crud-empleados.component.html',
  styleUrl: './crud-empleados.component.css',
})
export class CrudEmpleadosComponent {
  @Input() usuarios: Usuarios_has_roles[] = [];

  constructor(
    private adminComponente: AdministradorComponent,
    private readonly usuariosService: UsuariosService
  ) {}
  /**
  addUser(nombres: string, apellidos: string, rol: string) {
    // Creamos un nuevo ID basado en la longitud del arreglo
    const newId = this.employees.length + 1;

    // Creamos el nuevo usuario y lo agregamos al arreglo
    const newUser = { id: newId, nombres, apellidos, rol };
    this.employees.push(newUser);

    // Mostrar en consola para verificar
    console.log(this.employees);
  }
 */
  async ngOnInit() {
    this.usuarios = this.adminComponente.usuarios;
    this.filtrarUsuariosActivos()
    console.log(this.usuarios);
  }
  filtrarUsuariosActivos() {
    this.usuarios = this.usuarios.filter((usuario) => usuario.usuario_id.activo === true);
  }
  agregarEmpleadosBoton() {
    Swal.fire({
      title: 'Agregar Nuevo Usuario',
      html: `
        <form class="merequetengue">
  <div class="container">
    <div class="row">
      <div class="col-md-6 mb-3">
        <input id="nombres" class="form-control" placeholder="Nombres" />
      </div>
      <div class="col-md-6 mb-3">
        <input id="apellidos" class="form-control" placeholder="Apellidos" />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12 mb-3">
        <select id="rol" class="form-control">
          <option value="Administrador">Administrador</option>
          <option value="Cocinero">Cocinero</option>
          <option value="Mesero">Mesero</option>
          <option value="Cajero">Cajero</option>
        </select>
      </div>
    </div>
  </div>
</form>

      `,
      confirmButtonText: 'Agregar',
      showCancelButton: true,
      preConfirm: () => {
        // Obtener los valores de los inputs
        const nombres = (document.getElementById('nombres') as HTMLInputElement)
          .value;
        const apellidos = (
          document.getElementById('apellidos') as HTMLInputElement
        ).value;
        const rol = (document.getElementById('rol') as HTMLSelectElement).value;

        // Verificar que todos los campos estén completos
        if (!nombres || !apellidos || !rol) {
          Swal.showValidationMessage('Por favor, complete todos los campos');
        } else {
          // Agregar el nuevo usuario
          //this.addUser(nombres, apellidos, rol);
        }
      },
    });
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
          timer:2000,
        });
        return;
      }
      console.log(usF);
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
          confirmButton:'btn btn-prim'
        }
      });
    } catch (error) {
      console.error(
        'Error al obtener al usuario.',
        error
      );
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
      console.log(usF);
      Swal.fire({
        title: 'Editar empleado',
        html: `
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Código</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.codigo
            }" id="codigo">
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Nombre(s)</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.nombres
            }" id="nombres">
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Primer apellido</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.primer_apellido
            }" id="primer_apellido">
          </div>
      
          <div class="input-group mb-3">
            <span class="input-group-text border-secondary">Segundo apellido</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.segundo_apellido
            }" id="segundo_apellido">
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Teléfono</span>
            <input type="tel" class="form-control border-secondary" value="${
              usF?.usuario_id.telefono_id.telefono
            }" id="telefono_id">
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Email</span>
            <input type="email" class="form-control border-secondary" value="${
              usF?.usuario_id.email_id.email
            }" id="email_id">
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
            <span class="input-group-text border-secondary">RFC</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.rfc.rfc
            }" id="rfc">
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">NSS</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.nss.nss
            }" id="nss">
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Calle</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.domicilio.calle
            }" id="calle">
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Colonia</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.domicilio.colonia
            }" id="colonia">
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">No. exterior</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.domicilio.no_ext
            }" id="no_ext">
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">No. interior</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.domicilio.no_int !== null
                ? usF?.usuario_id.domicilio.no_int
                : ''
            }" id="no_int">
          </div>
      
          <div class="input-group mt-2 mb-3 center-content me-3">
            <span class="input-group-text border-secondary">Municipio</span>
            <input type="text" class="form-control border-secondary" value="${
              usF?.usuario_id.domicilio.municipio
            }" id="municipio">
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
          // Para cada relación, usamos el valor del input y agregamos el id original del objeto (si se requiere actualización)
          return {
            codigo: (document.getElementById('codigo') as HTMLInputElement)
              .value,
            nombres: (document.getElementById('nombres') as HTMLInputElement)
              .value,
            primer_apellido: (
              document.getElementById('primer_apellido') as HTMLInputElement
            ).value,
            segundo_apellido: (
              document.getElementById('segundo_apellido') as HTMLInputElement
            ).value,
            // Para teléfono, email, etc. construir objetos
            telefono_id: {
              id_telefono: usF?.usuario_id.telefono_id?.id_telefono, // Mantener el ID original
              telefono: (
                document.getElementById('telefono_id') as HTMLInputElement
              ).value,
            },
            email_id: {
              id_email: usF?.usuario_id.email_id?.id_email,
              email: (document.getElementById('email_id') as HTMLInputElement)
                .value,
            },
            sexo: (document.getElementById('sexo') as HTMLSelectElement).value,
            // Para rol, si solo se envía un string y se maneja por separado, puede quedarse así o construir un objeto:
            rol: [
              {
                rol: (document.getElementById('rol') as HTMLSelectElement)
                  .value,
              },
            ],
            rfc: {
              id_rfc: usF?.usuario_id.rfc?.id_rfc,
              rfc: (document.getElementById('rfc') as HTMLInputElement).value,
            },
            nss: {
              id_nss: usF?.usuario_id.nss?.id_nss,
              nss: (document.getElementById('nss') as HTMLInputElement).value,
            },
            domicilio: {
              id_dom: usF?.usuario_id.domicilio?.id_dom,
              calle: (document.getElementById('calle') as HTMLInputElement)
                .value,
              colonia: (document.getElementById('colonia') as HTMLInputElement)
                .value,
              no_ext: (document.getElementById('no_ext') as HTMLInputElement)
                .value,
              no_int: (document.getElementById('no_int') as HTMLInputElement)
                .value,
              municipio: (
                document.getElementById('municipio') as HTMLInputElement
              ).value,
              // Agrega otros campos que tu objeto domicilio requiera
            },
            contrasena: (
              document.getElementById('contrasena') as HTMLInputElement
            ).value,
          };
        },
      }).then(async (result) => {
        if (result.isConfirmed) {
          const formData = result.value;
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
            console.log('Datos a actualizar:', formData);
            // Llamada al servicio para actualizar el empleado
             try {
              Swal.fire({
                title: 'Cargando...',
                html: 'Por favor, espere mientras se procesa la información.',
                allowOutsideClick: false,  // Evita que se pueda cerrar
                allowEscapeKey: false,  // Evita que se cierre con la tecla Escape
                allowEnterKey: false,  // Evita que se cierre con Enter
                didOpen: () => {
                  Swal.showLoading();  // Muestra el spinner de carga
                }
              });
              this.usuariosService.actualizarUsuario(usF.usuario_id.id_usuario, formData)
              Swal.close();
                Swal.fire({
                  title: 'Empleado actualizado correctamente',
                  icon: 'success',
                  timer: 2000,
                  
                });
                this.usuarios = await this.usuariosService.obtenerUsuariosYRoles();
                this.filtrarUsuariosActivos()
                this.adminComponente.usuarios = this.usuarios;
             } catch (error) {
              this.usuarios = await this.usuariosService.obtenerUsuariosYRoles();
              this.filtrarUsuariosActivos()
              this.adminComponente.usuarios = this.usuarios;
              Swal.close();
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar el empleado.',
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
      console.log(usF);
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
              allowOutsideClick: false,  // Evita que se pueda cerrar
            });
            await this.usuariosService.desactivarUsuario(id_usuario);
            Swal.close();
            Swal.fire({
              title: 'Empleado desactivado correctamente',
              icon: 'success',
              timer: 2000,
            });
            this.usuarios = await this.usuariosService.obtenerUsuariosYRoles();
            this.filtrarUsuariosActivos()
            this.adminComponente.usuarios = this.usuarios;
          } catch (error) {
            this.usuarios = await this.usuariosService.obtenerUsuariosYRoles();
            this.filtrarUsuariosActivos()
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
  
}
