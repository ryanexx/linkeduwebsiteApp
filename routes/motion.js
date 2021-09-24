//DEFINICION DE RUTAS USUARIO

//utilizar nuevas características de javascript
'use strict'

var express = require('express');
var MotionController = require('../controllers/motion');
var md_auth = require('../middlewares/authenticated');
var api = express.Router();


//api.get('/votos', md_auth.ensureAuth , PollController.getPoll);
api.post('/registrar-mocion', md_auth.ensureAuth, MotionController.saveMotion);
api.put('/actualiza-mocion/:id', md_auth.ensureAuth, MotionController.updateMotion);
api.delete('/elimina-mocion/:id', md_auth.ensureAuth, MotionController.deleteMotion);
api.get('/listar-mociones/:page?', md_auth.ensureAuth, MotionController.getMotions)
api.get('/listar-mocion/:id', md_auth.ensureAuth, MotionController.getMotion)
api.get('/lista-voto-mocion/:id', md_auth.ensureAuth, MotionController.getMotionVote)
api.get('/lista-voto-usuario-mocion/:id', md_auth.ensureAuth, MotionController.getVoteUserMotion)
api.get('/lista-mocion-tipovotacion/:id', md_auth.ensureAuth, MotionController.getMotionPoll)
//api.get('/search', md_auth.ensureAuth, MotionController.searchMotions)

module.exports = api; //exportar todas las rutas