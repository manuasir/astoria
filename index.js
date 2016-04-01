// Manuel Jiménez Bernal - Iliberi S.A. Granada 2016

var request = require("request");
var LineByLineReader = require('line-by-line');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('../nestoria.db');
var places=[];
var async = require('async');
var check;

var index;
var cpaginacion=1





function peticion(url,str,i,c){
   
    
    request({
        url: url,
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0'
        },
        port: 80,
        json: true
        }, function (error, response,body) {
            
            
        if (!error) {
            console.log("procesando. i: "+i+" c: "+c);
            //console.log("callback");
            var sum=0,medias=0;
            var respuesta=body.response;
            var fin;
            if(respuesta){
                var resp=respuesta.listings;
                if(resp){
                async.each(resp,function(item){
                    console.log("introduciendo en bd");
                    if(item.size!=''){
                        // db.serialize(function() {
                        //     var stmt = db.prepare("INSERT INTO casas VALUES (?,?,?,?,?,?,?)");
                        //     console.log(item.guid,item.price,item.size,item.longitude,item.latitude,item.property_type);
                        //     stmt.run(item.guid,item.price,item.size,item.longitude,item.latitude,item.title,item.property_type);
                        //     stmt.finalize();
                        // });
                        //callback();
                    }
                },function(){
                    console.log("OTRA PAGINA");
                    //callback();
                });
                }
              
            }
        
        }
        else{
                console.log("error ->"+error);
              
            }
    
    
    

    c++;
    console.log("fin peticion "+c);
    paginar(str,i,c);
    });
//return callback();


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

function procesa(i){
    console.log("procesando...");
    if(i<places.length){
    var item=places[i];
    console.log("un sitio: "+item);
        var escaped_str = require('querystring').escape(item);
        var err=false;
        var index=1;
        paginar(escaped_str,i, cpaginacion);
    }
    else{
        console.log("fin de pueblos");
    }
    /*
    async.forEach(places,function(item,next1){
        console.log("un sitio: "+item);
        var escaped_str = require('querystring').escape(item);
        var err=false;
        var index=1;
        paginar(escaped_str,next1);
        
        
    },function(){
        console.log("municipios terminados");
    });
*/

}


function paginar(escaped_str,i, cpaginacion){


//async.times(20, function(n, next2){
    var url = "http://api.nestoria.es/api?action=search_listings&country=es&encoding=json&listing_type=buy&page="+cpaginacion+"&place_name="+escaped_str+"&pretty=1&number_of_results=50";
    console.log(url);
    console.log("pagina-> "+cpaginacion+" sitio: "+escaped_str);
   // peticion(url,next2);
  //  }, function(err, users) {
    //     console.log("fin de paginas");
    if(cpaginacion==20){
        i++;
        procesa(i);
    }else {
        peticion(url, escaped_str,i, cpaginacion);
    }
   // });
}

// function paginaUnaVez(url, next3){
//    console.log("enviando peticion...");
//     peticion(url,next3);
// }

handleFile('places.txt',function(){
    index=0;
    procesa(index);
});

