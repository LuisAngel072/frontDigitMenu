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
    ApiObtenerRoles: "roles", //GET

    /**
     * Ingredientes
     */
    ApiObtenerIngredientes: "ingredientes", //GET
    ApiCrearIngrediente: "ingredientes/registrar", //POST
    ApiActualizarIngrediente: "ingredientes/actualizar/:id_ingr", //PATCH
    ApiEliminarIngrediente: "ingredientes/eliminar/:id_ingr", //DELETE
}