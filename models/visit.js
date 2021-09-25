//DEFINICION DEL MODELO VISITAS
//utilizar nuevas características de javascript
'use strict'
//cargar la libreria de mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//esquema para visitas 
const visitSchema = new Schema({
  ip: String,
  device: String,
  date: { type: Date, default: Date.now },
}, {
  toJSON: {
    virtuals: true,
  },
});
//para poder utilizar el modelo fuera de este fichero
//en la base de datos se buscara la colección users ya que se User se pondrá en minuscula y se agregará la letra s
module.exports = mongoose.model('visitas', visitSchema);