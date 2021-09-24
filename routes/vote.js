//DEFINICION DE RUTAS USUARIO

//utilizar nuevas características de javascript
'use strict'

var express = require('express');
var VoteController = require('../controllers/vote');
var md_auth = require('../middlewares/authenticated');
var api = express.Router();


//api.get('/votos', md_auth.ensureAuth , PollController.getPoll);
api.post('/registrar-voto', md_auth.ensureAuth, VoteController.saveVote);
api.get('/listar-voto-usuario/:id', md_auth.ensureAuth, VoteController.getVoteUser)
api.get('/reporte-votos/:vote_id/:user_id', md_auth.ensureAuth, VoteController.getVoteReport)

module.exports = api; //exportar todas las rutas