//DEFINICION DEL MODELO USUARIO

//utilizar nuevas características de javascript
'use strict'

//cargar la libreria de mongoose
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//esquema para empresa 
const BusinessSchema = new Schema({
  name: String,
  slogan: String,
	summary: String,
	address: String,
	mision: String,
	vision: String,
  values: {
    text:String,
    optvalues:[],
  },
	email: String,
  manager: String,
	phone: String,
  socials: {
    facebook: String,
    instagram: String,
    whatsapp: String,
    catalogue: String
  },
  created: {type: Date, default: Date.now},
  active: Boolean,
  image: String
}, {
  toJSON: {
    virtuals: true,
  },
});

//para poder utilizar el modelo fuera de este fichero
//en la base de datos se buscara la colección users ya que se User se pondrá en minuscula y se agregará la letra s
module.exports = mongoose.model('Business', BusinessSchema); 

