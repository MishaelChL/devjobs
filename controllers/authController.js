const passport = require("passport");
const moongose = require("mongoose");
const Vacante = moongose.model("Vacante");

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
        vacantes
    })
}