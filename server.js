/*eslint-env node */
/*eslint indent:0,semi:0 */
/*jshint devel: true, node: true*/
/*global: */

/***
* Start an instance of Node-Red under Express.JS
*
* Allows multiple instances of Node-Red to be run, even different versions in parallel.
***/

'use strict';  /* always for Node.JS, never global in the browser */
var cfenv = require('cfenv');
var http 	= require('http'),
 https 	= require('https'),
express = require('express'),  // THE std library for serving HTTP
RED     = require('node-red'),
nrSettings = require('./settings.js') // Node-Red settings file
;
var appEnv = cfenv.getAppEnv();
// The TCP port for this systems web interface - picked up from env, package.json or fixed value
var nrPort = appEnv.port || process.env.LOCALPORT || process.env.npm_package_config_localPort || '1880';

// Create an Express app
var app = express();

// Add a simple route for static content served from './public'
app.use( '/', express.static('public') );

// Add static route for bower components from './bower_components'
app.use( '/bower_components', express.static('bower_components') );

// Create the http server
// TODO: Add code for https server
var httpServer = http.createServer(app);

// Initialise the runtime with a server and settings
// @see http://nodered.org/docs/configuration.html
RED.init( httpServer, nrSettings );

// Serve the editor UI from /admin
app.use( nrSettings.httpAdminRoot, RED.httpAdmin );

// Serve the http nodes from /
app.use( nrSettings.httpNodeRoot, RED.httpNode );
// app.use(nrSettings.httpApiRoot,RED.httpApi);

httpServer.listen( nrPort, function(){
  console.log('Express 4 server listening on port %s, serving node-red', nrPort);
});

var options = {
  host: "pxc4ql.internetofthings.ibmcloud.com",
  path: '/api/v0002/device/types/mATwDevType/devices/',
  method: 'GET',
  auth:'a-pxc4ql-6w29om6quk:4p_(w3Z5e612@1t99R'
  // , headers: { 'Content-Type': 'application/json' }
};

// app.get("/devices",function(request,response){
//   var resJson = null;
//   var retJson = {};
//   http.request(options, function(res) {
//     res.setEncoding('utf8');
//     res.on('data', function (data) {
//       resJson=data;
//     });
//   }).end();
//   for(var idx = 0; idx< data.results ; idx++){
//     if(data.results[idx].typeId == "mATwDevType"){
//       retJson[data.results[idx].deviceId]=data.results[idx].metadata;
//     }
//   }
//   response.json(retJson);
// });
// Start the runtime

var router = express.Router();
router.route("/devices").get(
  function(request,response){

    var resJson = {};
    var retJson = {};
    https.request(options, function(res) {
      var some = "";
      res.setEncoding('utf8');
      // res.setHeader('Content-Type', 'application/json');
      res.on('data', function (data) {
        // resJson=data;
        some+=data;
      }).on('end', function() {

        // retJson=some;
      var tmpSome=some.replace(/\\/gi, "");

        var tmp = JSON.parse(tmpSome);
        console.log("{{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}" + tmp.results);
        console.log("{{{{{{{{{{{{{{{{{{{{{{))))))))))))))))))))))" + JSON.stringify(tmp.results));
        retJson.devices=[];
        for(var idx = 0; idx< tmp.results.length ; idx++){
          if(tmp.results[idx].typeId == "mATwDevType"){
            console.log("device id : "+ tmp.results[idx].deviceId);
            // retJson[tmp.results[idx].deviceId]=tmp.results[idx].metadata;
            retJson.devices.push(tmp.results[idx].deviceId);
          }
        }
        // At this point, we have the headers, method, url and body, and can now
        // do whatever we need to in order to respond to this request.
        response.setHeader('Content-Type', 'application/json');
          response.json(retJson);
      });

    }).end();

  }
);
app.use("/api",router);
RED.start();
