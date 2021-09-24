//utilizar nuevas características de javascript
'use strict'

var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var Poll = require('../models/poll'); //cargar el modelo usuario
var User = require('../models/user'); // cargar modelo de usuario
var Associate = require('../models/associate')
var Service = require('../models/service')
var mongoose = require('mongoose')
var moment = require('moment');

var fs = require('fs'); //libreria file sistem de node
var path = require('path'); //permite trabajar con rutas de sistemas de ficheros

async function countPoll(user_id){
	try {
        var numPolls = await Poll.countDocuments({ user: user_id }).exec()
            .then((numPolls) => {
                return numPolls;
            })
            .catch((err) => {
                return handleError(err);
            });

        return numPolls

    } catch (e) {
        console.log(e);
    }
}

async function getMotionUser(act) {

    try {
        console.log('Desde getMotionUser')
        var userUp = await Session.findOne({act: act}).exec()
        
        console.log('devuelve' + userUp)
        return userUp
    
    } catch (error) {
        console.log(error)
    }

    
}


async function validateAct (act) {
    var num = await isNaN(act)
    if( num === true){
        console.log('No es numero' + num) 
    }
    return num
}

async function getActSession (act) {
    try {
        var session = await Session.findOne({act: act}).exec()
                
        return session
    }   
    catch (error) {
        console.log(error)
    }
}

async function getValidateActSession(numMax){
    try {
        console.log('Desde getValidateActSession')
        var num = await Session.findOne({act: numMax}).sort('act').exec()
            .then((numMax) => {
                console.log('Este es el numero max de sesiones registradas', numMax)
                return numMax;
            })
            .catch((err) => {
                console.log(err)
                return handleError(err);
            });
        return num
    }   
    catch (error) {
        console.log(error)
    }
}

//BUSCAR SERVICIO PARA PODER GUARDAR UN NNUEVO SERVICIO 
async function getServiceSubservice(id){
    try {
        console.log('Desde getServiceSubservice')
        var num = await Service.findOne({_id: id}).exec()
            .then((service) => {
                console.log('Este es el servicio del subservicio a registrar', service)
                return service;
            })
            .catch((err) => {
                console.log(err)
                return handleError(err);
            });
        return num
    }   
    catch (error) {
        console.log(error)
    }
}

//DEVOLVER UN LISTADO DE SERVICIOS - PAGINADO POPULADO
function getServices(req, res){

  //console.log(req)
    console.log('listar servicios.. ingresando!!')
	//var identify_user_id = req.user.sub;//recoger el id del usuario logueado
	var page = 1;
	var buscar = req.params.buscar;
	
	if (req.params.page) {
		page = req.params.page;
	}

	var itemsPerPage = 20; //cantidad de sesiones que se listaran por pagina
    console.log('listar servicios..')
	Service.find({active: true}).sort('-date').populate('optservices').paginate(page, itemsPerPage, (err, services, total) => {
		console.log("desde la function callback")
        if (err) {
			return res.status(500).send({message: 'Error en la petición'});
		}

        
		if (!services) {
            return res.status(404).send({message: 'No hay servicios!! '});			
		}
        
        //console.log("data services ", services)
        //return console.log("data services ", services)
        return res.status(200).send({
            status: "success",
            services: services,
            total,
            pages: Math.ceil(total/itemsPerPage)
        }); 
		
	});
}

