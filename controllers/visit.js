//utilizar nuevas características de javascript
'use strict'
var Visit = require('../models/visit')
//REGISTRAR VISITA
function saveVisit(req, res) {
    console.log('ingresando a guardar visita')
    var visit = new Visit();
    visit.ip = req._remoteAddress
    visit.device=req.headers['user-agent']
    visit.save((err, visit) => {
        if (err) {
            return res.status(400).send({ message: 'Error en la petición' });
        }
        else if (!visit) {
            return res.status(500).send({ message: 'No se ha podido registrar la visita' });
        }
        else {
            console.log('nueva visita registrada')
            return res.status(200).send({
                status: "success",
            })
        }
    })
}
//OBTENER TOTAL VISITAS
function getAllVisits(req, res) {
	var page = 1;
	if (req.params.page) {
		page = req.params.page;
	}
    console.log("entrando a obtener visitas")
    var itemsPerPage = 20; //cantidad de usuarios que se listaran por pagina
	Visit.find().exec(function (err, visits) {
		if (err) {
			return res.status(500).send({ message: 'Error en la petición' });
		}
		if (!visits) {
			return res.status(404).send({ message: 'No hay visitas disponibles' });
		}
        var total=visits.length
		return res.status(200).send({
			total
		});
	});
}
module.exports = {
    saveVisit,
    getAllVisits,
}