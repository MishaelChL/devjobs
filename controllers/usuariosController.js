const moongose = require("mongoose");
const Usuarios = moongose.model("Usuarios")

exports.formCrearCuenta = (req, res) => {
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
        req.flash("error", errores.map(error => error.msg));

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

    try {
        await usuario.save();
        res.redirect("iniciar/sesion");
    } catch (error) {
        req.flash("error", error);
        res.redirect("/crear-cuenta");
    }
    
}

//formulario para iniciar sesion
exports.formIniciarSesion = (req, res) => {
    res.render("iniciar-sesion", {
        nombrePagina: "Iniciar Sesion devJobs"
    })
}

exports.formEditarPerfil = (req, res) => {
    res.render("editar-perfil" , {
        nombrePagina: "Edita tu Perfil en devJobs",
        usuario: req.user
    })
}

//guardar cambios en editar perfil
exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findById(req.user._id);
    // console.log(usuario);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if(req.body.password){
        usuario.password = req.body.password
    }
    await usuario.save();

    req.flash("correcto", "Cambios guardados correctamente");
    
    //redirect
    res.redirect("/administracion");
}