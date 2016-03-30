// Manuel Jiménez Bernal - Iliberi S.A. Granada 2016

var request = require("request");
var LineByLineReader = require('line-by-line');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('../nestoria.db');
var places=[];

var check;




function peticion(lugar,url){
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
            var resp=body.response.listings;
            var fin;
          
           if(resp){
            resp.forEach(function(item){
                if(item.size!=''){
                    //console.log("insertando...");
                     db.run("INSERT INTO casas(guid) VALUES (item)");
                }

            });
          
            }
            else{
                console.log("no hay datos");
            }
    }
    else
            console.log(error);
    });
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

        var index=1;

        //while(index<=10){
            //console.log("while");
            var url = "http://api.nestoria.es/api?action=search_listings&country=es&encoding=json&listing_type=buy&page="+index+"&place_name="+escaped_str+"&pretty=1&number_of_results=100";
            peticion(item,url);
         
            //index++;
       // }
         

    },function(err,callback){
        console.log("FIN");

    });
 
}

handleFile('places.txt',function(){
    procesa();
});

