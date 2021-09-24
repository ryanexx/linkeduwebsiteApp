//DEFINICION DEL MODELO USUARIO

//utilizar nuevas características de javascript
'use strict'
/* 
//cargar la libreria de mongoose
//para poder utilizar el modelo fuera de este fichero
//en la base de datos se buscara la colección users ya que se User se pondrá en minuscula y se agregará la letra s
module.exports = mongoose.model('Session', SessionSchema);  */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const ServiceSchema = new Schema({
    name: String,
    id: String,
    description: String,
    active: Boolean,
    optservices: [{
        name:String,
        description: String,
      //  imagen:String,
    }],
    created_at: {type: Date, default: Date.now},
    associates: [{ type: Schema.Types.ObjectId, ref: 'Associate' }],
    }, {
    toJSON: {
        virtuals: true,
    },
});

module.exports = mongoose.model('Service', ServiceSchema);
 