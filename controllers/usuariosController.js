const moongose = require("mongoose");
const Usuarios = moongose.model("Usuarios")

exports.formCrearCuenta = async(req, res) => {
    res.render("crear-cuenta", {
        nombrePagina: "Crea tu cuenta en devJobs",
        tagline: "Comienza a publicar tus vacantes gratis, solo debes de crear tu cuenta"
    })
}

exports.validarRegistro = (req, res, next) => {

    //sanitizar
    req.sanitizeBody("nombre").escape();
    req.sanitizeBody("email").escape();
    req.sanitizeBody("password").escape();
    req.sanitizeBody("confirmar").escape();
    
    //validar
    req.checkBody("nombre", "El nombre es obligatorio").notEmpty();
    req.checkBody("email", "El email debe ser valido").isEmail();
    req.checkBody("password", "El password es obligatorio").notEmpty();
    req.checkBody("confirmar", "Confirmar password no debe ir vacio").notEmpty();
    req.checkBody("confirmar", "El password es diferente").equals(req.body.password);

    const errores = req.validationErrors();
    // console.log(errores);

    if(errores){
        //si hay errores
        res.flash("error", errores.map(error => error.msg));

        res.render("crear-cuenta", {
            nombrePagina: "Crea tu cuenta en devJobs",
            tagline: "Comienza a publicar tus vacantes gratis, solo debes de crear tu cuenta",
            mensajes: req.flash()
        })
        return;
    }
    //si toda la validacion es correcta
    next();
}

exports.crearUsuario = async(req, res, next) => {
    //crear el usuario
    const usuario = new Usuarios(req.body);
    // console.log(usuario);

    const nuevoUsuario = await usuario.save();

    if(!nuevoUsuario) return next();
    res.redirect("iniciar/sesion");

}