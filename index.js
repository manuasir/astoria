// Manuel Jiménez Bernal - Iliberi S.A. Granada 2016

var request = require("request");
var LineByLineReader = require('line-by-line');
var lr = new LineByLineReader('places.txt');
var async = require("async");
var places=[];
var resultados=[];
var BigNumber = require('big-number');
var acabose=[];
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
          
           if(resp){
            async.each(resp,function(item){
                if(item.size!=''){
                    medias+=Math.round((item.price)/(item.size));
                }

            });
            resultados[lugar]=medias;
            //console.log("lugar-> "+lugar+" resultados[lugar] "+resultados[lugar]);
            }
      
            return callback(resultados);
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
        var escaped_str = require('querystring').escape(item);
        //console.log(item);
        var index=1;
        //console.log("entrando while");
        while(index<=10){
           // console.log("he entrado en while");
                    var url = "http://api.nestoria.es/api?action=search_listings&country=es&encoding=json&listing_type=buy&page="+index+"&place_name="+escaped_str+"&pretty=1&number_of_results=100";
                    peticion(item,url,function(resu){
                        //console.log("peticion "+index);
                      //  console.log(resultados[item]);
                        resultados[item]+=resu[item]/50;
                        //console.log("resultado -> "+item+" "+resultados[item] );
                        //resultados[item]+=
                        //acabose=calculaMedia(resu);
                        
                    });
        resultados[item]=resultados[item]/10;
        acabose[item]=resultados[item];
        index++;
        }
        console.log(acabose[item]+" - "+item);
      // console.log("saliendo while");
    },function(err){
        console.log(err);
    });     
});


