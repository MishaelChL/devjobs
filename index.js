const mongoose = require("mongoose");
require("./config/db");

const express = require("express");
const routes = require("./routes");
const exphbs = require("express-handlebars");
//sirve para obtener la url actual o de ciertos documentos
const path = require("path");
//para almacenar los usuarios autenticados
const cookieParser = require("cookie-parser");
const session = require("express-session");
//
const MongoStore = require("connect-mongo")(session);

require("dotenv").config({ path: "variables.env" });

const app = express();

//habilitar handelbars como view
app.engine("handlebars", 
    exphbs({
        defaultLayout: "layout"
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
}))

app.use("/", routes())

app.listen(process.env.PUERTO);