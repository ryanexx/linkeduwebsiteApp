
'use strict'
var express = require('express');
var visitController = require('../controllers/visit');
var api = express.Router();
api.post('/registrar-visita', visitController.saveVisit);
api.get('/obtener-visitas', visitController.getAllVisits);
module.exports = api; //exportar todas las rutas