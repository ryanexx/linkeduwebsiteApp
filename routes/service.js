
'use strict'

var express = require('express');
var ServiceController = require('../controllers/service');
var md_auth = require('../middlewares/authenticated');
var api = express.Router();



api.post('/registrar-servicio', md_auth.ensureAuth, ServiceController.saveService);
api.get('/listar-servicio/:id', md_auth.ensureAuth, ServiceController.getService);
api.get('/listar-servicios/:page?', md_auth.ensureAuth, ServiceController.getServices);
api.get('/listar-serviciosweb', ServiceController.getServices);
api.put('/actualiza-servicio/:id', md_auth.ensureAuth, ServiceController.updateService);
api.delete('/eliminar-servicio/:id', md_auth.ensureAuth, ServiceController.deleteService);

module.exports = api; //exportar todas las rutas