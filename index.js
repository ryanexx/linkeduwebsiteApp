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
//var app2 = require('./app');
//mongodb+srv://emat44:Ematy4486@ematcluster0-z41kd.gcp.mongodb.net/PollRegister?retryWrites=true&w=majority
//mongodb://localhost:27017/PollRegister?retryWrites=true&w=majority

const port = process.env.PORT || 5000;
const uri= process.env.MONGO_URI || 'mongodb+srv://emat44:Ematy4486@ematcluster0-z41kd.gcp.mongodb.net/db_visiongroup?retryWrites=true&w=majority'

const opts = {
  useNewUrlParser:true, 
  useFindAndModify:false, 
  useUnifiedTopology: true, 
  serverSelectionTimeoutMS: 15000
}
//var port2 = 3801;

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
	.catch(err => console.log(err) );

	/*
mongoose2.connect('mongodb://localhost:27017/curso_red_social',  {useNewUrlParser: true })
	.then(() => {
		console.log('La conexion a la base de datos se ha realizado de forma correcta!!');

		//crear servidor
		app2.listen(port2, () => {
			console.log("Servidor ejecutandose en http://localhost:3801");
		});
	})
	.catch(err => console.log(err) );
	*/
//mongodb://<dbuser>:<dbpassword>@ds161134.mlab.com:61134/curso_red_social
//mongoose.connect('mongodb://SEJR:1996SEJR-jr*@ds161134.mlab.com:61134/curso_red_social',  {useNewUrlParser: true })