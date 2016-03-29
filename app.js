
var request = require("request");
var LineByLineReader = require('line-by-line');
var lr = new LineByLineReader('places.txt');
var async = require("async");
var places=[];
var resultados=[];

function isEmpty(obj){
  return true;
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
    if (!error && body.response) {
            var sum=0,medias=0;
            if(!isEmpty(body.response.listings)){
                //console.log("ok");
                var resp=body.response.listings;
           var fin;
           //console.log("hay");
           if(resp){

            resp.forEach(function(item){

              // if(item.size){
                  console.log("entro");
                  medias+=Math.round((item.price)/(item.size));
                  console.log(lugar,medias);
                  resultados[lugar]=resultados[lugar]+medias;
             //  }
                
               // console.log(medias);
                
           });
          // resultados[lugar]=medias;
            
           resultados[lugar]=resultados[lugar]/10;
           console.log("media de "+lugar+" : "+resultados[lugar]/10+" euro/m2");
      }
            }
              
    }
    else
            console.log("error --> "+error);
    });
  callback(resultados);
}

function enviaPeticion() {

    async.each(places,function(item, callback){
        var escaped_str = require('querystring').escape(item);
        //console.log(escaped_str);
        var index=1;
        while(index<=10){
            
            var url = "http://api.nestoria.co.uk/api?action=search_listings&country=uk&encoding=json&listing_type=buy&page="+index+"&place_name="+item+"&pretty=1&number_of_results=50";
            
            peticion(item,url);

            index++;
        }
	});
}


lr.on('error', function (err) {
    console.log("error al leer el documento de texto");
});

lr.on('line', function (line) {
    places.push(line);
    resultados[line]=0;

   // console.log(line);
});


lr.on('end',function(){enviaPeticion();} );