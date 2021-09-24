//DEFINICION DEL MODELO USUARIO

//utilizar nuevas características de javascript
'use strict'

//cargar la libreria de mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const AssociateServiceSchema = new Schema({
    text: String,
    date: {type: Date, default: Date.now},
    active: Boolean,
    _service:  { type: Schema.Types.ObjectId, ref: 'Service' },
}, {
  toJSON: {
    virtuals: true,
  },
});

module.exports = mongoose.model('Associate', AssociateServiceSchema);




/* var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var MotionSchema = Schema({
    text: String,
    date: {type: Date, default: Date.now},
    active: Boolean,
    session: { type: Schema.Types.ObjectId, ref: 'Session' },
    poll: { type: Schema.ObjectId, ref: 'Poll'},
    //votacion
});


//para poder utilizar el modelo fuera de este fichero
//en la base de datos se buscara la colección users ya que se User se pondrá en minuscula y se agregará la letra s
module.exports = mongoose.model('Motion', MotionSchema);  */