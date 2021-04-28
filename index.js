const mongoose = require("mongoose");
require("./config/db");

const express = require("express");
const routes = require("./routes");
const handlebars = require("handlebars");
const exphbs = require("express-handlebars");
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
//sirve para obtener la url actual o de ciertos documentos
const path = require("path");
//para almacenar los usuarios autenticados
const cookieParser = require("cookie-parser");
const session = require("express-session");
//
const MongoStore = require("connect-mongo")(session);
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const passport = require("./config/passport");

require("dotenv").config({ path: "variables.env" });

const app = express();

//habilitar body parser
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//validacion de campos
app.use(expressValidator());

//habilitar handelbars como view
app.engine("handlebars", 
    exphbs({
        defaultLayout: "layout",
        helpers: require("./helpers/handlebars"),
        handlebars: allowInsecurePrototypeAccess(handlebars),
    })
);
app.set("view engine", "handlebars");

//static files, para leer los archivos estaticos que tenemos en public
app.use(express.static(path.join(__dirname, "public")));

//
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

//inicializar passport
app.use(passport.initialize());
app.use(passport.session());

//alertas y flash messages
app.use(flash());

//crear nuestro middleware
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next();  
});

app.use("/", routes());

app.listen(process.env.PUERTO);