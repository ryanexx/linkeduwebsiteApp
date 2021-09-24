//cargar la libreria de mongoose
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Votacion 
const VoteSchema = new Schema({
    type_poll: { 
        type: String, 
        enum: [
            'ORDINARIA',
            'NOMINATIVA',
            'NOMINAL RAZONADA'
        ], 
        required: true 
    },
    options: { 
        type: String, 
        enum: [
            'A FAVOR',
            'EN CONTRA',
            'EN BLANCO'
        ], 
        required: true 
    },
    date: {type: Date, default: Date.now},
    active: Boolean,
    // session: { type: Schema.Types.ObjectId, ref: 'Session' },
    session:  { type: Schema.Types.ObjectId, ref: 'Session' },
    poll: { type: Schema.Types.ObjectId, ref: 'Poll' },
    motion:  { type: Schema.Types.ObjectId, ref: 'Motion' },
    user: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, {
  toJSON: {
    virtuals: true,
  },
});

//para poder utilizar el modelo fuera de este fichero
//en la base de datos se buscara la colección users ya que se User se pondrá en minuscula y se agregará la letra s
module.exports = mongoose.model('Vote', VoteSchema); 

