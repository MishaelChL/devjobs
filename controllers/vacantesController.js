const Vacante = require("../models/Vacantes");
//------------o-------------------
// const moongose = require("mongoose");
// const Vacante = moongose.model("Vacante");
const multer = require("multer");
const shortid = require("shortid");

exports.formularioNuevaVacante = (req, res) => {
    res.render("nueva-vacante", {
        nombrePagina: "Nueva Vacante",
        tagline: "Llena el formulario y publica tu vacante",
        cerrarSession: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
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
    const vacante = await Vacante.findOne({ url: req.params.url }).populate("autor");//populate es join en mongoose

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
        nombre: req.user.nombre,
        imagen: req.user.imagen
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

exports.eliminarVacante = async (req, res) => {
    const { id } = req.params;
    // console.log(id);

    const vacante = await Vacante.findById(id);
    // console.log(vacante);

    if(verificarAutor(vacante, req.user)){
        //Todo bien, si es el usuario, eliminar
        vacante.remove();
        res.status(200).send("Vacante eliminada correctamente");
    }else{
        //no permitido
        res.status(403).send("Error");
    }
}

const verificarAutor = (vacante = {}, usuario = {}) => {
    if(!vacante.autor.equals(usuario._id)){
        return false;
    }
    return true;
}

//subir archivos en pdf
exports.subirCV = async (req, res, next) => {
    upload(req, res, function(error){
        // console.log(error);
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code === "LIMIT_FILE_SIZE"){
                    req.flash("error", "El archivo es muy grande, max: 110kb");
                }else{
                    req.flash("error", error.message);
                }
            }else{
                // console.log(error.message);
                req.flash("error", error.message);
            }
            res.redirect("back");
            return;
        }else{
            return next();
        } 
    });
}

//opciones de Multer
const configuracionMulter = {
    limits: {fileSize: 110000},
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname+"../../public/uploads/cv");
        },
        filename: (req, file, cb) => {
            // console.log(file);
            const extension = file.mimetype.split("/")[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb){
        if(file.mimetype === "application/pdf"){
            //el callback se ejecuta como true o false, true cuando la imagen se acepta
            cb(null, true);
        }else{
            cb(new Error("Formato no Valido"), false);
        }
    }
}

const upload = multer(configuracionMulter).single("cv");

//almacenar los candidatos en la base de datos
exports.contactar = async (req, res, next) => {
    // console.log(req.params.url);
    const vacante = await Vacante.findOne({url: req.params.url});

    //si no existe la vacante
    if(!vacante) return next();

    //todo bien, construir el nuevo objeto
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.filename
    }
    
    //almcenar la vacante
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    //mensaje flash y redireccion
    req.flash("correcto", "Se envió tu curriculum correctamente");
    res.redirect("/");
}

exports.mostrarCandidatos = async (req, res, next) => {
    // console.log(req.params.id);

    const vacante = await Vacante.findById(ireq.params.id);

    if(vacante.autor != req.user._id.toString()){
        return next();
    }

    if(!vacante) return next();

    res.render("candidatos", {
        nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
        cerrarSession: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    })
}