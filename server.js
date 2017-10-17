var connect = require('connect');
var serveStatic = require('serve-static');
var path = require('path');
var fs = require('fs');


connect().use(serveStatic(__dirname)).listen(process.env.PORT || 3000);



