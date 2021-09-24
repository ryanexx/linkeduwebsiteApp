//SERVIDOR WEB UTILIZANDO EXPRESS

//CONFIGURACION DE EXPRESS
//utilizar nuevas características de javascript
'use strict'

var express = require('express'); //esto permite trabajar con rutas, protocolo http, etc...

var bodyParser = require('body-parser'); //convertir las peticiones en un objeto de javascript
var morgan = require('morgan'); //middleware Node.js y Express para registrar solicitudes y errores HTTP, y simplifica el proceso.
var path = require ('path');
var app = express();//cargar el framework

//cargar rutas
var user_routes = require('./routes/user');
var message_routes = require('./routes/message');
var poll_routes = require('./routes/poll');
var motion_routes = require('./routes/motion');
var services_routes = require('./routes/service');
var business_routes = require('./routes/business');
var vote_routes = require('./routes/vote');

var token = require('./middlewares/authenticated')


//cargar middlewares
//cargar cors (cabeceras)
// configurar cabeceras http
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});
app.use(bodyParser.urlencoded({extended:true})); //crear un middleware (middleware: metodo que se ejecuta antes de que llegue a un controlador)
app.use(bodyParser.json()); 
//cargar morgan
app.use(morgan('dev'));
//creación de sus propios tokens
morgan.token('host', function(req, res) {
    return req.hostname;
});


// Middleware para Vue.js router modo history
const history = require('connect-history-api-fallback');
app.use(history());
app.use(express.static(path.join(__dirname, 'public')));



//rutas

app.use('/api', user_routes);
app.use('/api', services_routes);
app.use('/api', business_routes);
app.use('/api', vote_routes);
app.use('/api', message_routes);
app.use('/api', poll_routes);
app.use('/api', motion_routes);


//app.use(user_routes);

//exportar configuracion
module.exports = app;