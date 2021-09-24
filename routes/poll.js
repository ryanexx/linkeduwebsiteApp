//DEFINICION DE RUTAS USUARIO

//utilizar nuevas características de javascript
'use strict'

var express = require('express');
var PollController = require('../controllers/poll');
var md_auth = require('../middlewares/authenticated');
var api = express.Router();

//middleware para subir archivos
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/users'}); //aqui se guardarán las imagenes que usa el usuario

//api.get('/votos', md_auth.ensureAuth , PollController.getPoll);
api.post('/registrar-votacion', md_auth.ensureAuth, PollController.savePoll);
api.get('/listado-votaciones/:page?', md_auth.ensureAuth, PollController.getPolls)
api.get('/listar-votacion/:id', md_auth.ensureAuth, PollController.getPoll)




module.exports = api; //exportar todas las rutas