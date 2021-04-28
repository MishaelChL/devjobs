const passport = require("passport");
const localStrategy = require("passport-local");
const moongose = require("mongoose");
const Usuarios = moongose.model("Usuarios");

passport.use(new localStrategy({
    usernameField: "email",
    passwordField: "password"
}, async(email, password, done) => {
    const usuario = await Usuarios.findOne({ email: email });

    if(!usuario) return done(null, false, {
        message: "Usuario no existente"
    });
    
    //usuario existe, vamos a verificarlo
    const verficarPass = usuario.compararPassword(password);
    if(!verficarPass) return done(null, false, {
        message: "Password incorrecto"
    });

    //Todo estuvo bien, usuario existe y password correcto
    return done(null, usuario);

}));

passport.serializeUser((usuario, done) => done(null, usuario._id));

passport.deserializeUser(async (id, done) => {
    const usuario = await Usuarios.findById(id).exec();
    return done(null, usuario);
});

module.exports = passport;