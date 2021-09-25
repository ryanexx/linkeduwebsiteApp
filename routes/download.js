
'use strict'
var express = require('express');
var downloadController = require('../controllers/download');
var api = express.Router();
api.post('/registrar-descarga', downloadController.saveDownload);
api.get('/obtener-descargas', downloadController.getAllDownloads);
module.exports = api; //exportar todas las rutas