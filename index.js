//FICHERO PRINCIPAL DEL API
//por aqui van a pasar las peticiones
/* CONEXION DE NODEJS CON MONGODB */
//utilizar nuevas características de javascript
'use strict'
//cargar la libreria de mongoose
var mongoose = require('mongoose');
//var mongoose2 = require('mongoose');
//cargar app.js
var app = require('./app');
const port = process.env.PORT || 5000;
const uri = process.env.MONGO_URI || 'mongodb+srv://linkeduClient:linkeduClient@basement0.0ozys.mongodb.net/linkeduweb?retryWrites=true&w=majority'
const opts = {
	useNewUrlParser: true,
	useFindAndModify: false,
	useUnifiedTopology: true,
	serverSelectionTimeoutMS: 15000
}
//conexion a la base de datos
mongoose.Promise = global.Promise;
//mongoose2.Promise = global.Promise;
mongoose.connect(uri, opts)
	.then(() => {
		console.log('La conexion a la base de datos se ha realizado con éxito!! ');
		//crear servidor
		app.listen(port, () => {
			console.log("Servidor ejecutandose en http://localhost:" + port);
		});
	})
	.catch(err => console.log(err));