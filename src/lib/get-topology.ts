﻿/// <reference path='../../Scripts/typings/node/node.d.ts' />
var once = require('once');
var parse = require('parse-mongo-url');
var mongodb = require('mongodb-core');

var Server = mongodb.Server;
var ReplSet = mongodb.ReplSet;
var MongoCR = mongodb.MongoCR;

var init = function (connString: string, cb: any) {
  cb = once(cb);
  var config = parse(connString);
  var srv;

  if (config.servers.length === 1) {
    var opts = config.server_options;
    opts.host = config.servers[0].host || 'localhost';
    opts.port = config.servers[0].port || 27017;
    opts.reconnect = true;
    opts.reconnectInterval = 50;
    srv = new Server(opts);
  } else {
    var rsopts = config.rs_options;
    rsopts.setName = rsopts.rs_name;
    rsopts.reconnect = true;
    rsopts.reconnectInterval = 50;
    srv = new ReplSet(config.servers, rsopts);
  }

  if (config.auth) {
    srv.addAuthProvider('mongocr', new MongoCR());
    srv.on('connect', function (server: any) {
      server.auth('mongocr', config.dbName, config.auth.user, config.auth.password, function (err: any, r: any) {
        if (err) {
          return cb(err);
        }
        cb(null, r);
      });
    });
  } else {
    srv.on('connect', function (server: any) {
      cb(null, server);
    });
  }

  srv.on('error', function (err: any) {
    cb(err);
  });

  srv.connect();
};

export = init;
