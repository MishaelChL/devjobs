const moongose = require("mongoose");
const Vacante = moongose.model("Vacante");

exports.mostrarTrabajos = async (req, res, next) => {
    const vacantes = await Vacante.find();
    console.log(vacantes);

    if(!vacantes) return next();

    res.render("home", {
        nombrePagina: "devJobs",
        tagline: "Encuentra y Publica trabajos para Desarrolladores Web",
        barra: true,
        boton: true,
        vacantes
    })
}