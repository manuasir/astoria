// Manuel Jiménez Bernal - Iliberi S.A. Granada 2016

var request = require("request");
var LineByLineReader = require('line-by-line');
var lr = new LineByLineReader('places.txt');
var place="cordoba";
var async = require("async");
var places=[];
var resultados=[];
var BigNumber = require('big-number');

function calculaMedia(res){
    console.log("calculando media, el tamaño de res es "+ res.length);
    for (var i = 0; i < res.length; i++) {
        res[i]=BigNumber(res[i]).div(50);
        console.log(res[i]);
    }

    return res;
}


function peticion(lugar,url,callback){
    request({
    url: url,
    headers: {
    //'Content-Length': contentLength,
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
           // console.log(resp);
           if(resp){
            resp.forEach(function(item){
                if(item.size!=''){
                    medias+=Math.round((item.price)/(item.size));
                   // console.log(lugar,medias);
                   resultados[lugar]=medias;
                   console.log(resultados[lugar]);
                   //BigNumber(resultados[lugar]).plus(medias);
                }
                
                //console.log(medias);
                
            });
            //console.log(resultados.length);
           // resultados[lugar]=Math.round(medias/resp.length);
           // console.log(resultados[lugar]);
           // media=medias/resp.length;
            }
          // BigNumber(resultados[lugar]).div(10);
           //resultados[lugar]=resultados[lugar]/10;
          // console.log("media de "+lugar+" : "+resultados[lugar]);
            callback(resultados);
    }
    else
            console.log(error);
    });
    
}


lr.on('error', function (err) {
    console.log("error al leer el documento de texto");
});

lr.on('line', function (line) {
    places.push(line);
    resultados[line]=0;
});

lr.on('end', function () {

    async.each(places,function(item){
        console.log(item);
        var index=1;
       // while(index<11){
            
            var url = "http://api.nestoria.es/api?action=search_listings&country=es&encoding=json&listing_type=buy&page="+index+"&place_name="+item+"&pretty=1&number_of_results=50";
           // async.series([
               // function(callback){
                    peticion(item,url,function(resultado){
                        console.log("terminado");
                        calculaMedia(resultado);
                    });
               // }
                /*,
                function(callback){
                    console.log("calculados los resultados");
                    calculaMedia(resultados);
                }*/
          //  ],function(error,results){
                //console.log("fin");
                 // calculaMedia(results);
           // });
           // index++;
       // }

         //callback();

    },function(err){console.log("final")} );
        

});


