//utilizar nuevas características de javascript
'use strict'

var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var Poll = require('../models/poll'); //cargar el modelo usuario
var User = require('../models/user'); // cargar modelo de usuario
//var Session = require('../models/session'); // cargar modelo de usuario
//var Motion = require('../models/motion')
var Service = require('../models/service')
var mongoose = require('mongoose')
var moment = require ('moment')

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


//REGISTRAR USUARIOS
function saveMotion(req, res){
    var userId= req.user.sub;
    var params = req.body; //body para metodo post
  
    console.log('desde save mocion ')
    if (params.text && params.id) {
        
        var sessionId = params.id
        var cont=0
        for (let index = 1; index <= sessionId.length; index++) {
            cont=cont+1
        }

        console.log('desde cont ' + cont)
        if (cont<24 || cont>24){
		    return res.status(500).send({message: 'Id no valido'});
        }
        
        console.log(sessionId)
        Service.findOne({ $or: [
            {_id: sessionId},
            ]}).exec( (err, service) => {
                console.log(service)
                if (err) {
                    return res.status(400).send({
                        message: 'Error en la petición de sesión '  + String(err)
                    }); 
                }

                else if (!service || service.length == 0) {
                    res.status(500).send({
                        message: 'Intentas registrar un tipo de servicio en un servicio que no éxiste!!'
                    });
                }else{
                    console.log('guardando tipo de servcio relacionado al servicio: '+service)
                    //guardar mocion
                    var motion = new Motion()
                    motion._id = new mongoose.Types.ObjectId(),
                    motion.text = params.text,
                    motion._session = params.id,
                    motion.active = true
                    
                    if (session) {
                        // The below two lines will add the newly saved review's 
                        // ObjectID to the the User's reviews array field
                        session.motions.push(motion)
                        session.save();
                    }
                    
                    motion.save(function (err,motion) {
                        if (err) return res.status(400).send({
                            status: "error",
                            message: "Error en la petición.. " + String(err)

                        })
                        
                        var poll = new Poll({
                            type_poll: null,
                            cont_total: 0,
                            cont_poll: 0,
                            motion: motion._id    // assign the _id from the person
                        });

                                                
                        poll.save(function (err, poll) {
                            if (err) return res.status(400).send({
                                status: "error",
                                message: "Error en la petición.. " 

                            })
                            // thats it!
                            if (!poll) {
                                return res.status(500).send({message: 'No se ha podido registrar la moción'});
                            }

                            Motion.findByIdAndUpdate(motion._id, { $set: { poll: poll._id}}, {new:true}, (err, motionUpdate) => {
                                if (err) {
                                    return res.status(404).send({message: 'Error en la petición'});
                                }
                                if (!motionUpdate) {
                                    return res.status(500).send({message: 'No se ha podido actualizar campo poll en mocion'});
                                }
                                return res.status(200).send({
            
                                    status: "success",
                                    motion: motion,
                                    poll: poll,
                                    message: "Moción registrada con éxito..!!"
                                })
                            })
                        });
                    });
                }
            });
    }else{
  
		res.status(404).send({
			message: 'Envía todos los campos'
		});
	}
}

//Edición de datos de usuario
function updateMotion(req, res){
    var motionId = req.params.id;
    var userId = req.user.sub;
	var update_text = req.body;

	console.log(motionId);
	console.log(update_text.text);

	if (userId != req.user.sub) {
		return res.status(500).send({message: 'No tienes permiso para actualizar este registro'});
	}


    Motion.findByIdAndUpdate(motionId,{ $set: { text: update_text.text}}, {new:true}, (err, motionUpdated) => {
        if (err) {
            return res.status(500).send({message: 'Error en la petición'});
        }
        if (!motionUpdated) {
            return res.status(404).send({message: 'No se ha podido actualizar el usuario'});
        }
        return res.status(200).send({
            status: 'success',
            motion: motionUpdated,
            message: "Moción actualizada con éxito.."
        });
    });
		
}

//Eliminar Moción
function deleteMotion(req, res){
	var motionId = req.params.id

	Motion.findOneAndDelete({_id: motionId}, (err, motion) => {
		if (err) {
			return res.status(400).send({message: 'Error al eliminar la moción'});
		}		
		if (!motion) {
			return res.status(500).send({message: 'Usted no puede eliminar esta moción'});
		}else{
			return res.status(200).send({
                status: "success",
                message: 'La moción se ha eliminado'
            });
		}
	});
}

