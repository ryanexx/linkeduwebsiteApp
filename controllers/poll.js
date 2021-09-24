//utilizar nuevas características de javascript
'use strict'

var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var Poll = require('../models/poll'); //cargar el modelo usuario
var User = require('../models/user'); // cargar modelo de usuario

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


//REGISTRAR VOTACIONES
function savePoll(req, res){
    var userId= req.user.sub
    var params = req.body;
	var poll = new Poll();

	if (params.motion && params.options && params.type) {
        poll.motion = params.motion;
        poll.type_poll = params.type;
        poll.options = params.options;
        poll.active = true;
        

        User.find({$and: [{_id:userId},{polled:true}]}).exec((err,users)=>{
            var user_polled = users.length
            if(err){
                return res.status(404).send({
                    status: "error",
                    message: "Error en la peticion"
                })
            }
            else if(users==undefined){
                return res.status(500).send({
                    status: "error",
                    message: "no hay voto realizado por este usuario..."
                })
            }
            else{
                if(user_polled == 1){
                    return res.status(200).send({
                        message: 'Usuario ya registró su voto'
                    })
                }else{

                    //guardando pedido
                    poll.save((err, pollStored) => {
                        //contador de pedidos realizados para asignar cupon
                        //obtener el numero de pedidos que ha realizado un usuario en especifico
                        console.log('en store poll')
                        //actualiza el campo cupon de usuario a 0
                        User.findByIdAndUpdate(userId, { $set: { mypoll: params.options, polled: true}}, {new:true}, (err, userUpdated) => {
                            if (err) {
                                return res.status(404).send({message: 'Error en la petición'});
                            }
                            if (!userUpdated) {
                                return res.status(500).send({message: 'No se ha podido actualizar cupon para usuario'});
                            }
                            return res.status(200).send({
                                status: 'success',
                                user: userUpdated, 
                                poll: pollStored, 
                                message: "Votacion realizada con éxito..!!"
                            });
                        });
                        
                    });		
                }
            }
        })
	}else{
		res.status(200).send({
			message: 'Envía todos los campos'
		});
	}
}
// Listar votacion en especifico
function getPoll(req, res){
	var pollId = req.params.id; //params para metodo get y body para metodo post
	Poll.findOne({ _id: pollId }).populate('motion').exec(function (err, poll) {
		if (err) {
			return res.status(500).send({message:'Error en la petición'});			
		}
		if (!poll) {
			return res.status(404).send({message: 'La votacion no existe'});
		}
	
		//console.log(value);
		return res.status(200).send({
            status: "success",
            poll
		});
		
	});
}

//DEVOLVER UN LISTADO DE votaciones - PAGINADO
function getPolls(req, res){
	var identify_user_id = req.user.sub;//recoger el id del usuario logueado
	var page = 1;
	var buscar = req.params.buscar;
	
	if (req.params.page) {
		page = req.params.page;
	}

	var itemsPerPage = 6; //cantidad de usuarios que se listaran por pagina
    console.log('antes de buscar')
	Poll.find({'active': true}).sort('_id').paginate(page, itemsPerPage, (err, polls, total) => {
		if (err) {
			return res.status(500).send({message: 'Error en la petición'});
		}

		if (!polls) {
			return res.status(404).send({message: 'No hay votos '});			
		}
        console.log('pasando a contar')
		countPoll(identify_user_id).then((value)=>{
			return res.status(200).send({
				polls,
				num_polls: value, 
				total,
				pages: Math.ceil(total/itemsPerPage)
			});
		});
	});
}


module.exports = {
    savePoll,
    getPoll,
    getPolls
}
