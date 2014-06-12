'use strict';

var redis = require('redis');
var debug = require('debug')('nano-services:sleepsort');
var sleepsort = require('sleep-sort');

var incoming = redis.createClient();
var outgoing = redis.createClient();


var from = module.filename + '-' + process.pid;

function send(name, data) {
    var message = {
        from: from,
        name: name,
        data: data
    };
    outgoing.publish('channel', JSON.stringify(message));
}

function receive(pattern, callback) {
    incoming.on('message', function(channel, json) {
        debug('Incoming message', channel, json);
        var message = JSON.parse(json);
        console.log(message, from);
        if (pattern.test(message.name))
            callback(message);
    });
}


incoming.on('subscribe', function (channel, count) {
    debug('Incoming subscribe', channel, count);
});


receive(/numbers/, function(message) {
    sleepsort(message.data, function(result) {
        console.log(result);
        send('sorted', result);
    });
});

incoming.subscribe('channel');

send('numbers', [ 5, 6, 7, 8, 2 , 10, 100, 200, 300, 500, 4]);
