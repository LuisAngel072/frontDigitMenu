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
     * Categorias
     */
    ApiObtenerCategorias: "categorias",//GET
    ApiObtenerCategoria: "categorias/:id_cat",//GET
    ApiRegistrarCategoria: "categorias/registrar",//POST
    ApiEditarCategoria: "categorias/editar/:id_cat", //PATCH
    ApitEliminarCategoria: "categorias/eliminar/:id_cat",//DELETE

    /**
     * SubCategorias
     */
    ApiObtenerSubCategorias: "sub-categorias",//GET
    ApiObtenerSubCategoria: "sub-categorias/:id_subcat",//GET
    ApiRegistrarSubCategoria: "sub-categorias/registrar",//POST
    ApiEditarSubCategoria: "sub-categorias/editar/:id_subcat", //PATCH
    ApitEliminarSubCategoria: "sub-categorias/eliminar/:id_subcat",

    /**
     * Ingredientes
     */
    ApiObtenerIngredientes: "ingredientes", //GET
    ApiCrearIngrediente: "ingredientes/registrar", //POST
    ApiActualizarIngrediente: "ingredientes/actualizar/:id_ingr", //PATCH
    ApiEliminarIngrediente: "ingredientes/eliminar/:id_ingr", //DELETE
}