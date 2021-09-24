'use strict'

var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var Poll = require('../models/poll'); //cargar el modelo usuario
var User = require('../models/user'); // cargar modelo de usuario
var Session = require('../models/service'); // cargar modelo de usuario
var Motion = require('../models/associate')
var Vote = require('../models/vote');
var mongoose = require('mongoose')
var moment = require ('moment')

var total = 0;

async function countVote(user_id){
	try {
        console.log('Desde countPoll')
        var numVote = await Vote.countDocuments({ user: user_id }).exec();
            /* .then((numPolls) => {
                console.log('contando ', numPolls)
                return numVote;
            })
            .catch((err) => {
                console.log(err)
                return handleError(err);
            }); */
        
        console.log('Contador contando' + numVote)
        return numVote

    } catch (e) {
        console.log(e);
    }
}

async function getUserPolled(userId) {

    try {
        console.log('Desde getUserPolled')
        var userUp = await User.findOne({ $and: [{_id:userId}, {polled: false}]}).exec()
        .then((userUp) => {
            console.log(userUp)
            return userUp;
        })
        .catch((err) => {
            return handleError(err)
        });

        return userUp
    
    } catch (error) {
        console.log(error)
    }

    
}

async function countVoteOrdinary(voteId) {
    
    try {
        var numTypes = await Vote.countDocuments({_id: voteId}, {type_poll: 'ORDINARIA'}).exec((err, cont) => {
        }).then((cont) => {

            return cont
        }).catch((err) => {
            return handleError(err)
        })

        return numTypes
    } catch (error) {
        console.log(error)
    }
}
async function countVoteNominative(voteId) {
    
    try {
        var numTypes = await Vote.countDocuments({_id: voteId}, {type_poll: 'NOMINATIVA'}).exec((err, cont) => {
        }).then((cont) => {

            return cont
        }).catch((err) => {
            return handleError(err)
        })

        return numTypes
    } catch (error) {
        console.log(error)
    }
}
async function countVoteNominal(voteId) {
    
    try {
        var numTypes = await Vote.countDocuments({_id: voteId}, {type_poll: 'NOMINAL RAZONADA'}).exec((err, cont) => {
        }).then((cont) => {

            return cont
        }).catch((err) => {
            return handleError(err)
        })

        return numTypes
    } catch (error) {
        console.log(error)
    }
}
//REGISTRAR VOTO DE USUARIOS
function saveVote(req, res){
   
    var params = req.body;
    //var motion = new Motion();
    console.log('desde save vote ')
    if (params.type_poll && params.user && params.session && params.motion && params.poll && params.options) {
        
        var motionId = params.motion
        var userId = params.user
        console.log('guardando voto relacionada a una sesion, votacion y persona')
        
        // verificar si usuario ya ha registrado su voto
        Vote.findOne({motion: motionId, user: userId }).exec( (err, votes) => {

            console.log('objetos votes', votes)
            if (err) {
                return res.status(400).send({
                    message: 'Error en la petición para registro voto a este usuario '  + String(err)
                }); 
            }
            
            if (votes) {
                res.status(500).send({
                    message: 'Este usuario ya ha registrado su voto!!'
                });
            }else{  
                
                //guardar voto   
                Motion.findOne({ _id: motionId }).exec(function (err, motion) {
                    if (err) {
                        return res.status(400).send({
                            message: 'Error en la petición de mocion '  + String(err)
                        }); 
                    }

                    else if (!motion) {
                        res.status(500).send({
                            message: 'Intentas registrar el voto de una moción que no éxiste!!'
                        });
                    }else{

                        var vote = new Vote()
                        vote._id = new mongoose.Types.ObjectId(),
                        vote.type_poll = params.type_poll.toUpperCase(),
                        vote.options = params.options.toUpperCase(),
                        vote.active = true,
                        vote.session = params.session,
                        vote.motion = params.motion,
                        vote.user = params.user    
                        vote.poll = params.poll 
    
                    
                        if (motion) {
                            motion.vote.push(vote)
                            motion.save()
                        }
                        
                        //var prueba = await vote.save();
                        //console.log('pruebaa', prueba)
                        var type = params.type_poll.toUpperCase()
                        var pollId = vote.poll
                
                        Poll.findById(pollId).exec((err, polls) => {

                            console.log('objetos polls', polls)
                            if (err) {
                                return res.status(400).send({
                                    message: 'Error en la petición para registro voto a este usuario '  + String(err)
                                }); 
                            }
                            
                            else if (polls.type_poll == null || polls.type_poll == type) {

                                vote.save((err, vote) => {
                                    console.log('Errorrrrr', vote)
                                    countVote(userId).then((value) => {
                                        console.log('Contando voto')
                                        
                                        total = total + value    
                                        Poll.findByIdAndUpdate(pollId, { $set: {type_poll: type, cont_poll:value, cont_total: total}}, {new:true}, (err, pollUpdated) => {
                                            //User.findByIdAndUpdate(userId, { $set: {polled: true}}, {new:true}, (err, userUpdated) => {
                                                console.log('value ' + value)
                                                if (err) {
                                                    return res.status(400).send({message: 'Error en la petición'});
                                                }
                                                if (!pollUpdated) {
                                                    return res.status(500).send({message: 'No se ha podido registrar voto'});
                                                }
                                                return res.status(200).send({
                                                    status: 'success',
                                                    votes: vote, 
                                                    //user: userUpdated,
                                                    polls: pollUpdated,
                                                    total_votos: total,
                                                    num_votos_tipo: value,
                                                    message: "Voto registrado con éxito..!!"
                                                });
                                            //})
                                        })
            
                                    })
                                })
                               
                            }else{
                                res.status(500).send({
                                    message: 'No puede enviar voto con ese tipo de votación!!'
                                });
                            }
                            
                        })
                        
                    }
                   
                })

            }
        })
                
    }else{
  
		res.status(404).send({
			message: 'Envía todos los campos'
		});
	}
}


function getVoteUser(req, res){
	var voteId = req.params.id; //params para metodo get y body para metodo post
	Vote.findOne({ _id: voteId }).populate('user').exec(function (err, vote) {
		if (err) {
			return res.status(500).send({message:'Error en la petición'});			
		}
		if (!vote) {
			return res.status(404).send({message: 'La moción no existe'});
		}
	
		//console.log(value);
		return res.status(200).send({
            status: "success",
            vote
		});
		

	});
}

function getVoteReport(req, res){
    var voteId = req.params.vote_id; //params para metodo get
    var userId = req.params.user_id

    Vote.find({_id: voteId}).exec( async function (err, vote) {
        if (err) {
            console.log(err)
            return res.status(400).send({message:'Error en la petición de vote ' + String(err)});			
		}
		if (!vote) {
			return res.status(404).send({message: 'Voto no existe!!'});
		}
        //console.log(value);
        var contOrdinary = await countVoteOrdinary(voteId).then((cont_ord) => {

            
        })
        

        
    })
	
}
module.exports = {
    saveVote,
    getVoteUser,
    getVoteReport

  
}