//CONSEGUIR DATOS DE UNA SESION EN ESPECIFICO
function getMotion(req, res){
	var motionId = req.params.id; //params para metodo get y body para metodo post
	Motion.findOne({ _id: motionId }).populate('_session').exec(function (err, motion) {
		if (err) {
			return res.status(500).send({message:'Error en la petición'});			
		}
		if (!motion) {
			return res.status(404).send({message: 'La moción no existe'});
		}
	
		//console.log(value);
		return res.status(200).send({
            status: "success",
            motion
		});
		

	});
}

function getMotionVote(req, res){
	var motionId = req.params.id; //params para metodo get y body para metodo post
	Motion.findOne({ _id: motionId }).populate('vote').exec(function (err, motion) {
		if (err) {
			return res.status(500).send({message:'Error en la petición'});			
		}
		if (!motion) {
			return res.status(404).send({message: 'La moción no existe'});
		}
	
		//console.log(value);
		return res.status(200).send({
            status: "success",
            motion
		});
		

	});
}

function getVoteUserMotion(req, res){
    var motionId = req.params.id; //params para metodo get
    //.populate({ path: 'nested', populate: { path: 'deepNested' }});
	//Motion.findOne({ _id: motionId }).populate('vote').populate('vote.user').exec(function (err, motion) {
    
    Motion.findOne({ _id: motionId }).populate({ path: 'vote', populate: { path: 'user' }}).exec(function (err, motion) {
		if (err) {
			return res.status(500).send({message:'Error en la petición'});			
		}
		if (!motion) {
			return res.status(404).send({message: 'La moción no existe'});
		}
	
		//console.log(value);
		return res.status(200).send({
            status: "success",
            motion
		});
		

	});
}

function getMotionPoll(req, res){
	var motionId = req.params.id; //params para metodo get y body para metodo post
	Motion.findOne({ _id: motionId }).populate('_session').populate('poll').exec(function (err, motion) {
		if (err) {
			return res.status(500).send({message:'Error en la petición'});			
		}
		if (!motion) {
			return res.status(404).send({message: 'La moción no existe'});
		}
	
		//console.log(value);
		return res.status(200).send({
            status: "success",
            motion
		});
		

	});
}

//DEVOLVER UN LISTADO DE votaciones - PAGINADO
function getMotions(req, res){
	var identify_user_id = req.user.sub;//recoger el id del usuario logueado
	var page = 1;
	var buscar = req.params.buscar;
	
	if (req.params.page) {
		page = req.params.page;
	}

	var itemsPerPage = 20; //cantidad de sesiones que se listaran por pagina
    console.log('listar mocion..')
	Motion.find({'active': true}).sort('-date').populate('_session').paginate(page, itemsPerPage, (err, motions, total) => {
		if (err) {
			return res.status(500).send({message: 'Error en la petición'});
		}

		if (!motions) {
			return res.status(404).send({message: 'No hay moicones '});			
		}
        
        return res.status(200).send({
            status: "success",
            motions: motions,
            total,
            pages: Math.ceil(total/itemsPerPage)
        });
		
	});
}


function searchMotions(req, res){
	var identify_user_id = req.user.sub;//recoger el id del usuario logueado
	var page = 1;
	var search = req.params.search;
	console.log(search)
	if (req.params.page) {
		page = req.params.page;
	}

	var itemsPerPage = 6; //cantidad de usuarios que se listaran por pagina

	//User.find({'active': true, $or: [ { 'name': /.*buscar.*/ }, { 'username': /.*buscar.*/  } ]}).sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
	Motion.find({'active': true, $or: [ { 'text': new RegExp(search, 'i') }]}).sort('date').paginate(page, itemsPerPage, (err, motions, total) => {
		if (err) {
			return res.status(500).send({message: 'Error en la petición'});
		}
		console.log(motions)

		if (!motions) {
			return res.status(404).send({message: 'No hay mociones disponibles'});			
		}

		return res.status(200).send({
            status: "success",
			motions,
			total,
			pages: Math.ceil(total/itemsPerPage)
		});
		
	});
}

module.exports = {
    saveMotion,
    getMotion,
    getMotions,
    getMotionPoll,
    getMotionVote,
    getVoteUserMotion,
    updateMotion,
    deleteMotion,
    searchMotions
}
