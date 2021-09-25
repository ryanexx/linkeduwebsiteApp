//SERVIDOR WEB UTILIZANDO EXPRESS
//CONFIGURACION DE EXPRESS
//utilizar nuevas características de javascript
'use strict'
var express = require('express'); //esto permite trabajar con rutas, protocolo http, etc...
var bodyParser = require('body-parser'); //convertir las peticiones en un objeto de javascript
var morgan = require('morgan'); //middleware Node.js y Express para registrar solicitudes y errores HTTP, y simplifica el proceso.
var path = require('path');
var app = express();//cargar el framework
//cargar rutas
var visit_routes = require('./routes/visit');
var download_routes = require('./routes/download');
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});
app.use(bodyParser.urlencoded({ extended: true })); //crear un middleware (middleware: metodo que se ejecuta antes de que llegue a un controlador)
app.use(bodyParser.json());
//cargar morgan
app.use(morgan('dev'));
//creación de sus propios tokens
morgan.token('host', function (req, res) {
    return req.hostname;
});
// Middleware para Vue.js router modo history
const history = require('connect-history-api-fallback');
app.use(history());
app.use(express.static(path.join(__dirname, 'public')));
//rutas
app.use('/api', visit_routes);
app.use('/api', download_routes);
//exportar configuracion
module.exports = app;