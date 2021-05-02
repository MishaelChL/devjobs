const moongose = require("mongoose");
const Usuarios = moongose.model("Usuarios")
const multer = require("multer");
const shortid = require("shortid");

exports.subirImagen = (req, res, next) => {
    upload(req, res, function(error){
        if(error instanceof multer.MulterError){
            return next();
        }
    });
    next();
}

//opciones de Multer
const configuracionMulter = {
    storage: fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, __dirname+"../../public/uploads/perfiles");
        },
        filename: (req, file, cb) => {
            // console.log(file);
            const extension = file.mimetype.split("/")[1];
            cb(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req, file, cb){
        if(file.mimetype === "image/jpeg" || file.mimetype === "image/png"){
            //el callback se ejecuta como true o false, true cuando la imagen se acepta
            cb(null, true);
        }else{
            cb(null, false);
        }
    },
    limits: {fileSize: 100000}
}

const upload = multer(configuracionMulter).single("imagen");

exports.formCrearCuenta = (req, res) => {
    res.render("crear-cuenta", {
        nombrePagina: "Crea tu cuenta en devJobs",
        tagline: "Comienza a publicar tus vacantes gratis, solo debes de crear tu cuenta"
    })
}

exports.validarRegistro = (req, res, next) => {

    //sanitizar
    req.sanitizeBody("nombre").escape();
    req.sanitizeBody("email").escape();
    req.sanitizeBody("password").escape();
    req.sanitizeBody("confirmar").escape();
    
    //validar
    req.checkBody("nombre", "El nombre es obligatorio").notEmpty();
    req.checkBody("email", "El email debe ser valido").isEmail();
    req.checkBody("password", "El password es obligatorio").notEmpty();
    req.checkBody("confirmar", "Confirmar password no debe ir vacio").notEmpty();
    req.checkBody("confirmar", "El password es diferente").equals(req.body.password);

    const errores = req.validationErrors();
    // console.log(errores);

    if(errores){
        //si hay errores
        req.flash("error", errores.map(error => error.msg));

        res.render("crear-cuenta", {
            nombrePagina: "Crea tu cuenta en devJobs",
            tagline: "Comienza a publicar tus vacantes gratis, solo debes de crear tu cuenta",
            mensajes: req.flash()
        })
        return;
    }
    //si toda la validacion es correcta
    next();
}

exports.crearUsuario = async(req, res, next) => {
    //crear el usuario
    const usuario = new Usuarios(req.body);
    // console.log(usuario);

    try {
        await usuario.save();
        res.redirect("iniciar/sesion");
    } catch (error) {
        req.flash("error", error);
        res.redirect("/crear-cuenta");
    }
    
}

//formulario para iniciar sesion
exports.formIniciarSesion = (req, res) => {
    res.render("iniciar-sesion", {
        nombrePagina: "Iniciar Sesion devJobs"
    })
}

exports.formEditarPerfil = (req, res) => {
    res.render("editar-perfil" , {
        nombrePagina: "Edita tu Perfil en devJobs",
        usuario: req.user,
        cerrarSession: true,
        nombre: req.user.nombre
    })
}

//guardar cambios en editar perfil
exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findById(req.user._id);
    // console.log(usuario);

    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;
    if(req.body.password){
        usuario.password = req.body.password
    }

    // console.log(req.file);
    if(req.file){
        usuario.imagen = req.file.filename;
    }

    await usuario.save();

    req.flash("correcto", "Cambios guardados correctamente");
    
    //redirect
    res.redirect("/administracion");
}

//sanitizar y validar el formulario de editar perfiles
exports.validarPerfil = (req, res, next) => {
    //sanitizar
    req.sanitizeBody("nombre").escape();
    req.sanitizeBody("email").escape();
    if(req.body.password){
        req.sanitizeBody("password").escape();
    }

    //validar
    req.checkBody("nombre", "El nombre no puede ir vacio").notEmpty();
    req.checkBody("email", "El correo no debe ir vacio").notEmpty();

    const errores = req.validationErrors();
    if(errores){
        //recargar las vistas con los errores
        req.flash("error", errores.map(error => error.msg));
        res.render("editar-perfil" , {
            nombrePagina: "Edita tu Perfil en devJobs",
            usuario: req.user,
            cerrarSession: true,
            nombre: req.user.nombre,
            mensajes: req.flash()
        })
    }

    next();
}