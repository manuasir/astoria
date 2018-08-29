//Dependencias:
const request = require("request");
const LineByLineReader = require('line-by-line');
const mongoose = require('mongoose');
const str = require('querystring');
let House = require('./models/houses');

// Variables globales:
let places = [];
let peticion = 0;

// conexión con DB
mongoose.connect('mongodb://localhost/houses');
mongoose.Promise = global.Promise;

// Realiza petición HTTP
const doRequest = async (url) => {
    return new Promise(function (resolve, reject) {
        peticion = peticion + 1 ;
        console.log("Peticion numero : " + peticion)
        request({
            url: url,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0'
            },
            port: 80,
            json: true
        }, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                resolve(body);
            } else{
                console.log("Consulta fallida a : " + url)
                reject(error);
            }
        });
    });
}

const start = async () => {
    try {
        for (let place of places) {
            const escaped_str = str.escape(place);
            console.log(escaped_str);
            
            //Paginacion
            const body = await doRequest(`http://api.nestoria.es/api?action=search_listings&country=es&encoding=json&listing_type=buy&page=0&place_name=${escaped_str}&pretty=1&number_of_results=50&bedroom_min=1&bedroom_max=30`);
            let totalPages = body.response.total_pages;

            let requests = [];
            for (let i = 1; i < totalPages + 1; i++) {
                let url = `http://api.nestoria.es/api?action=search_listings&country=es&encoding=json&listing_type=buy&page=${i}&place_name=${escaped_str}&pretty=1&number_of_results=50&bedroom_min=1&bedroom_max=30`;
                requests.push(doRequest(url));
                let results = await Promise.all(requests)
                if (results) {
                    for (let j = 0; j < results.length; j++) {
                        if (results[j] && results[j].response && results[j].response.listings) {
                            var city = results[j].request.location;
                            var resp = results[j].response.listings;
                            let saves = [];
                            for (let item of resp) {
                                var remaining = resp.length;
                                if (item.size > 0 && item.price) {
                                    let tmpP = new House({
                                        location: city,
                                        bathroom_number: item.bathroom_number,
                                        bedroom_number: item.bedroom_number,
                                        car_spaces: item.car_spaces,
                                        commission: item.commission,
                                        construction_year: item.construction_year,
                                        datasource_name: item.datasource_name,
                                        floor: item.floor,
                                        img_height: item.img_height,
                                        img_url: item.img_url,
                                        img_width: item.img_width,
                                        keywords: item.keywords,
                                        latitude: item.latitude,
                                        lister_name: item.lister_name,
                                        lister_url: item.lister_url,
                                        listing_type: item.listing_type,
                                        location_accuracy: item.location_accuracy,
                                        longitude: item.longitude,
                                        price: item.price,
                                        price_currency: item.price_currency,
                                        price_formatted: item.price_formatted,
                                        price_high: item.price_high,
                                        price_low: item.price_low,
                                        property_type: item.property_type,
                                        room_number: item.room_number,
                                        size: item.size,
                                        size_type: item.size_type,
                                        summary: item.summary,
                                        thumb_height: item.thumb_height,
                                        thumb_url: item.thumb_url,
                                        thumb_width: item.thumb_width,
                                        title: item.title,
                                        updated_in_days: item.updated_in_days,
                                        updated_in_days_formatted: item.updated_in_days_formatted,
                                    });
                                    saves.push(tmpP.save());
                                }
                            }
                            await Promise.all(saves)
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error("error! ", err);
        throw err;
    }
}

function handleFile(file, callback) {
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

handleFile('places.txt', async function () {
    try{
        start();
    } catch (er) {
        console.error("error! ", er);
        throw er;
    }
});
