var connect = require('connect');
var serveStatic = require('serve-static');
var path = require('path');
var fs = require('fs');
//var counties = JSON.parse(fs.readFileSync(path.join(__dirname, 'scripts', 'prueba_distrito.geojson'), {encoding: 'utf8'}));


var port    =   process.env.PORT || 8000;
connect().use(serveStatic(__dirname)).listen('port')
});
// cd navega hasta la carpeta 
// npm install connect serve-static
// pon este archivo en la raíz de la carpeta
// ejecuta en consola node server.js



