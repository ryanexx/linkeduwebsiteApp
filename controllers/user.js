//DEFINICION DEL CONTROLADOR USUARIO

//utilizar nuevas características de javascript
'use strict'

var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var User = require('../models/user'); //cargar el modelo usuario
var Request = require('../models/request'); //cargar el modelo usuario
//cargar el modelo follow
var jwt = require('../services/jwt'); //cargar el servicio

var fs = require('fs'); //libreria file sistem de node
var path = require('path'); //permite trabajar con rutas de sistemas de ficheros

var nodemailer = require("nodemailer"); //libreria para el envio de correos
var smtpTransport = nodemailer.createTransport({
	service: "Gmail",
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	auth: {

		user: "mywayjayjim86gmail.com",
		pass: "mywayemamat@44"

	}
});
var rand, mailOptions, host, link, email_usuario;
//var url="http://localhost:4200/";
//var url="http://192.168.1.12:4200/";
//var url="http://192.168.1.5:4200/";

function home(req, res) {
	res.status(200).send({
		message: 'Hola mundo desde el servidor node js'
	});
}

function pruebas(req, res) {
	console.log(req.body);
	res.status(200).send({
		message: 'Acción de pruebas en el servidor node js'
	});
}

//REGISTRAR SOLICITUDES
function saveRequest(req, res) {
	var params = req.body;
	var request = new Request();
	console.log("Ingresando a saveRequest ...")
	if (params.name && params.lastname && params.email && params.phone) {
		request.name = params.name.toUpperCase();
		request.lastname = params.lastname.toUpperCase();
		request.email = params.email;
		request.phone = params.phone;
		request.service = params.service;
		request.subservice = params.subservice;
		request.active = false;
		//controlar usuario duplicado
		//guardar usuario
		request.save((err, requestStored) => {
			if (err) {
				return res.status(400).send({
					message: 'Error en la peticion enviar solicitud ' + String(err)
				});
			}

			if (requestStored) {
				//sendEmailVerification(user.email, req.get('host'));
				res.status(200).send({
					status: 'success',
					request: requestStored,
					message: 'Solicitud enviada con éxito'
				});
			} else {
				res.status(200).send({
					status: 'fail',
					message: 'No se ha registrado la solicitud'
				});
			}
		});
	} else {
		res.status(200).send({
			status: 'empty',
			message: 'Envía todos los campos'
		});
	}
}
//REGISTRAR USUARIOS
function saveUser(req, res) {
	var params = req.body;
	var user = new User();

	console.log("Ingresando a saveuser ...")
	if (params.role.toUpperCase() == 'ADMINISTRADOR') {
		console.log("Ingresando a saveuser primer if...")

		if (params.name && params.lastname && params.email && params.password) {
			console.log("Ingresando a saveuser segundo if ...")

			user.name = params.name.toUpperCase();
			user.lastname = params.lastname.toUpperCase();
			user.email = params.email;
			user.phone = params.phone;
			user.role = params.role.toUpperCase();
			user.image = null;
			user.active = true;
			//controlar usuario duplicado
			User.find({
				$or: [
					{ email: user.email.toLowerCase() },
					//{username: user.username.toLowerCase()},
				]
			}).exec((err, users) => {
				if (err) {
					return res.status(400).send({
						message: 'Error en la petición de usuario ' + String(err)
					});
				}

				if (users && users.length >= 1) {
					res.status(500).send({
						message: 'El usuario que intentas registrar ya existe'
					});
				} else {
					console.log('pasando validación')
					//encriptar password
					bcrypt.hash(params.password, null, null, (err, hash) => {
						user.password = hash;

						//guardar usuario
						user.save((err, userStored) => {
							if (err) {
								return res.status(400).send({
									message: 'Error en la peticion guardar el usuario ' + String(err)
								});
							}

							if (userStored) {
								//sendEmailVerification(user.email, req.get('host'));
								res.status(200).send({
									user: userStored
								});
							} else {
								res.status(500).send({
									message: 'No se ha registrado el usuario'
								});
							}
						});
					});
				}
			});
		} else {
			res.status(404).send({
				message: 'Envía todos los campos'
			});
		}

	} else if (params.role.toUpperCase() == 'CLIENTE') {

		if (params.name && params.lastname && params.email && params.phone) {
			user.name = params.name.toUpperCase();
			user.lastname = params.lastname.toUpperCase();
			user.email = params.email;
			user.role = params.role.toUpperCase();
			user.phone = params.phone;
			user.image = null;
			user.polled = false;
			user.active = true;
			//controlar usuario duplicado
			User.find({
				$or: [
					{ email: user.email.toLowerCase() },
				]
			}).exec((err, users) => {
				if (err) {
					return res.status(500).send({
						message: 'Error en la petición de nuevo cliente' + String(err)
					});
				}

				if (users && users.length >= 1) {
					res.status(200).send({
						message: 'El cliente que intentas registrar ya existe!!'
					});
				} else {
					console.log('guardando rol cliente')
					//guardar usuario
					user.save((err, userStored) => {
						if (err) {
							return res.status(500).send({
								message: 'Error al guardar cliente ' + String(err)
							});
						}

						if (userStored) {
							//sendEmailVerification(user.email, req.get('host'));
							res.status(200).send({
								status: "success",
								user: userStored
							});
						} else {
							res.status(404).send({
								message: 'No se ha registrado el cliente'
							});
						}
					});
				}
			});
		}
	}
	else {
		var rol = params.role.toLowerCase()
		console.log('Revisando rol ' + rol)
		res.status(404).send({

			message: 'Ese rol no existe..!!'
		});
	}

}