//REGISTRAR SERVICIO CON MODELO ACTUALIZADO
function saveService(req, res){
    var params = req.body 
    
    console.log("Desde saveService...", params)
    console.log("Id de servicio para registrar subservicio...", params.id)
    var serviceId = params.id
    
    try {

        if(params.id){
            console.log("guardando subservicios en servicio ", params.name)
            
            getServiceSubservice(serviceId).then((service) =>{
                if(service){
                    service.optservices.push(params.optservices);
                    service.save(done);
                    return res.status(200).send({
                        status: "success",
                        optservices: service.optservices
                    })
                }
                else{
                    return res.status(200).send({
                        status: "error",
                        message: "Error al registrar subservicio!!, revisar envío"
                    })
                }

            })
        }


        if(params.name && params.description){
            console.log("Desde saveService...", params)

            var service = new Service();
            service._id = new mongoose.Types.ObjectId(),
            service.id = service._id
            service.name= params.name
            service.description= params.description
            service.active= true
            service.optservices = params.optservices
            service.created_at=  moment().unix(),
            
            console.log("Esyto tiene servicio para guardar.. ", service)
            Service.find({ $or: [
				{name: service.name.toLowerCase()},
				]}).exec( (err, services) => {
                    console.log("Console log2")

                    if(err){
                        res.status(500).send({
                            status: "error",
                            message: "Error en la petición"
                        })
                    }
                    if (services && services.length >= 1 ) {
                         console.log("Console log3")

                        res.status(500).send({
                            message: 'El servicio que intentas registrar ya existe!!'
                        });
                    }else{

                        //guardar servicio
						service.save((err, service) => {
                        console.log("Console log4")

							if (err) {
								return res.status(400).send({
                                    status:"error",
									message: 'Error en la peticion guardar el servicio ' + String(err)
								});
							}

                            else if (!service) {
                                return res.status(500).send({message: 'No se ha podido registrar el servicio'});
                            }
            
                            else{
                                return res.status(200).send({
                                    status: "success",
                                    service: service
                                })
                            }
						});

                    }

                })
        }
    } catch (error) {
        res.status(500).send({
            status: "error",
            message: "Error al enviar datos!!"
        })
    }
}

//GUARDAR SUBSERVICE


//REGISTRAR SERVICIOS CON MODELO ORIGINAL
/* function saveService(req, res){
    var params = req.body 

    console.log("Desde saveService...", params)
    try {
        if(params.name && params.description){
            var service = new Service();
            service._id = new mongoose.Types.ObjectId(),
            service.name= params.name
            service.description= params.description
            service.active= true
            service.created_at=  moment().unix(),
            

            console.log("Console log1")
            Service.find({ $or: [
				{service: service.name.toLowerCase()},
				]}).exec( (err, services) => {
                    console.log("Console log2")

                    if(err){
                        res.status(500).send({
                            status: "error",
                            message: "Error en la petición"
                        })
                    }
                    if (services && services.length >= 1 ) {
                         console.log("Console log3")

                        res.status(500).send({
                            message: 'El servicio que intentas registrar ya existe!!'
                        });
                    }else{
                        //guardar servicio
						service.save((err, service) => {
                        console.log("Console log4")

							if (err) {
								return res.status(400).send({
                                    status:"error",
									message: 'Error en la peticion guardar el servicio ' + String(err)
								});
							}

                            else if (!service) {
                                return res.status(500).send({message: 'No se ha podido registrar el servicio'});
                            }
            
                            else{
                                return res.status(200).send({
                                    status: "success",
                                    service: service
                                })
                            }
						});

                    }

                })
        }
    } catch (error) {
        res.status(500).send({
            status: "error",
            message: "Error al enviar datos!!"
        })
    }
} */


 function getNumMaxSession(req, res) {
    
    Service.find().sort('-act').select('act').exec((err, act) => {
        if(err){
            return res.status(400).send({
                status: "error",
                message: "Error en la peticion de obtener el numero de acta"
            })
        }
        if(act){

            const element = [];
            var num_act = 0
            for (let index = 1; index <= act.length; index++) {
                if(index === 1){
                    element.push(act[0].act)
                    num_act = element[0] + 1
                    console.log('Esto hay en element', num_act)
                }
            }
        
        }
    })
}
//CONSEGUIR DATOS DE UN SERVICIO EN ESPECIFICO
function getService(req, res){
    console.log("ingresando a obtener servicio en especifico..")
    var servicioId = req.params.id;

    console.log("id por parametro: ", servicioId)
    //var asociateId = req.params.idassociate //params para metodo get y body para metodo post

	Service.findOne({ _id: servicioId}).populate('optservices').exec(function (err, service) {
		if (err) {
			return res.status(500).send({message:'Error en la petición'});			
        }
        
		if (!service) {
			return res.status(404).send({message: 'El servicio no existe'});
		}
	
		//console.log(value);
		return res.status(200).send({
            status: "success",
            service
		});
		

	});
}


