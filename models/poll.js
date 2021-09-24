//cargar la libreria de mongoose
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Votacion 
const PollSchema = new Schema({
    type_poll: String,
    cont_total: String,
    cont_poll: String,
    active: Boolean,
    motion: { type: Schema.Types.ObjectId, ref:'Motion' },
    created_at: String,
    }, {
    toJSON: {
        virtuals: true,
    },
});


//para poder utilizar el modelo fuera de este fichero
//en la base de datos se buscara la colección users ya que se User se pondrá en minuscula y se agregará la letra s
module.exports = mongoose.model('Poll', PollSchema); 