//LOGIN
function loginUser(req, res) {
	var params = req.body;
	var email = params.email;
	var password = params.password;

	console.log('Ingresando a login')
	User.findOne({ email: email, active: true }, (err, user) => {
		if (err) {
			return res.status(500).send({ message: "Error en la petición" });
		}

		if (user) {
			bcrypt.compare(password, user.password, (err, check) => {
				if (check) {
					if (params.gettoken) {
						//generar y devolver token
						return res.status(200).send({
							token: jwt.createToken(user)
						});

					} else {
						//devolver datos de usuario
						user.password = undefined; //no mostrar el password
						return res.status(200).send({ user });
					}
				} else {
					return res.status(401).send({ message: "El usuario no se ha podido identificar" });
				}
			});
		} else {
			return res.status(401).send({ message: "El usuario no se ha podido identificar!!!" });
		}
	});
}

//Eliminar Sesión
function deleteUser(req, res) {
	var userId = req.params.id

	User.findOneAndDelete({ _id: userId }, (err, user) => {
		if (err) {
			return res.status(400).send({ message: 'Error al eliminar usuario ' + String(err) });
		}
		if (!user) {
			return res.status(500).send({ message: 'Usted no puede eliminar este usuario' });
		} else {
			return res.status(200).send({
				status: "success",
				message: 'Usuario eliminado con éxito..!!'
			});
		}
	});
}


function getData(req, res) {
	var userId = req.user.sub
	console.log('Desde getData')
	User.findById({ _id: userId }, (err, user) => {
		if (err && !user) return res.status(400).send({ status: "error", message: "Eoor en la peticion" })

		if (user) {
			user.password = undefined; //no mostrar el password
			return res.status(200).send({
				status: "success",
				message: "tienes acceso",
				user: user
			})
		}
	})
}
//CONSEGUIR DATOS DE UN USUARIO
/* //antes del video 36 Async y Await
function getUser(req, res){
	var userId = req.params.id; //params para metodo get y body para metodo post
	User.findById(userId, (err, user) => {
		if (err) {
			return res.status(500).send({message:'Error en la petición'});			
		}
		if (!user) {
			return res.status(404).send({message: 'El usuario no existe'});
		}
		Follow.findOne({'user': req.user.sub, 'followed': userId}).exec((err, follow)=>{
			if (err) {
				return res.status(500).send({message: 'Error al comprobar el seguimiento'});
			}
			return res.status(200).send({user, follow});
		});
	});
}*/

//CONSEGUIR DATOS DE UN USUARIO
function getUser(req, res) {
	var userId = req.params.id; //params para metodo get y body para metodo post
	User.findById(userId, (err, user) => {
		if (err) {
			return res.status(500).send({ message: 'Error en la petición' });
		}
		if (!user) {
			return res.status(404).send({ message: 'El usuario no existe' });
		}

		user.password = undefined;
		//console.log(value);
		return res.status(200).send({
			status: "success",
			user
		});


	});
}

//Función asincrona
//identify_user_id: usuario logueado
//DEVOLVER UN LISTADO DE SOLICITUDES - PAGINADO
function getAllRequest(req, res) {
	var identify_user_id = req.user.sub;//recoger el id del usuario logueado
	var page = 1;
	var buscar = req.params.buscar;
	if (req.params.page) {
		page = req.params.page;
	}
	var itemsPerPage = 20; //cantidad de usuarios que se listaran por pagina
	Request.find({ 'active': false, }).sort('lastname').paginate(page, itemsPerPage, (err, requests, total) => {
		if (err) {
			return res.status(500).send({ message: 'Error en la petición' });
		}
		if (!requests) {
			return res.status(404).send({ message: 'No hay usuario disponibles' });
		}
		return res.status(200).send({
			requests,
			total,
			pages: Math.ceil(total / itemsPerPage)
		});
	});

}

