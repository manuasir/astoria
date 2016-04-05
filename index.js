// Manuel Jiménez Bernal - Iliberi S.A. Granada 2016
var str2json = require('string-to-json');
var request = require("request");
var LineByLineReader = require('line-by-line');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('../nestoria.db');
var places=[];
var async = require('async');
var check;
var index;
var cpaginacion=1;
var cambio=false;

function insertData(guid,price,size,longitude,latitude,text,property_type,callback){
 db.serialize(function() {
  var stmt = db.prepare("INSERT INTO casas VALUES (?,?,?,?,?,?,?)");
  stmt.run(guid,price,size,longitude,latitude,text,property_type);
 },function(){
    console.log("fin transaccion");
    callback();
 });
}

function insertDataSec(guid,longitude,latitude,callback){
   // console.log("altero en bd");
 db.serialize(function() {
  //var stmt = db.prepare("INSERT INTO casas_copy(guid,longitude,latitude) VALUES (?,?,?)");
  var stmt = db.prepare("UPDATE casas SET longitude= ?,latitude=? WHERE guid=?");
  stmt.run(longitude,latitude,guid,function(err){
        if(err){
            callback(err);
        }
  });
 },function(){
    console.log("fin transaccion");
    callback();
 });
}

function peticion(url,str,i,c){
   //console.log("realizando nueva peticion.........."+c);
    
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
            
            //console.log("callback");
            var sum=0,medias=0;
            var respuesta=body.response;
            var fin;
            if(respuesta){
                var resp=respuesta.listings;
                if(resp){
                resp.forEach(function(item,next){
                var remaining = resp.length;
                    if(item.size!=''){
                        insertData(item.guid,item.size,item.price,item.longitude,item.latitude,item.title,item.property_type,function(){                    
                            if (!--remaining){ //console.log("nueva entrada"); 
                                next();
                            }
                        });
                    }
                    
                });
                //console.log("fin peticion "+c);
                        c++;
                        paginar(str,i,c,false);
                }
                else{
                    //console.log("NO RESP");
                    paginar(str,i,c,true);
                }
              
            }
            else{
                //console.log("no hay datos");
            }
        }
        else{
                console.log("error!!!!!!! ->"+error+ " volviendo a hacer la peticion "+c);
                paginar(str,i,c,true);
              
            }
        
           
        
        });
}

function peticion2(url,str,i,c){
   //console.log("realizando nueva peticion.........."+c);
    
    request({
        url: url,
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0'
        },
        port: 80,
        json: false
        }, function (error, response,body) {
            
        if (!error) {
            //console.log("callback");
            var sum=0,medias=0;
            var respuesta=body;
            var fin;
            if(respuesta){
                //var resp=JSON.stringify(respuesta);
                //var resp = str2json.convert(respuesta);
                var resp=JSON.parse(respuesta);
               // console.log(resp);
                if(resp){
                    //console.log("resp->"+resp);
                   // console.log("tipo ->"+Object.prototype.toString.call(resp));
                //resp.forEach(function(item,next){
                async.forEach(resp,function(item,next){

                var remaining = resp.length;
                    if(item.location){
                        //console.log(item.location.lon);
                        insertDataSec(item.guid,item.location.lon,item.location.lat,function(){                    
                            if (!--remaining){ //console.log("nueva entrada"); 
                                next();
                            }
                        });
                    }
                    
                });
               // });
                console.log("fin peticion "+c);
                        c+=100;
                        paginarsec(str,i,c,false);
                }
                else{
                    console.log("NO RESP");
                    paginarsec(str,i,c,true);
                }
              
            }
            else{
                console.log("no hay datos");
            }
        }
        else{
                console.log("error!!!!!!! ->"+error+ " volviendo a hacer la peticion "+c);
                paginarsec(str,i,c,true);            
            }

        });
}

