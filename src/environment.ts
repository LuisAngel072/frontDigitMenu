export const environment = {
    production: false,
    ApiIP: "http://localhost:3000/api/",

    /**
     * General
     */
    ApiLogin:"auth/login", //Post

    /**
     * Administrador
     */
    ApiEncontrarUsuario: "usuarios", //Get
    ApiCrearUsuario:"usuarios/registro", //Post
    ApiEncontrarUnUsuario: "usuarios/:codigo",
    ApiEncontrarRolesYUsuario: "roles/getUsuarios",
    ApiActualizarUsuario: "usuarios/actualizar/",
    ApiDesactivarUsuario: "usuarios/desactivar/",

    /**
     * Roles
     */
    ApiObtenerRoles: "roles" //GET
}