//DEVOLVER UN LISTADO DE USUARIOS - PAGINADO
function getUsers(req, res) {
	var identify_user_id = req.user.sub;//recoger el id del usuario logueado
	var page = 1;
	var buscar = req.params.buscar;

	if (req.params.page) {
		page = req.params.page;
	}

	var itemsPerPage = 20; //cantidad de usuarios que se listaran por pagina


	User.find({ 'active': true, 'role': ['CLIENTE'] }).sort('lastname').paginate(page, itemsPerPage, (err, users, total) => {
		if (err) {
			return res.status(500).send({ message: 'Error en la petición' });
		}

		if (!users) {
			return res.status(404).send({ message: 'No hay usuario disponibles' });
		}

		return res.status(200).send({
			users,
			total,
			pages: Math.ceil(total / itemsPerPage)
		});

	});
}

function getUsersVotesAll(req, res) {
	var identify_user_id = req.user.sub;//recoger el id del usuario logueado
	var page = 1;
	var buscar = req.params.buscar;

	if (req.params.page) {
		page = req.params.page;
	}

	var itemsPerPage = 20; //cantidad de usuarios que se listaran por pagina


	User.find({ 'active': true, 'role': ['CONCEJAL', 'ALCALDE', 'VICEALCALDE'] }).sort('lastname').paginate(page, itemsPerPage, (err, users, total) => {
		if (err) {
			return res.status(500).send({ message: 'Error en la petición' });
		}

		if (!users) {
			return res.status(404).send({ message: 'No hay usuario disponibles' });
		}

		return res.status(200).send({
			users,
			total,
			pages: Math.ceil(total / itemsPerPage)
		});

	});
}

function getUserVotes(req, res) {
	var userId = req.params.id; //params para metodo get
	//.populate({ path: 'nested', populate: { path: 'deepNested' }});
	//Motion.findOne({ _id: motionId }).populate('vote').populate('vote.user').exec(function (err, motion) {

	User.findOne({ _id: userId }).populate({ path: 'motion', populate: { path: 'vote', populate: { path: 'poll' } } }).exec(function (err, user) {
		if (err) {
			return res.status(500).send({ message: 'Error en la petición' });
		}
		if (!user) {
			return res.status(404).send({ message: 'No hay votos registrados para este usuario!!' });
		}

		//console.log(value);
		return res.status(200).send({
			status: "success",
			user
		});


	});
}


//DEVOLVER UN LISTADO DE USUARIOS DE ACUERDO A LA BUSQUEDA
function searchUsers(req, res) {
	var identify_user_id = req.user.sub;//recoger el id del usuario logueado
	var page = 1;
	var search = req.params.search;
	console.log(search)
	if (req.params.page) {
		page = req.params.page;
	}

	var itemsPerPage = 6; //cantidad de usuarios que se listaran por pagina

	//User.find({'active': true, $or: [ { 'name': /.*buscar.*/ }, { 'username': /.*buscar.*/  } ]}).sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
	User.find({ 'active': true, $or: [{ 'name': new RegExp(search, 'i') }, { 'username': new RegExp(search, 'i') }] }).sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
		if (err) {
			return res.status(500).send({ message: 'Error en la petición' });
		}
		console.log(users)

		if (!users) {
			return res.status(404).send({ message: 'No hay usuario disponibles' });
		}

		return res.status(200).send({
			users,
			total,
			pages: Math.ceil(total / itemsPerPage)
		});

	});
}

//Edición de datos de usuario
function updateUser(req, res) {
	var userId = req.params.id;
	var update = req.body;

	console.log(update);

	//borrar propiedad password
	delete update.password;

	console.log(req.user.sub)
	if (!req.user.sub) {
		return res.status(500).send({ message: 'No tienes permiso para actualizar los datos del usuario' });
	}

	//controlar usuario duplicados
	User.find({
		$or: [
			{ email: update.email },
		]
	}).exec((err, users) => {
		var existe_usuario = false;

		users.forEach((user) => {
			if (user && user._id != userId) {
				existe_usuario = true;
			}
		});

		if (existe_usuario) {
			console.log('Los datos ya están en uso');
			return res.status(200).send({ message: 'Los datos ya están en uso' });
		}

		//new:true => muestra info del usuario actualizada
		//new:false => muestra info del usuario desactualizada
		User.findByIdAndUpdate(userId, {
			name: update.name.toUpperCase(),
			lastname: update.lastname.toUpperCase(),
			email: update.email,
			phone: update.phone
		}, { new: true }, (err, userUpdated) => {
			if (err) {
				return res.status(500).send({ message: 'Error en la petición' });
			}
			if (!userUpdated) {
				return res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
			}
			return res.status(200).send({
				status: "success",
				user: userUpdated,
				message: "Registro actualizado con éxito !!"
			});
		});
	});
}


