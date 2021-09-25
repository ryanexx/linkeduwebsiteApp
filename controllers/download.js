//utilizar nuevas características de javascript
'use strict'
var Download = require('../models/download')
//REGISTRAR DESCARGAS
function saveDownload(req, res) {
    var params = req.body;
    console.log('ingresando a guardar descarga')
    var download = new Download();
    download.ip = req._remoteAddress
    download.device = req.headers['user-agent']
    download.type = params.type
    download.so = params.so
    download.version = params.version
    download.save((err, download) => {
        if (err) {
            return res.status(400).send({ message: 'Error en la petición' });
        }
        else if (!download) {
            return res.status(500).send({ message: 'No se ha podido registrar la descarga' });
        }
        else {
            console.log('nueva descarga registrada')
            return res.status(200).send({
                status: "success",
                download: download
            })
        }
    })
}
//OBTENER TOTAL DESCARGAS
function getAllDownloads(req, res) {
    var page = 1;
    var type = req.params.type
    var total = { app: 0, pc: 0 }
    if (req.params.page) {
        page = req.params.page;
    }
    console.log("entrando a obtener descargas")
    Download.find().exec(function (err, downloads) {
        if (err) {
            return res.status(500).send({ message: 'Error en la petición' });
        }
        if (!downloads) {
            return res.status(404).send({ message: 'No hay descargas disponibles' });
        }
        for (let index = 0; index < downloads.length; index++) {
            if (downloads[index].type == "APP") {
                total.app++
            } else {
                total.pc++
            }
        }
        return res.status(200).send({
            total
        });
    });
}
module.exports = {
    saveDownload,
    getAllDownloads
}