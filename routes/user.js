//DEFINICION DE RUTAS USUARIO

//utilizar nuevas características de javascript
'use strict'

var express = require('express');
var UserController = require('../controllers/user');
var md_auth = require('../middlewares/authenticated');
var api = express.Router();

//middleware para subir archivos
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/users'}); //aqui se guardarán las imagenes que usa el usuario

api.get('/home', UserController.home);
api.get('/pruebas', md_auth.ensureAuth , UserController.pruebas);
api.post('/register', UserController.saveUser);
api.post('/request', UserController.saveRequest);
api.post('/verify', UserController.sendEmailVerification);
//api.post('/sendmail', UserController.sendMail);

api.post('/recuperar_cuenta', UserController.sendEmailRecuperarCuenta);
api.post('/restablecer_cuenta', UserController.restablecerCuenta);
api.post('/cambiar_clave/:id/:old_password/:new_password', UserController.changePassword);


//api.post('/send-email-to-verification', UserController.sendEmailVerification);
api.get('/verification-of-email', UserController.verificationEmail);
api.post('/login', UserController.loginUser);
api.get('/private', md_auth.ensureAuth, UserController.getData);
api.get('/user/:id', md_auth.ensureAuth , UserController.getUser);
api.get('/get_all_request', md_auth.ensureAuth , UserController.getAllRequest);
api.get('/users/:page?', md_auth.ensureAuth , UserController.getUsers);
api.get('/votos-usuario/:id', md_auth.ensureAuth , UserController.getUserVotes);
api.get('/votos-usuarios/:page?', md_auth.ensureAuth , UserController.getUsersVotesAll);

api.get('/users-search/:search/:page?', md_auth.ensureAuth , UserController.searchUsers);
//api.get('/publications-user/:user/:page?', md_auth.ensureAuth, PublicationController.getPublicationsUser);

api.put('/actualiza-usuario/:id', md_auth.ensureAuth , UserController.updateUser); 
api.delete('/eliminar-usuario/:id', md_auth.ensureAuth , UserController.deleteUser); 
api.post('/update-image-user/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage);
api.get('/get-image-user/:imageFile', UserController.getImageFile);


module.exports = api; //exportar todas las rutas