//Subir archivos de imagen/avatar de usuario
function uploadImage(req, res) {
	var userId = req.params.id;

	if (req.files) { //si enviamos algun fichero
		// image corresponde al elemento del html
		var file_path = req.files.image.path; //path de la imagen que se quiere subir
		//console.log(file_path);

		var file_split = file_path.split('\\'); //cortar del path el nombre del archivo
		//console.log(file_split);

		var file_name = file_split[2]; //extrayendo el nombre de la imagen
		//console.log(file_name);

		var ext_split = file_name.split('\.');
		//console.log(ext_split);

		var file_ext = ext_split[1]; //obtener la extension del archivo
		//console.log(file_ext);

		if (userId != req.user.sub) { //el propio usuario podrá subir imagenes
			//colocar return para evitar problemas con la cabecera
			return removeFilesUploads(res, file_path, 'No tienes permiso para actualizar los datos');
		}

		if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
			//actualizar documentos de usuario	
			//new: true para que tras la actualización muestre el usuario con los datos actualizados
			//new:false para que tras la actualización muestre el usuario con los datos anteriores
			User.findByIdAndUpdate(userId, { image: file_name }, { new: true }, (err, userUpdated) => {
				if (err) {
					return res.status(500).send({ message: 'Error en la petición' });
				}

				if (!userUpdated) {
					return res.status(404).send({ message: 'No se ha podido actualizar' });
				}
				return res.status(200).send({ user: userUpdated });
			});
		} else {
			//colocar return para evitar problemas con la cabecera
			return removeFilesUploads(res, file_path, 'Extensión no válida');
		}
	} else {
		return res.status(200).send({ message: 'No se han subido imagenes' });
	}
}


function removeFilesUploads(res, file_path, message) {
	fs.unlink(file_path, (err) => { //callback
		return res.status(200).send({ message: message });
	});
}


//obtener la imagen
function getImageFile(req, res) {
	var image_file = req.params.imageFile; //imageFile será un campo del formulario
	var path_file = "./uploads/users/" + image_file;

	fs.exists(path_file, (exists) => {
		if (exists) {
			res.sendFile(path.resolve(path_file));
		} else {
			res.status(200).send({ message: 'No existe la imagen ...' });
		}
	});
}


function sendEmailVerification(email, hostname) {
	console.log('okokkk');
	console.log(hostname);
	console.log(email);

	rand = Math.floor((Math.random() * 100) + 54);
	host = hostname.split(':');
	console.log(host[0]);
	link = 'http://' + host[0] + ':4200/';

	link = link + "verify?id=" + rand;
	email_usuario = email;
	mailOptions = {
		to: email,
		subject: "Por favor confirme su cuenta de correo electrónico",
		//html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"	
		html: "<h3> Haga clic en el enlace para verificar su correo electrónico. <br> <a href=" + link + "> Haga clic aquí para verificar </h3>"
	}

	console.log(mailOptions);
	smtpTransport.sendMail(mailOptions, function (error, response) {
		if (error) {
			console.log('ocurre eeeee un error');
			console.log('ocurre un error');
			console.log(error);
		} else {
			console.log(message)
			console.log("Message sent: " + response.message);
		}
	});

	console.log('whats up');

}

function verificationEmail(req, res) {
	//console.log(req.query.id);
	//console.log('');
	//console.log(email_usuario);
	//console.log('');

	//console.log(req.protocol+":/"+req.get('host'));
	//if((req.protocol+"://"+req.get('host'))==("http://"+host)){
	//console.log("Domain is matched. Information is from Authentic email");
	if (req.query.id == rand) {
		//console.log("email is verified");

		User.find({ email: email_usuario.toLowerCase() }).exec((err, users) => {
			if (err) {
				return res.status(500).send({
					message: 'Error en la petición de usuario ' + String(err)
				});
			}

			if (users && users.length >= 1) {
				/*console.log('')
				console.log(users[0]._id)
				console.log('')*/
				User.findByIdAndUpdate(users[0]._id, { $set: { active: true } }, { new: true }, (err, userUpdated) => {
					if (err) {
						return res.status(500).send({ message: 'Error en la petición' });
					}
					if (!userUpdated) {
						return res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
					}
					return res.status(200).send({ user: userUpdated });
				});
			}
		});
	}
	else {
		console.log("email is not verified");
		return res.status(404).send({ message: 'email is not verified' });
		//res.end("<h1>Bad Request</h1>");
	}
}


