exports.formCrearCuenta = async(req, res) => {
    res.render("crear-cuenta", {
        nombrePagina: "Crea tu cuenta en devJobs",
        tagline: "Comienza a publicar tus vacantes gratis, solo debes de crear tu cuenta"
    })
}