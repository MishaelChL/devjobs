const moongose = require("mongoose");
const Usuarios = moongose.model("Usuarios")

exports.formCrearCuenta = async(req, res) => {
    res.render("crear-cuenta", {
        nombrePagina: "Crea tu cuenta en devJobs",
        tagline: "Comienza a publicar tus vacantes gratis, solo debes de crear tu cuenta"
    })
}

exports.validarRegistro = (req, res, next) => {
    req.checkBody("nombre", "El nombre es obligatorio").notEmpty();

    const errores = req.validationErrors();
    console.log(errores);

    return;
}

exports.crearUsuario = async(req, res, next) => {
    //crear el usuario
    const usuario = new Usuarios(req.body);
    // console.log(usuario);

    const nuevoUsuario = await usuario.save();

    if(!nuevoUsuario) return next();
    res.redirect("iniciar/sesion");

}