//ACTUALIZAR SERVICIO
function updateService(req, res){
    var serviceId = req.params.id;
    var userId = req.user.sub;
	var update_text = req.body;

	console.log(serviceId);
	console.log(update_text);



	if (userId != req.user.sub) {
		return res.status(500).send({message: 'No tienes permiso para actualizar este registro'});
    }
    
    if (update_text.name && update_text.description) {
        
        
        //if(update_text.optservices.length >=1) {
            
            Service.findOne({_id: serviceId}).exec((err, service) => {
                if (err) {
                    return res.status(500).send({message: 'Error en la peticion para actualizar servicio'});
                }
                else if (service == null ) {
                    return res.status(404).send({message: 'Ese servicio no existe!!'});
                }
                else{
                    if (update_text.optservices==null) {
                        Service.findByIdAndUpdate(serviceId,{ $set: { 
                            name: update_text.name,
                            description: update_text.description                        
                        }}, {new:true}, (err, serviceUpdated) => {
                            if (err) {
                                return res.status(500).send({message: 'Error en la petición de actualizar servicio'});
                            }
                            if (!serviceUpdated) {
                                return res.status(404).send({message: 'No se ha podido actualizar el servicio'});
                            }
    
                            return res.status(200).send({
                                status: 'success',
                                service: serviceUpdated,
                                message: "Servicio actualizado con éxito..!!"
                            });
                        });
                        
                    }else{
                        Service.findByIdAndUpdate(serviceId,{ $set: { 
                            name: update_text.name,
                            description: update_text.description,
                            optservices: update_text.optservices
                        
                        }}, {new:true}, (err, serviceUpdated) => {
                            if (err) {
                                return res.status(500).send({message: 'Error en la petición de actualizar servicio'});
                            }
                            if (!serviceUpdated) {
                                return res.status(404).send({message: 'No se ha podido actualizar el servicio'});
                            }
    
                            return res.status(200).send({
                                status: 'success',
                                service: serviceUpdated,
                                message: "Servicio actualizado con éxito..!!"
                            });
                        });
                    }

                  
                }
            })

/*         }else{
            return res.status(404).send({
                status: 'warning',
                message: "No ha enviado datos para actualizar!!"
            });
        }
 */
    }else{
        return res.status(404).send({
            status: 'warning',
            message: "Envía todos los campos!!"
        });
    }



		
}
function uploadImage(req, res){
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
			User.findByIdAndUpdate(userId, {image: file_name}, {new:true}, (err, userUpdated) => {
				if (err) {
					return res.status(500).send({message: 'Error en la petición'});
				}

				if (!userUpdated) {
					return res.status(404).send({message: 'No se ha podido actualizar'});
				}
				return res.status(200).send({user: userUpdated});
			});
		}else{
			//colocar return para evitar problemas con la cabecera
			return removeFilesUploads(res, file_path, 'Extensión no válida');
		}
	}else{
		return res.status(200).send({message: 'No se han subido imagenes'});
	}
}
//Eliminar Servicio
function deleteService(req, res){
	var servicioId = req.params.id

	Service.findOneAndDelete({_id: servicioId}, (err, service) => {
		if (err) {
			return res.status(400).send({message: 'Error al eliminar este servicio ' + String(err)});
		}		
		if (!service) {
			return res.status(500).send({message: 'Usted no puede eliminar este servicio'});
		}else{
			return res.status(200).send({
                status: "success",
                message: 'El servicio se ha eliminado con éxito..!!'
            });
		}
	});
}

/*

//DEVOLVER UN LISTADO DE votaciones - PAGINADO
function getSessions(req, res){
	var identify_user_id = req.user.sub;//recoger el id del usuario logueado
	var page = 1;
	var buscar = req.params.buscar;
	
	if (req.params.page) {
		page = req.params.page;
	}

	var itemsPerPage = 20; //cantidad de sesiones que se listaran por pagina
    console.log('listar sesion..')
	Session.find({'active': true}).sort('-date').populate('motions').paginate(page, itemsPerPage, (err, sessions, total) => {
		if (err) {
			return res.status(500).send({message: 'Error en la petición'});
		}

		if (!sessions) {
			return res.status(404).send({message: 'No hay sesiones '});			
		}
        
        return res.status(200).send({
            status: "success",
            sessions: sessions,
            total,
            pages: Math.ceil(total/itemsPerPage)
        });
		
	});
}
 */

module.exports = {
    saveService,
    updateService,
    getService,
    getServices,
    deleteService

  /*  getSession,
    getSessions,
    getNumMaxSession,
    updateSession,
    deleteSesion*/
}