export const environment = {
    production: false,
    ApiIP: "http://localhost:3000/api/",
    ApiUp: "http://localhost:3000/uploads/",

    /**
     * General
     */
    ApiLogin:"auth/login", //Post

    /**
     * Administrador
     */
    ApiEncontrarUsuario: "usuarios", //Get
    ApiCrearUsuario:"usuarios/registro", //Post
    ApiEncontrarUnUsuario: "usuarios/",
    ApiEncontrarRolesYUsuario: "roles/getUsuarios",
    ApiActualizarUsuario: "usuarios/actualizar/",
    ApiDesactivarUsuario: "usuarios/desactivar/",
    ApiReactivarUsuario: "usuarios/reactivar/",

    /**
     * Roles
     */
    ApiObtenerRoles: "roles", //GET

    /**
     * Categorias
     */
    ApiObtenerCategorias: "categorias",//GET
    ApiObtenerCategoria: "categorias/",//GET
    ApiRegistrarCategoria: "categorias/registrar",//POST
    ApiEditarCategoria: "categorias/actualizar/", //PATCH
    ApitEliminarCategoria: "categorias/eliminar/",//DELETE

    /**
     * SubCategorias
     */
    ApiObtenerSubCategorias: "sub-categorias",//GET
    ApiObtenerSubCategoria: "sub-categorias/",//GET
    ApiRegistrarSubCategoria: "sub-categorias/registrar",//POST
    ApiEditarSubCategoria: "sub-categorias/editar/", //PATCH
    ApitEliminarSubCategoria: "sub-categorias/eliminar/",//DELETE

    /**
     * Ingredientes
     */
    ApiObtenerIngredientes: "ingredientes", //GET
    ApiCrearIngrediente: "ingredientes/registrar", //POST
    ApiActualizarIngrediente: "ingredientes/actualizar/", //PATCH
    ApiEliminarIngrediente: "ingredientes/eliminar/", //DELETE

    /**
     * Extras
     */
    ApiObtenerExtras: "extras", //GET
    ApiObtenerExtra: "extras/", //GET
    ApiCrearExtra: "extras/registrar", //POST
    ApiActualizarExtra: "extras/actualizar/", //PATCH
    ApiEliminarExtra: "extras/eliminar/", //DELETE

    /**
     * Opciones
     */
    ApiObtenerOpciones: "opciones", //GET
    ApiObtenerOpcion: "opciones/", //GET
    ApiCrearOpcion: "opciones/registrar", //POST
    ApiActualizarOpcion: "opciones/actualizar/", //PATCH
    ApiEliminarOpcion: "opciones/eliminar/", //DELETE
}