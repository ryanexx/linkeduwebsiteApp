//DEFINICION DEL MODELO USUARIO

//utilizar nuevas características de javascript
'use strict'

//cargar la libreria de mongoose
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: String,
	lastname: String,
	email: String,
  phone: String,
	password: String,
  date: {type: Date, default: Date.now},
  active: Boolean,
  role: { 
      type: String, 
      enum: [
          'ADMINISTRADOR',
          'CLIENTE'
      ], 
  },
  associate: [{ type: Schema.Types.ObjectId, ref: 'Associate' }],
  image: String
}, {
  toJSON: {
    virtuals: true,
  },
});

//para poder utilizar el modelo fuera de este fichero
//en la base de datos se buscara la colección users ya que se User se pondrá en minuscula y se agregará la letra s
module.exports = mongoose.model('User', UserSchema); 

