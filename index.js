
//Astoria - Manuel J. Bernal, Iliberi S.A. Granada 2016

//Dependencias:

const request = require("request");
const LineByLineReader = require('line-by-line');
const mongoose = require('mongoose');
const async = require('async');
const str = require('querystring');
let House = require('./models/houses');
// Variables globales:
let places=[];

// conexión con DB
//mongoose.connect('mongodb://manuasir:mongodb@ds147072.mlab.com:47072/heroku_mctx4f0c',{useMongoClient:true});
mongoose.connect('mongodb://localhost/houses');
mongoose.Promise = global.Promise;

/**
* Realiza petición HTTP
*/
const doRequest = async (url) => {
  return new Promise(function (resolve, reject) {
    console.log("lanzando peticion")
    request({
        url: url,
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0'
        },
        port: 80,
        json: true
        }, function (error, res, body) {
      if (!error && res.statusCode == 200) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
}

const start = async () => {
    try{
        for (let file of places) {
            const escaped_str = str.escape(file);
            console.log("un sitio ",escaped_str);
            let cpaginacion = 0;
            do{
                const body = await doRequest("http://api.nestoria.es/api?action=search_listings&country=es&encoding=json&listing_type=buy&page="+cpaginacion+"&place_name="+escaped_str+"&pretty=1&number_of_results=50&bedroom_min=1&bedroom_max=30");
                let sum=0,medias=0;
                let respuesta=body.response;
                let fin;
                if(respuesta){
                    var resp=respuesta.listings;
                    for(let item of resp){
                        var remaining = resp.length;
                        if(item.size>0 && item.price){
                            let tmpP = new House({price: item.price,latitude: item.latitude, longitude:item.longitude});
                            await tmpP.save();
                        }
                    }         
                }
                cpaginacion+=1;
                console.log("una pagina ",cpaginacion+" del sitio ",escaped_str);
            }while(resp && resp.length>1)   
        }
    } catch(err){
        console.error("error! ",err);
        throw err;
    }
}

function handleFile(file,callback){
    var lr = new LineByLineReader(file);
    lr.on('error', function (err) {
        console.log("error al leer el documento de texto");
    });

    lr.on('line', function (line) {
        places.push(line);
    });

    lr.on('end', function () {
        return callback();
    });
}

handleFile('places.txt',async function(){
    start();
});
