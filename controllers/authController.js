const passport = require("passport");
const moongose = require("mongoose");
const Vacante = moongose.model("Vacante");
const Usuarios = moongose.model("Usuarios");
const crypto = require("crypto");


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

    req.flash("correcto", "Revisa tu Email para las indicaciones");
    res.redirect("/iniciar-sesion");
}