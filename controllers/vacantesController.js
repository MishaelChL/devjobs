const Vacante = require("../models/Vacantes");
//------------o-------------------
// const moongose = require("mongoose");
// const Vacante = moongose.model("Vacante");

exports.formularioNuevaVacante = (req, res) => {
    res.render("nueva-vacante", {
        nombrePagina: "Nueva Vacante",
        tagline: "Llena el formulario y publica tu vacante"
    });
}

//agrega las vacantes a la base de datos
exports.agregarVacante = async(req, res) => {
    // console.log(req.body);
    const vacante = new Vacante(req.body);
    
    //crear arreglo de habilidades o skills
    vacante.skills = req.body.skills.split(",");
    // console.log(vacante);

    //almacenar en la base de datos
    const nuevaVacante = await vacante.save();

    //redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`);
}