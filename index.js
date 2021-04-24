const express = require("express");
const routes = require("./routes");
const exphbs = require("express-handlebars");
const path = require("path");//sirve para obtener la url actual o de ciertos documentos

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

app.use("/", routes())

app.listen(process.env.PUERTO);