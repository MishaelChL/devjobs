const passport = require("passport");

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

exports.mostrarPanel = (req, res) => {
    res.render("administracion",{
        nombrePagina: "Pagina de Administracion",
        tagline: "Crea y administra tus vacantes desde aquí"
    })
}