//RECUPERAR CUENTA
function sendEmailRecuperarCuenta(req, res) {
	var params = req.body;
	var email = params.email;
	var hostname = req.get('host')

	rand = Math.floor((Math.random() * 100) + 54);
	host = hostname.split(':');
	link = 'http://' + host[0] + ':4200/';

	console.log(params)
	console.log(email)
	console.log(hostname)


	link = link + "restablecer_cuenta?id=" + rand;
	console.log(link)
	//email_usuario = email;
	mailOptions = {
		to: email,
		subject: "Restrablecer contraseña",
		html: "<h3> Haga clic en el enlace para restablecer su contraseña. <br> <a href=" + link + "> Haga clic aquí </h3>"
	}
	smtpTransport.sendMail(mailOptions, function (error, response) {
		if (error) {
			console.log('ocurre un error sendEmailRecuperarCuenta');
			console.log(error);
			return res.status(500).send({ message: 'Error en la petición sendEmailRecuperarCuenta' });
		} else {
			//console.log(message)
			//console.log("Message sent: " + response);
			return res.status(200).send({ ok: 'mensaje enviado' });
		}
	});
}

function restablecerCuenta(req, res) {
	var params = req.body;
	var email = params.email;
	var password;

	console.log(req.query.id)

	if (req.query.id == rand) {
		User.find({ email: email }).exec((err, users) => {
			if (err) {
				return res.status(500).send({
					message: 'Error en la petición de recuperarCuenta .. ' + String(err)
				});
			}

			//console.log(users)
			//console.log(users.email)

			if (users && users.length >= 1) {

				//encriptar password
				bcrypt.hash(params.password, null, null, (err, hash) => {
					password = hash;

					User.findByIdAndUpdate(users[0]._id, { $set: { password: password } }, { new: true }, (err, userUpdated) => {
						if (err) {
							return res.status(500).send({ message: 'Error en la petición recuperarCuenta ...' });
						}
						if (!userUpdated) {
							return res.status(404).send({ message: 'No se ha podido restablecer la cuenta' });
						}
						return res.status(200).send({ user: userUpdated });
					});
				});
			}
		});
	}
	else {
		console.log("email is not verified");
		return res.status(200).send({ message: 'email is not verified' });
		//res.end("<h1>Bad Request</h1>");
	}
}


//Actualizar clave
function changePassword(req, res) {
	var old_password = req.params.old_password;
	var new_password = req.params.new_password;
	var userId = req.params.id;

	console.log(old_password)
	console.log(new_password)
	console.log(userId)

	User.findOne({ _id: userId, active: true }, (err, user) => {
		if (err) {
			return res.status(500).send({ message: "Error en la petición" });
		}

		if (user) {
			//old_password no está encriptada
			//user.password está encriptada
			//para comparar la contraseña usar bcrypt.compare ya que compara una password encriptada (de la BD) y otra sin encriptar (que viene desde el formulario)
			bcrypt.compare(old_password, user.password, (err, check) => {
				if (check) {
					/*if (params.gettoken) {
						//generar y devolver token
						return res.status(200).send({
							token: jwt.createToken(user)
						});

					}else{
						//devolver datos de usuario
						user.password = undefined; //no mostrar el password
						return res.status(200).send({user});					
					}*/

					//encriptar password
					bcrypt.hash(new_password, null, null, (err, hash) => {
						user.password = hash;

						//guardar usuario
						user.save((err, userStored) => {
							if (err) {
								return res.status(500).send({
									message: 'Error al guardar el usuario ' + String(err)
								});
							}

							if (userStored) {
								sendEmailVerification(user.email, req.get('host'));
								res.status(200).send({
									user: userStored
								});
							} else {
								res.status(404).send({
									message: 'No se ha registrado el usuario'
								});
							}
						});
					});
				} else {
					return res.status(404).send({ message: "El usuario no se ha podido identificar" });
				}
			});
		} else {
			return res.status(404).send({ message: "El usuario no se ha podido identificar!!!" });
		}
	});
}


module.exports = {
	home,
	pruebas,
	saveUser,
	saveRequest,
	loginUser,
	getData,
	getAllRequest,
	getUser,
	getUsers,
	getUserVotes,
	getUsersVotesAll,
	searchUsers,
	updateUser,
	deleteUser,
	uploadImage,
	getImageFile,
	sendEmailVerification,
	verificationEmail,
	sendEmailRecuperarCuenta,
	restablecerCuenta,
	changePassword
}