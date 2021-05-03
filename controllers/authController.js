const passport = require("passport");
const moongose = require("mongoose");
const Vacante = moongose.model("Vacante");
const Usuarios = moongose.model("Usuarios");
const crypto = require("crypto");
const enviarEmail = require("../handlers/email");

exports.autenticarUsuario = passport.authenticate("local", {
    successRedirect: "/administracion",
    failureRedirect: "/iniciar-sesion",
    failureFlash: true,
    badRequestMessage: "Ambos campos son obligatorios"
})

//revisar si el usuario está autenticado o no
exports.verificarUsuario = (req, res, next) => {
    //revisar el usuario
    if(req.isAuthenticated()/*metodo de passport que devuelve true o false*/){
        return next(); //estan autenticados
    }

    //redireccionar
    res.redirect("/iniciar-sesion");
}

exports.mostrarPanel = async (req, res) => {
    //consultar el usuario autenticado 
    const vacantes = await Vacante.find({ autor: req.user._id });

    res.render("administracion",{
        nombrePagina: "Pagina de Administracion",
        tagline: "Crea y administra tus vacantes desde aquí",
        vacantes,
        imagen: req.user.imagen,
        cerrarSession: true,
        nombre: req.user.nombre
    })
}

exports.cerrarSesion = (req, res) => {
    req.logout();
    req.flash("correcto", "Cerraste Sesión correctamente");
    return res.redirect("iniciar-sesion");
}

//formulario para reiniciar password
exports.formReestablecerPassword = (req, res) => {
    res.render("reestablecer-password", {
        nombrePagina: "Reestable tu Password",
        tagline: "Si ya tienes una cuenta pero olvidaste tu password, coloca tu email"
    })
}
//genera el token en la tabla del usuario
exports.enviarToken = async (req, res) => {
    const usuario = await Usuarios.findOne({email: req.body.email});

    if(!usuario){
        req.flash("error", "No existe esa cuenta");
        return res.redirect("/iniciar-sesion");
    }

    //el usuario existe, generar token
    usuario.token = crypto.randomBytes(20).toString("hex");
    usuario.expira = Date.now() + 3600000;

    await usuario.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;
    console.log(resetUrl);

    //TO DO: enviar notificacion por email
    await enviarEmail.enviar({
        usuario,
        subject: "Password Reset",
        resetUrl,
        archivo: "reset"
    });

    //todo correcto
    req.flash("correcto", "Revisa tu Email para las indicaciones");
    res.redirect("/iniciar-sesion");
}

//valida si el token es valida y si el usuario existe, muestra la vista
exports.reestablecerPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });

    // console.log(usuario);

    if(!usuario) {
        req.flash("error", "El formulario ya no es valido, intenta de nuevo");
        return res.redirect("/reestablecer-password");
    }

    //Todo bien
    res.render("nuevo-password", {
        nombrePagina: "Nuevo Password"
    });
}

//almacena el nuevo password en la db
exports.guardarPassword = async (req, res) => {
    const usuario = await Usuarios.findOne({
        token: req.params.token,
        expira: {
            $gt: Date.now()
        }
    });
    
    if(!usuario) {
        req.flash("error", "El formulario ya no es valido, intenta de nuevo");
        return res.redirect("/reestablecer-password");
    }

    //guardar en la db
    usuario.password = req.body.password;
    usuario.token = undefined;
    usuario.expira = undefined;

    await usuario.save();
    req.flash("correcto", "Password modificado correctamente");
    res.redirect("/iniciar-sesion")
}