function secondreq(url,str,i,c){
    request({
        url: url,
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.8; rv:24.0) Gecko/20100101 Firefox/24.0'
        },
        port: 80,
        json: true
        }, function (error, response,body) {
            if(!error){
                if(response){
                    if(body){
                        //var resp=body.response;
                       // var respuesta = JSON.parse();
                        //body.forEach(function(item){
                        var vector=[];
                        // for (var i = 1; i <= 100 ;i++ ) {
                        //     vector.push(i);
                        // }
                        var salida=false;
                        //async.forEach(vector,function(i,next){
                            var i=1;
                            if(body[i]){
                                //console.log(i+"  "+body[i].guid);
                              insertDataSec(body[i].guid,body[i].location.lon,body[i].location.lat,function(){
                                 next();
                              });
                            }
                            else if(!body[i] && i<99){
                                console.log("me salgo con errores");
                                paginar(str,i,c,true);
                                //return;
                            }
                      //  });
                        console.log("fin bucle");
                       // console.log(body[2].guid);
                        //});
                        
                            console.log("salida sin errores");
                            c+=100;
                            paginar(str,i,c,false);
                        
                    }
                    else{
                     console.log("no body");
                    }
                }
                else{
                console.log("no response");
                }
            }
            else{
                console.log("error");
            }
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
       // console.log("fin del documento");
        return callback();
    });
}

function procesa(i){
    //console.log("procesando...");
    switch(cambio){
    case false:
        if(i<places.length){
        var item=places[i];
        console.log("un sitio: "+item);
            var escaped_str = require('querystring').escape(item);
            var err=false;
            var index=1;
            //cpaginacion=1;
            paginar(escaped_str,i, cpaginacion,false);
        }
        else{
            console.log("fin de pueblos");
            cambio=true;
            cpaginacion=0;
            procesa(0);
            //paginarsec();
            //peticion2();
        }
        break;
    case true:
        if(i<places.length){
        var item=places[i];
        console.log("un sitio en segunda vuelta: "+item);
            var escaped_str = require('querystring').escape(item);
            var err=false;
            var index=1;
            //cpaginacion=1;
            paginarsec(escaped_str,i, cpaginacion,false);
        }
        else{
            console.log("fin de pueblos");
            cambio=true;
            cpaginacion=1;
            //paginarsec();
            //peticion2();
        }
        break;
    }
    
}


function paginar(escaped_str,i, cpaginacion,error){

    //console.log("entro en paginar. cpaginacion= "+cpaginacion+" error "+error);
    var url = "http://api.nestoria.es/api?action=search_listings&country=es&encoding=json&listing_type=buy&page="+cpaginacion+"&place_name="+escaped_str+"&pretty=1&number_of_results=50";
    var ukurl = "http://api.nestoria.co.uk/api?action=search_listings&country=uk&encoding=json&listing_type=buy&page="+cpaginacion+"&place_name="+escaped_str+"&pretty=1&number_of_results=50";
   // var securl = "http://172.17.4.14/nestoria.php?location="+escaped_str+"&listing_type=buy&property_type=property&offset="+cpaginacion;
    if(cpaginacion==21 || error){
        console.log("terminado sitio: "+escaped_str+" paginas: "+cpaginacion);
        i++;
        procesa(i);
    }else{
        //console.log("no he llegado al fin de paginas,hago otra peticion "+cpaginacion);
        peticion(url, escaped_str,i, cpaginacion);
        //peticion2(securl, escaped_str,i, cpaginacion);

    }
}
function paginarsec(escaped_str,i, cpaginacion,error){

    //console.log("entro en paginar. cpaginacion= "+cpaginacion+" error "+error);
   // var url = "http://api.nestoria.es/api?action=search_listings&country=es&encoding=json&listing_type=buy&page="+cpaginacion+"&place_name="+escaped_str+"&pretty=1&number_of_results=50";
   // var ukurl = "http://api.nestoria.co.uk/api?action=search_listings&country=uk&encoding=json&listing_type=buy&page="+cpaginacion+"&place_name="+escaped_str+"&pretty=1&number_of_results=50";
    var securl = "http://172.17.4.14/nestoria.php?location="+escaped_str+"&listing_type=buy&property_type=property&offset="+cpaginacion;
    if(cpaginacion==1100 || error){
        console.log("terminado sitio: "+escaped_str+" paginas: "+cpaginacion);
        i++;
        procesa(i);
    }else{
        //console.log("no he llegado al fin de paginas,hago otra peticion "+cpaginacion);
        peticion2(securl, escaped_str,i, cpaginacion);
        //peticion2(securl, escaped_str,i, cpaginacion);

    }
}

handleFile('places.txt',function(){
    index=0;
    procesa(index);
});

