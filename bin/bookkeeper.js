#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const bookkeeper = require('commander');
const {homedir} = require('os');
const mkdirp = require('mkdirp');
const VeraNode = require('../lib/veranode-book');
const dnode = require('dnode');

const defaultConfig = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../config/default.config.json')
  ).toString()
);

bookkeeper
  .description('Runs a bookkeeper instance that connects to the specified vera network and uses the host')
  .option('-h --host <host>', 'hostname to listen on', defaultConfig.host)
  .option('-p --port <port>', 'port to listen to (needs to be accesible from your NAT)', defaultConfig.port)
  .option('-s --seed <identity>', 'seed id for the node to connect to', defaultConfig.seed)
  .option('--seedhost <hostname:port>', 'host and port for veranode to connect to', defaultConfig.seedhost)
  .parse(process.argv);

function getHostAndPort(hostname){
  let port;
  let address = hostname.split(':')[0];
  if (hostname.split(':').length > 1) {
    port = parseInt(hostname.split(':')[1], 10);
  }
  return { host: address, port: port};
}

function setStorage(path){
  mkdirp.sync(path);
  return path;
}

let storage = setStorage(path.join(homedir(), '.bookkeeper/storage.db'));
let seedHost = getHostAndPort(bookkeeper.seedhost);

let options = {
  host: bookkeeper.host,
  port: bookkeeper.port,
  seed: [
    bookkeeper.seed,
    { host: seedHost.host, port: seedHost.port}
  ],
  storage: storage
};


const node = new VeraNode({
  node :{
    storage: require('levelup')(options.storage),
    contact: { hostname: options.host, port: options.port }
  },
  seed: options.seed,
  port: options.port,
  services: ['BTC']
});

//TODO move rpc setup and commands to lib
var server = dnode({
    sendJob : function (message, params, cb) {
      //TODO switch to node scoring and sharding
      //TODO add in checking on message to make sure it can and will process the job
      node.iterativeFindNode(bookkeeper.seed, function(err, contacts){
        let contact = contacts[0];
        return node.send(message, params, contact, cb);
      });
    }
});

server.listen(++options.port);
