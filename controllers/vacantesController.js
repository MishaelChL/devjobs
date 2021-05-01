const Vacante = require("../models/Vacantes");
//------------o-------------------
// const moongose = require("mongoose");
// const Vacante = moongose.model("Vacante");

exports.formularioNuevaVacante = (req, res) => {
    res.render("nueva-vacante", {
        nombrePagina: "Nueva Vacante",
        tagline: "Llena el formulario y publica tu vacante",
        cerrarSession: true,
        nombre: req.user.nombre
    });
}

//agrega las vacantes a la base de datos
exports.agregarVacante = async(req, res) => {
    // console.log(req.body);
    const vacante = new Vacante(req.body);

    //usuario autor de la vacante
    vacante.autor = req.user._id;
    
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
    const vacante = await Vacante.findOne({url: req.params.url});
    
    if(!vacante) return next();

    res.render("editar-vacante", {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSession: true,
        nombre: req.user.nombre
    })
}

exports.editarVacante = async(req, res) => {
    const vacanteActualizada = req.body;
    // console.log(vacanteActualizada);

    vacanteActualizada.skills = req.body.skills.split(",");

    const vacante = await Vacante.findOneAndUpdate(
        {url: req.params.url}, 
        vacanteActualizada,
        {
            new: true,
            runValidators: true
        }
    );

    res.redirect(`/vacantes/${vacante.url}`);


}

//validar y sanitizar los campos de las nuevas vacantes
exports.validarVacante = (req, res, next) => {
    
    //sanitizar los campos
    req.sanitizeBody("titulo").escape();
    req.sanitizeBody("empresa").escape();
    req.sanitizeBody("ubicacion").escape();
    req.sanitizeBody("salario").escape();
    req.sanitizeBody("contrato").escape();
    req.sanitizeBody("skills").escape();

    //validar
    req.checkBody("titulo", "Agrega un titulo a la vacante").notEmpty();
    req.checkBody("empresa", "Agrega una empresa").notEmpty();
    req.checkBody("ubicacion", "Agrega una ubicacion").notEmpty();
    req.checkBody("contrato", "Selecciona el tipo de contrato").notEmpty();
    req.checkBody("skills", "Agrega al menos una habilidad").notEmpty();

    const errores = req.validationErrors();
    if(errores){
        //recargar las vistas con los errores
        req.flash("error", errores.map(error => error.msg));
        res.render("nueva-vacante", {
            nombrePagina: "Nueva Vacante",
            tagline: "Llena el formulario y publica tu vacante",
            cerrarSession: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        })
    }

    next();
}