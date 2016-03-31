// Manuel Jiménez Bernal - Iliberi S.A. Granada 2016

var request = require("request");
var LineByLineReader = require('line-by-line');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('../nestoria.db');
var places=[];

var check;

function peticion(lugar,url,callback){
    
    request({
        url: url,
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0'
        },
        port: 80,
        json: true
        }, function (error, response, body) {
        if (!error) {
            var sum=0,medias=0;
            var respuesta=body.response;
            var fin;
            if(respuesta){
                var resp=respuesta.listings;
                if(resp){
                resp.forEach(function(item){
                    if(item.size!=''){
                        db.serialize(function() {
                            var stmt = db.prepare("INSERT INTO casas VALUES (?,?,?,?,?,?,?)");
                            console.log(item.guid,item.price,item.size,item.longitude,item.latitude,item.property_type);
                            stmt.run(item.guid,item.price,item.size,item.longitude,item.latitude,item.title,item.property_type);
                            stmt.finalize();
                        });
                    }
                });
                }
            }
        }
        else{
                //console.log("errorcillo ->"+error);
                //setTimeout(function(){},10);
                return callback(error);
            }
    
    });
return callback();
}

function handleFile(file,callback){
    var lr = new LineByLineReader(file);

    lr.on('error', function (err) {
        console.log("error al leer el documento de texto");
    });

    lr.on('line', function (line) {
        places.push(line);
        //places[line]=line;
    });

    lr.on('end', function () {
        console.log("fin del documento");
        return callback();
    });
}

function procesa(){
    console.log("procesando...");
    places.forEach(function(item){
        var escaped_str = require('querystring').escape(item);
        var err=false;
        var index=1;
        
        while(index<=20 && !err){
            var url = "http://api.nestoria.es/api?action=search_listings&country=es&encoding=json&listing_type=buy&page="+index+"&place_name="+escaped_str+"&pretty=1&number_of_results=50";
            peticion(item,url,function(error){
                index++;
                if(error){
                    err=true;
                    console.log("error en callback "+error);
                }
            });
        }
    },function(){

    }
}

handleFile('places.txt',function(){
    procesa();
});

