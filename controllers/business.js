//utilizar nuevas características de javascript
'use strict'

var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');
var Poll = require('../models/poll'); //cargar el modelo usuario
var User = require('../models/user'); // cargar modelo de usuario
var Associate = require('../models/associate')
var Business = require('../models/business')
var mongoose = require('mongoose')

var fs = require('fs'); //libreria file sistem de node
var path = require('path'); //permite trabajar con rutas de sistemas de ficheros





async function validatePhone (act) {
    var num = await isNaN(act)
    if( num === true){
        console.log('No es numero' + num) 
    }
    return num
}
//REGISTRAR SERVICIOS
function saveBusiness(req, res){
    var userId= req.user.sub;
    var params = req.body;
	


    console.log('ingresando a save business')
    console.log(params)


	if (params.slogan && params.mision && params.vision && params.manager && params.address && params.phone) {


        var phone = params.phone

        var isNumberAct = isNaN(phone)
        console.log(isNumberAct)
        if(isNumberAct == true){
            console.log('Validacion realizada!!')
            return res.status(406).send({
                status: "error",
                message: "Datos no validos, solo se aceptan números en el campo telefono!!"
            })
        }
       
        else if(isNumberAct == false) {

            var business = new Business();
            business.slogan = params.slogan
            business.mision = params.mision
            business.vision = params.vision
            business.manager = params.manager
            business.address = params.address
            business.phone = params.phone
            business.values.text = params.values.text
            business.values.optvalues = params.socials.optvalues
            business.values.facebook = params.socials.facebook
            business.socials.instagram = params.socials.instagram
            business.socials.whatsapp = params.socials.whatsapp
            business.socials.catalogue = params.socials.catalogue
            business.active = true
                
               
            business.save((err, business) => {
                if (err) {
                    return res.status(400).send({message: 'Error en la petición'});
                }
                else if (!business) {
                    return res.status(500).send({message: 'No se ha podido registrar la sesión'});
                }

                else{
                    return res.status(200).send({
                        status: "success",
                        business: business
                    })
                }
            })
        }
                    
        
	}else{
		res.status(200).send({
			message: 'Envía todos los campos'
		});
	}
    
}


//Edición de datos de usuario
function updateBusiness(req, res){
    var businessId = req.params.id;
    var userId = req.user.sub;
	var update_text = req.body;

	console.log(businessId);
	console.log(update_text.text);



	if (userId != req.user.sub) {
		return res.status(500).send({message: 'No tienes permiso para actualizar este registro'});
    }

	if (update_text.slogan && update_text.mision && update_text.vision && update_text.manager && update_text.address && update_text.phone) {

        var phone = update_text.phone
        
        var isNumberAct = isNaN(phone)
        console.log(isNumberAct)
        if(isNumberAct == true){
            console.log('Validacion realizada!!')
            return res.status(406).send({
                status: "error",
                message: "Datos no validos, solo se aceptan números en el campo numero de acta!!"
            })
        }
       
        else if(isNumberAct == false) {
            
        
            Business.findByIdAndUpdate(businessId,{ $set: { 
                slogan: update_text.slogan,
                mision: update_text.mision,
                summary: update_text.summary,
                vision: update_text.vision,
                manager: update_text.manager,
                address: update_text.address,
                phone: update_text.phone,
                summary: update_text.summary,
                values:{
                    text: update_text.values.text,
                    optvalues: update_text.values.optvalues
                },
                socials:  {
                    facebook: update_text.socials.facebook,
                    instagram: update_text.socials.instagram,
                    whatsapp:  update_text.socials.whatsapp,
                    catalogue:  update_text.socials.catalogue,
                },
            }}, {new:true}, (err, businessUpdated) => {
                if (err) {
                    return res.status(500).send({message: 'Error en la petición de actualizar empresa'});
                }
                if (!businessUpdated) {
                    return res.status(404).send({message: 'No se ha podido actualizar datos de la empresa'});
                }
                return res.status(200).send({
                    status: 'success',
                    business: businessUpdated,
                    message: "Informacion Institucional actualizada con éxito..!!"
                });
            });
                
        }
    }else{
        return res.status(404).send({
            status: 'error',
            message: "Envía todos los campos!!"
        });
    }



		
}

//Eliminar Sesión
function deleteBusiness(req, res){
	var sesionId = req.params.id

	Session.findOneAndDelete({_id: sesionId}, (err, session) => {
		if (err) {
			return res.status(400).send({message: 'Error al eliminar la sesión ' + String(err)});
		}		
		if (!session) {
			return res.status(500).send({message: 'Usted no puede eliminar esta moción'});
		}else{
			return res.status(200).send({
                status: "success",
                message: 'La sesión se ha eliminado con éxito..!!'
            });
		}
	});
}

//CONSEGUIR DATOS DE UNA SESION EN ESPECIFICO
function getBusiness(req, res){
    var businessId = req.params.id;
    var motionId = req.params.id_motion //params para metodo get y body para metodo post
	Business.find().exec(function (err, business) {
		if (err) {
			return res.status(500).send({message:'Error en la petición'});			
        }
        
		if (!business) {
			return res.status(404).send({message: 'La empresa no existe'});
		}
	
		console.log(business);
      //  var info_business = JSON.stringify( business );
		return res.status(200).send({
            status: "success",
            business: business
		});
		

	});
}


module.exports = {
    saveBusiness,
    getBusiness,
    updateBusiness,
    deleteBusiness
}