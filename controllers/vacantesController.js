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

//muestra una vacante
exports.mostrarVacante = async(req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url });

    if(!vacante) return next();

    res.render("vacante", {
        nombrePagina: vacante.titulo,
        vacante,
        barra: true,
    })
}

exports.formEditarVacante = async(req, res, next) => {
    const vacante = Vacante.findOne({url: req.params.url});

    if(!vacante) return next();

    res.render("editar-vacante", {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`
    })
}