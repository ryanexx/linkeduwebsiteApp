
'use strict'

var express = require('express');
var BusinessController = require('../controllers/business');
var md_auth = require('../middlewares/authenticated');
var api = express.Router();


//api.get('/listar-servicios', md_auth.ensureAuth , ServiceController.getServices);
api.post('/registrar-empresa', md_auth.ensureAuth, BusinessController.saveBusiness);
api.get('/listar-empresa', md_auth.ensureAuth, BusinessController.getBusiness);
api.get('/listar-infoempresa', BusinessController.getBusiness);
api.put('/actualiza-datos/:id', md_auth.ensureAuth, BusinessController.updateBusiness);
/*api.delete('/eliminar-sesion/:id', md_auth.ensureAuth, ServiceController.deleteSesion);
api.get('/listar-sesion/:id', md_auth.ensureAuth, ServiceController.getSession);
api.get('/obtener-maxsesiones', md_auth.ensureAuth, ServiceController.getNumMaxSession);
 */
module.exports = api; //exportar todas las rutas